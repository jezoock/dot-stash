import { describe, expect, it, vi } from 'vitest';
import './alert';
import { renderPage, trackFocus, wait } from '../../../test/helpers';
import { DS_ALERT_LIVE_DELAY } from './alert.constants';

type Alert = HTMLElement & { dismiss(): Promise<boolean>; live: string; type: string; heading: string; labels: unknown };

describe('ds-alert', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const alert = page.body.querySelector('ds-alert') as Alert;
    const part = (name: string) => alert.querySelector<HTMLElement>(`.ds-alert__${name}`);
    return { page, alert, part };
  };

  describe('rendering', () => {
    it('renders the content, the message after the prefix of its type, hidden on the screen; no title', async () => {
      const { alert, part } = await render('<ds-alert><p>Your session ends in 5 minutes.</p></ds-alert>');

      expect(alert).toHaveClasses(['ds-alert', '--info']);
      expect(alert).not.toHaveClass('--dismissible');
      expect(Array.from(alert.children).map(child => child.className)).toEqual(['ds-alert__content']);
      expect(Array.from(part('content').children).map(child => child.className)).toEqual(['ds-alert__title', 'ds-alert__body']);
      expect(part('title').hasAttribute('hidden')).toBe(true);
      expect(part('body').querySelector('p').textContent).toBe('Your session ends in 5 minutes.');
      expect(part('body').firstElementChild).toBe(part('prefix'));
      expect(part('prefix').textContent).toBe('Information:');
      expect(part('body').textContent.replace(/\s+/g, ' ').trim()).toBe('Information: Your session ends in 5 minutes.');
    });

    it.each([
      ['success', 'Success:'],
      ['warning', 'Warning:'],
      ['error', 'Error:'],
      ['info', 'Information:'],
      ['nope', 'Information:'],
    ])('type="%s": its class and its prefix', async (type, prefix) => {
      const { alert, part } = await render(`<ds-alert type="${type}">Message</ds-alert>`);

      expect(alert).toHaveClass(`--${type === 'nope' ? 'info' : type}`);
      expect(part('prefix').textContent).toBe(prefix);
    });

    it('follows a change of type: its class and its prefix', async () => {
      const { page, alert, part } = await render('<ds-alert type="success">Saved</ds-alert>');

      alert.type = 'error';
      await page.waitForChanges();

      expect(alert).toHaveClass('--error');
      expect(alert).not.toHaveClass('--success');
      expect(part('prefix').textContent).toBe('Error:');
    });

    it('renders its mods as classes', async () => {
      const { alert } = await render('<ds-alert mods="compact,wide">Message</ds-alert>');

      expect(alert).toHaveClasses(['ds-alert', '--compact', '--wide', '--info']);
    });
  });

  describe('title', () => {
    it('heading: a title before the message, the prefix in it, not a heading without level', async () => {
      const { part } = await render('<ds-alert type="error" heading="Payment failed"><p>Your card was declined.</p></ds-alert>');

      expect(part('title').hasAttribute('hidden')).toBe(false);
      expect(part('title').textContent.replace(/\s+/g, ' ').trim()).toBe('Error: Payment failed');
      expect(part('title').firstElementChild).toBe(part('prefix'));
      expect(part('title').hasAttribute('role')).toBe(false);
      expect(part('body').querySelector('.ds-alert__prefix')).toBeNull();
    });

    it.each([
      ['2', 'heading', '2'],
      ['6', 'heading', '6'],
      ['0', null, null],
      ['7', null, null],
      ['two', null, null],
    ])('level="%s": the title is a heading of that level, from 1 to 6', async (level, role, ariaLevel) => {
      const { part } = await render(`<ds-alert heading="Payment failed" level="${level}">Message</ds-alert>`);

      expect([part('title').getAttribute('role'), part('title').getAttribute('aria-level')]).toEqual([role, ariaLevel]);
    });

    it('level without a title: no heading', async () => {
      const { part } = await render('<ds-alert level="2">Message</ds-alert>');

      expect(part('title').hasAttribute('hidden')).toBe(true);
      expect(part('title').hasAttribute('role')).toBe(false);
    });

    it('a slot="title" heading of the page: in the title, with its own level (level is not applied), the prefix before it', async () => {
      const { part } = await render('<ds-alert type="warning" level="4"><h3 slot="title">Low stock</h3><p>Only 2 left.</p></ds-alert>');
      const heading = part('title').querySelector('h3');

      expect(heading.textContent).toBe('Low stock');
      expect(part('title').hasAttribute('hidden')).toBe(false);
      expect(part('title').hasAttribute('role')).toBe(false);
      expect(part('title').firstElementChild).toBe(part('prefix'));
      expect(part('body').querySelector('h3')).toBeNull();
    });

    it('a slot="title" text element: level makes the title a heading', async () => {
      const { part } = await render('<ds-alert level="3"><strong slot="title">Low stock</strong>Only 2 left.</ds-alert>');

      expect([part('title').getAttribute('role'), part('title').getAttribute('aria-level')]).toEqual(['heading', '3']);
    });
  });

  describe('texts', () => {
    it('labels translates the prefixes and the name of the dismiss button', async () => {
      const { part } = await render(`<ds-alert type="error" dismissible labels='{"error": "Erreur :", "dismiss": "Fermer le message"}'>Le paiement a échoué.</ds-alert>`);

      expect(part('prefix').textContent).toBe('Erreur :');
      expect(part('dismiss').getAttribute('aria-label')).toBe('Fermer le message');
    });

    it('an empty prefix leaves it out; an object as a property', async () => {
      const { page, alert, part } = await render(`<ds-alert type="success" labels='{"success": ""}' heading="Saved">Your changes are saved.</ds-alert>`);

      expect(part('prefix')).toBeNull();

      alert.labels = { success: 'Réussite :' };
      await page.waitForChanges();
      expect(part('prefix').textContent).toBe('Réussite :');
    });

    it('logs an error for labels that are not valid JSON, and keeps the English texts', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { part } = await render(`<ds-alert labels='{nope'>Message</ds-alert>`);

      expect(part('prefix').textContent).toBe('Information:');
      expect(error).toHaveBeenCalledWith('[ds-alert] labels is not valid JSON');
    });
  });

  describe('live region', () => {
    it('live="off" (default): no role, no aria-live, the content given at once', async () => {
      const { alert, part } = await render('<ds-alert type="error">Static message</ds-alert>');

      expect(alert).not.toHaveClass('--live');
      for (const name of ['role', 'aria-live', 'aria-atomic']) expect(part('content').hasAttribute(name)).toBe(false);
      expect([part('title').hasAttribute('aria-hidden'), part('body').hasAttribute('aria-hidden')]).toEqual([false, false]);
    });

    it.each([
      ['polite', 'status'],
      ['assertive', 'alert'],
    ])('live="%s": the content is a %s region, atomic', async (live, role) => {
      const { alert, part } = await render(`<ds-alert live="${live}">Message</ds-alert>`);

      expect(alert).toHaveClass('--live');
      expect(part('content')).toEqualAttributes({ 'role': role, 'aria-live': live, 'aria-atomic': 'true' });
    });

    it('an unknown live value is off', async () => {
      const { part } = await render('<ds-alert live="loud">Message</ds-alert>');

      expect(part('content').hasAttribute('role')).toBe(false);
    });

    it('a live alert renders its region first, then gives its content to assistive technologies after DS_ALERT_LIVE_DELAY', async () => {
      const { part, page } = await render('<ds-alert live="polite" heading="Saved">Your changes are saved.</ds-alert>');

      // The region, rendered, without content for assistive technologies; the content is shown on the screen all along.
      expect(part('content').getAttribute('role')).toBe('status');
      expect([part('title').getAttribute('aria-hidden'), part('body').getAttribute('aria-hidden')]).toEqual(['true', 'true']);

      await wait(DS_ALERT_LIVE_DELAY / 2);
      await page.waitForChanges();
      expect(part('body').getAttribute('aria-hidden')).toBe('true');

      await wait(DS_ALERT_LIVE_DELAY / 2 + 50);
      await page.waitForChanges();
      expect([part('title').hasAttribute('aria-hidden'), part('body').hasAttribute('aria-hidden')]).toEqual([false, false]);
    });

    it('an alert inserted by a script: the same, its region first', async () => {
      const { page } = await render('<div id="messages"></div>');
      const alert = page.doc.createElement('ds-alert');
      alert.setAttribute('live', 'assertive');
      alert.setAttribute('type', 'error');
      alert.textContent = 'The payment failed.';
      page.body.querySelector('#messages').appendChild(alert);
      await page.waitForChanges();
      const body = alert.querySelector('.ds-alert__body');

      expect([alert.querySelector('.ds-alert__content').getAttribute('role'), body.getAttribute('aria-hidden')]).toEqual(['alert', 'true']);
      await wait(DS_ALERT_LIVE_DELAY + 50);
      await page.waitForChanges();
      expect(body.hasAttribute('aria-hidden')).toBe(false);
    });

    it('made live at runtime: its region first, then its content', async () => {
      const { page, alert, part } = await render('<ds-alert>Message</ds-alert>');

      alert.live = 'polite';
      await page.waitForChanges();
      expect([part('content').getAttribute('role'), part('body').getAttribute('aria-hidden')]).toEqual(['status', 'true']);

      await wait(DS_ALERT_LIVE_DELAY + 50);
      await page.waitForChanges();
      expect(part('body').hasAttribute('aria-hidden')).toBe(false);

      // Off again: no region, the content stays.
      alert.live = 'off';
      await page.waitForChanges();
      expect([part('content').hasAttribute('role'), part('body').hasAttribute('aria-hidden')]).toEqual([false, false]);
    });

    it('a hidden live alert keeps its content back until it is shown, then gives it after the delay', async () => {
      const observers: { callback: MutationCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
      class FakeMutationObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        constructor(public callback: MutationCallback) {
          observers.push(this);
        }
      }
      vi.stubGlobal('MutationObserver', FakeMutationObserver);
      const { page, alert, part } = await render('<ds-alert live="polite" hidden>Your changes are saved.</ds-alert>');
      const [observer] = observers;
      const notify = (record: Partial<MutationRecord>) => observer.callback([record as MutationRecord], observer as unknown as MutationObserver);

      expect(observer.observe).toHaveBeenCalledWith(alert, expect.objectContaining({ attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true }));
      await wait(DS_ALERT_LIVE_DELAY + 50);
      await page.waitForChanges();
      expect(part('body').getAttribute('aria-hidden')).toBe('true');

      alert.removeAttribute('hidden');
      notify({ type: 'attributes', target: alert, attributeName: 'hidden', oldValue: '' });
      await page.waitForChanges();
      expect(part('body').getAttribute('aria-hidden')).toBe('true');
      await wait(DS_ALERT_LIVE_DELAY + 50);
      await page.waitForChanges();
      expect(part('body').hasAttribute('aria-hidden')).toBe(false);

      // Hidden again (dismissed): kept back again, for the next time it is shown.
      alert.setAttribute('hidden', '');
      notify({ type: 'attributes', target: alert, attributeName: 'hidden', oldValue: null });
      await page.waitForChanges();
      expect(part('body').getAttribute('aria-hidden')).toBe('true');

      alert.remove();
      await page.waitForChanges();
      expect(observer.disconnect).toHaveBeenCalled();
    });

    it('follows a slot="title" element added later', async () => {
      const observers: { callback: MutationCallback }[] = [];
      vi.stubGlobal(
        'MutationObserver',
        class {
          observe = vi.fn();
          disconnect = vi.fn();
          constructor(public callback: MutationCallback) {
            observers.push(this);
          }
        },
      );
      const { page, alert, part } = await render('<ds-alert level="2">Message</ds-alert>');
      const title = page.doc.createElement('h2');
      title.setAttribute('slot', 'title');
      title.textContent = 'Heads up';
      alert.appendChild(title);
      observers[0].callback([{ type: 'childList', target: alert, addedNodes: [title] } as unknown as MutationRecord], null);
      await page.waitForChanges();

      expect(part('title').hasAttribute('hidden')).toBe(false);
      // A heading element of the page: its own level.
      expect(part('title').hasAttribute('role')).toBe(false);
    });
  });

  describe('dismiss', () => {
    it('dismissible renders a button after the content, named "Dismiss"', async () => {
      const { alert, part } = await render('<ds-alert dismissible>Message</ds-alert>');
      const button = part('dismiss');

      expect(alert).toHaveClass('--dismissible');
      expect(Array.from(alert.children).map(child => child.className)).toEqual(['ds-alert__content', 'ds-alert__dismiss']);
      expect(button).toEqualAttributes({ 'type': 'button', 'aria-label': 'Dismiss' });
      expect(button.textContent).toBe('');
    });

    it('a click emits alertDismiss (cancelable), hides the alert, then emits alertDismissed', async () => {
      const { alert, part } = await render('<ds-alert dismissible>Message</ds-alert>');
      const events: [string, boolean][] = [];
      alert.addEventListener('alertDismiss', (event: CustomEvent) => events.push([event.type, event.cancelable]));
      alert.addEventListener('alertDismissed', (event: CustomEvent) => events.push([event.type, alert.hasAttribute('hidden')]));

      part('dismiss').click();

      expect(events).toEqual([
        ['alertDismiss', true],
        ['alertDismissed', true],
      ]);
      expect(alert.hasAttribute('hidden')).toBe(true);
    });

    it('alertDismiss cancelled: the alert stays, no alertDismissed', async () => {
      const { alert, part } = await render('<ds-alert dismissible>Message</ds-alert>');
      const dismissed = vi.fn();
      alert.addEventListener('alertDismiss', event => event.preventDefault());
      alert.addEventListener('alertDismissed', dismissed);

      part('dismiss').click();

      expect([alert.hasAttribute('hidden'), dismissed.mock.calls.length]).toEqual([false, 0]);
      expect(await alert.dismiss()).toBe(false);
    });

    it('dismiss() dismisses it without the button, once', async () => {
      const { alert } = await render('<ds-alert>Message</ds-alert>');
      const dismissed = vi.fn();
      alert.addEventListener('alertDismissed', dismissed);

      expect(await alert.dismiss()).toBe(true);
      expect(await alert.dismiss()).toBe(false);
      expect([alert.hasAttribute('hidden'), dismissed.mock.calls.length]).toEqual([true, 1]);
    });

    it('the focus in the alert goes to the next element of the Tab order', async () => {
      const focused = trackFocus();
      const { page, part } = await render('<a id="before" href="#">Before</a><ds-alert dismissible><a href="#">Details</a></ds-alert><div><button id="next">Next</button></div>');
      part('dismiss').focus();

      part('dismiss').click();

      expect(focused()).toBe(page.body.querySelector('#next'));
    });

    it('without a next element, to the previous one; without any, the focus leaves the alert', async () => {
      const focused = trackFocus();
      const { page, alert, part } = await render('<a id="before" href="#">Before</a><ds-alert dismissible>Message</ds-alert><button disabled>Off</button>');
      part('dismiss').focus();

      part('dismiss').click();
      expect(focused()).toBe(page.body.querySelector('#before'));

      page.body.querySelector('#before').remove();
      alert.removeAttribute('hidden');
      part('dismiss').focus();
      const blur = vi.spyOn(part('dismiss'), 'blur');
      await alert.dismiss();
      expect(blur).toHaveBeenCalled();
    });

    it('leaves the focus alone when it is not in the alert', async () => {
      const focused = trackFocus();
      const { page, alert } = await render('<button id="other">Other</button><ds-alert dismissible>Message</ds-alert><button id="next">Next</button>');
      page.body.querySelector<HTMLElement>('#other').focus();

      await alert.dismiss();

      expect(focused().id).toBe('other');
    });
  });
});
