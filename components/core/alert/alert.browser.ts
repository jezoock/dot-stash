import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { accessibleNode, focused, mount, nextFrame, recordEvents, setForcedColors } from '../../../test/helpers/browser';
import { DS_ALERT_LIVE_DELAY } from './alert.constants';

type Alert = HTMLElement & { dismiss(): Promise<boolean>; componentOnReady(): Promise<unknown> };

/** Inserts an element in the body and waits for the components in it. */
const insert = async <T extends HTMLElement>(html: string): Promise<T> => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const element = template.content.firstElementChild as T;
  document.body.append(element);
  await customElements.whenDefined('ds-alert');
  await (element as unknown as Alert).componentOnReady();
  return element;
};

describe('ds-alert in a browser', () => {
  describe('accessibility tree', () => {
    it('a static alert: not a live region; its title a heading named with the prefix; the icon not read; the button named', async () => {
      await mount(`
        <ds-alert id="static" type="error" heading="Payment failed" level="2" dismissible><p>Your card was declined.</p></ds-alert>
        <ds-alert id="plain" type="warning"><p>Stock is low.</p></ds-alert>`);

      expect(await accessibleNode('#static .ds-alert__title')).toMatchObject({ role: 'heading', name: 'Error: Payment failed', properties: { level: 2 } });
      expect(await accessibleNode('#static .ds-alert__dismiss')).toMatchObject({ role: 'button', name: 'Dismiss', properties: { focusable: true } });
      expect(await accessibleNode('#static p')).toMatchObject({ role: 'paragraph' });
      // Neither the alert nor its content is a live region (an ignored generic element, or one without live properties).
      for (const selector of ['#static', '#static .ds-alert__content', '#plain', '#plain .ds-alert__content']) {
        const node = await accessibleNode(selector);
        expect([selector, node?.role ?? null, node?.properties.live ?? null]).toEqual([selector, node ? expect.not.stringMatching(/^(alert|status)$/) : null, null]);
      }
      // The icon has an empty alternative text: no text of its own in the alert.
      expect(getComputedStyle(document.querySelector('#plain'), '::before').content).toBe('"" / ""');
      expect(document.querySelector('#plain .ds-alert__prefix').textContent).toBe('Warning:');
    });

    it('the prefix is hidden on the screen and read before the message', async () => {
      const alert = await mount('<ds-alert type="success"><p>Saved.</p></ds-alert>');
      const prefix = alert.querySelector('.ds-alert__prefix');
      const box = prefix.getBoundingClientRect();

      expect([box.width, box.height, getComputedStyle(prefix).clipPath, getComputedStyle(prefix).position]).toEqual([1, 1, 'inset(50%)', 'absolute']);
      expect(alert.querySelector('.ds-alert__body').textContent.replace(/\s+/g, ' ').trim()).toBe('Success: Saved.');
    });
  });

  describe('live region', () => {
    it.each([
      ['polite', 'status'],
      ['assertive', 'alert'],
    ])('live="%s", inserted by a script: the %s region is in the tree first, its content reaches it after the delay', async (live, role) => {
      await mount('<main></main>');
      const inserted = performance.now();
      const alert = await insert<Alert>(`<ds-alert live="${live}" type="error"><p>The payment failed.</p></ds-alert>`);
      await nextFrame();

      // The region, empty for assistive technologies, while the message shows on the screen.
      expect(await accessibleNode('ds-alert .ds-alert__content')).toMatchObject({ role, properties: { live, atomic: true } });
      expect(await accessibleNode('ds-alert p')).toBeNull();
      expect(alert.querySelector('p').getBoundingClientRect().height).toBeGreaterThan(0);

      await expect.poll(() => accessibleNode('ds-alert p'), { timeout: DS_ALERT_LIVE_DELAY * 4 }).toMatchObject({ role: 'paragraph' });
      expect(performance.now() - inserted).toBeGreaterThanOrEqual(DS_ALERT_LIVE_DELAY);
      expect(await accessibleNode('ds-alert .ds-alert__content')).toMatchObject({ role, properties: { live, atomic: true } });
    });

    it('a change of the content of a live alert happens in a region that is already there', async () => {
      const alert = await mount<Alert>('<ds-alert live="polite" type="success"><p id="text">Saving…</p></ds-alert>');
      await expect.poll(() => accessibleNode('#text'), { timeout: DS_ALERT_LIVE_DELAY * 4 }).toMatchObject({ role: 'paragraph' });
      // The region the screen reader knows, before the change.
      const region = await accessibleNode('ds-alert .ds-alert__content');

      alert.querySelector('#text').textContent = 'Your changes are saved.';

      expect(region).toMatchObject({ role: 'status', properties: { live: 'polite', atomic: true, relevant: 'additions text' } });
      await expect.poll(async () => (await accessibleNode('#text'))?.role).toBe('paragraph');
      expect(alert.querySelector('.ds-alert__body').hasAttribute('aria-hidden')).toBe(false);
    });

    it('a hidden live alert, shown: its content waits again, then reaches the region', async () => {
      const alert = await mount<Alert>('<ds-alert live="polite" hidden><p id="text">Saved.</p></ds-alert>');
      await new Promise(resolve => setTimeout(resolve, DS_ALERT_LIVE_DELAY + 100));
      expect(alert.querySelector('.ds-alert__body').getAttribute('aria-hidden')).toBe('true');

      alert.removeAttribute('hidden');
      await nextFrame();
      expect(await accessibleNode('ds-alert .ds-alert__content')).toMatchObject({ role: 'status' });
      expect(await accessibleNode('#text')).toBeNull();
      await expect.poll(() => accessibleNode('#text'), { timeout: DS_ALERT_LIVE_DELAY * 4 }).toMatchObject({ role: 'paragraph' });
    });
  });

  describe('dismiss', () => {
    it('Enter on the dismiss button hides the alert and moves the focus to the next element of the Tab order', async () => {
      await mount(`
        <a id="before" href="#">Before</a>
        <ds-alert dismissible><p>Your password expires soon. <a id="inside" href="#">Change it</a></p></ds-alert>
        <p>Text</p><button id="next">Next</button>`);
      const alert = document.querySelector<Alert>('ds-alert');
      const events = recordEvents(alert, ['alertDismiss', 'alertDismissed']);
      document.querySelector<HTMLElement>('#before').focus();

      await userEvent.tab();
      await userEvent.tab();
      expect(focused()).toBe(alert.querySelector('.ds-alert__dismiss'));
      await userEvent.keyboard('{Enter}');

      expect(events).toEqual(['alertDismiss', 'alertDismissed']);
      expect([alert.hidden, getComputedStyle(alert).display, focused()?.id]).toEqual([true, 'none', 'next']);
      expect(await accessibleNode('ds-alert .ds-alert__dismiss')).toBeNull();
    });

    it('Space too; without a next element, the focus goes to the previous one', async () => {
      await mount('<button id="before">Before</button><ds-alert dismissible>Message</ds-alert>');
      const alert = document.querySelector<Alert>('ds-alert');
      alert.querySelector<HTMLElement>('.ds-alert__dismiss').focus();

      await userEvent.keyboard(' ');

      expect([alert.hidden, focused()?.id]).toEqual([true, 'before']);
      // The hidden button is out of the Tab order.
      await userEvent.tab();
      expect(focused()).not.toBe(alert.querySelector('.ds-alert__dismiss'));
    });

    it('a click dismisses it; a cancelled alertDismiss keeps it, and the focus', async () => {
      await mount('<ds-alert dismissible>Message</ds-alert><button id="next">Next</button>');
      const alert = document.querySelector<Alert>('ds-alert');
      const button = alert.querySelector<HTMLElement>('.ds-alert__dismiss');
      const cancel = (event: Event) => event.preventDefault();
      alert.addEventListener('alertDismiss', cancel);

      await userEvent.click(button);
      expect([alert.hidden, focused()]).toEqual([false, button]);

      alert.removeEventListener('alertDismiss', cancel);
      await userEvent.click(button);
      expect([alert.hidden, focused()?.id]).toEqual([true, 'next']);
    });
  });

  describe('look', () => {
    it('draws the icon of each type in its status color, on the first line, with the border on the start side', async () => {
      await mount(['info', 'success', 'warning', 'error'].map(type => `<ds-alert type="${type}">Message</ds-alert>`).join(''));
      const alerts = Array.from(document.querySelectorAll('ds-alert'));
      const images = new Set<string>();

      for (const alert of alerts) {
        const style = getComputedStyle(alert);
        const icon = getComputedStyle(alert, '::before');
        images.add(icon.maskImage);
        expect([icon.backgroundColor, icon.width, icon.height]).toEqual([style.borderLeftColor, '20px', '24px']);
        expect([style.borderLeftWidth, style.borderRightWidth, style.borderLeftStyle]).toEqual(['4px', '1px', 'solid']);
        expect(style.borderLeftColor).not.toBe(style.color);
      }
      // Four shapes, four colors: the type does not rest on the color only.
      expect(images.size).toBe(4);
      expect(new Set(alerts.map(alert => getComputedStyle(alert).borderLeftColor)).size).toBe(4);
    });

    it('right to left: the icon on the right, the border on the right, the dismiss button on the left', async () => {
      document.documentElement.dir = 'rtl';
      const alert = await mount('<ds-alert dismissible type="error">Message</ds-alert>');
      const content = alert.querySelector('.ds-alert__content').getBoundingClientRect();
      const button = alert.querySelector('.ds-alert__dismiss').getBoundingClientRect();
      const box = alert.getBoundingClientRect();

      expect([getComputedStyle(alert).borderRightWidth, getComputedStyle(alert).borderLeftWidth]).toEqual(['4px', '1px']);
      expect(button.right).toBeLessThan(content.left);
      // The icon column, on the right of the content.
      expect(box.right - content.right).toBeGreaterThan(30);
    });

    it('keeps the frame, the icons and the focus indicator visible in forced colors', async () => {
      await mount('<ds-alert type="success" dismissible>Message</ds-alert><button id="next">Next</button>');
      await setForcedColors(true);
      await nextFrame();
      const alert = document.querySelector('ds-alert');
      const button = alert.querySelector<HTMLElement>('.ds-alert__dismiss');
      const style = getComputedStyle(alert);

      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        expect([side, style[`border${side}Style`], style[`border${side}Color`] === 'rgba(0, 0, 0, 0)']).toEqual([side, 'solid', false]);
      }
      for (const [element, pseudo] of [
        [alert, '::before'],
        [button, '::before'],
      ] as const) {
        const icon = getComputedStyle(element, pseudo);
        expect([icon.forcedColorAdjust, icon.backgroundColor]).toEqual(['preserve-parent-color', getComputedStyle(element).color]);
      }

      document.querySelector<HTMLElement>('#next').focus();
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      expect([focused(), getComputedStyle(button).outlineStyle, getComputedStyle(button).outlineWidth]).toEqual([button, 'solid', '2px']);
    });
  });
});
