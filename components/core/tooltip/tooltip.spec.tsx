import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './tooltip';
import { TOOLTIP_HIDE_DELAY } from './tooltip.constants';
import { renderPage, wait } from '../../../test/helpers';

describe('ds-tooltip', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const box = page.root.querySelector<HTMLElement>('.ds-tooltip');
    const message = page.root.querySelector<HTMLElement>('[slot="message"]');
    const isShown = () => box.classList.contains('--is-shown');
    return { page, box, message, isShown };
  };

  const mouse = (target: Element, type: 'mouseover' | 'mouseout', relatedTarget: EventTarget | null = null) =>
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, relatedTarget }));
  const focus = (target: Element, type: 'focusin' | 'focusout', relatedTarget: EventTarget | null = null) =>
    target.dispatchEvent(new FocusEvent(type, { bubbles: true, relatedTarget }));
  const escape = (target: EventTarget = document) => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  describe('roles and attributes', () => {
    it('gives the message role="tooltip" and an id, which the focusable element of the content references', async () => {
      const { box, message } = await render('<ds-tooltip><button aria-describedby="other">Help</button><span slot="message">Opens the help center</span></ds-tooltip>');
      const button = box.querySelector('button');

      expect(message).toEqualAttributes({ role: 'tooltip' });
      expect(message.id).toMatch(/^ds-tooltip-\d+-message$/);
      // The ids it had are kept.
      expect(button.getAttribute('aria-describedby')).toBe(`other ${message.id}`);
      expect(box.hasAttribute('tabindex')).toBe(false);
      expect(box.hasAttribute('aria-describedby')).toBe(false);
    });

    it('makes the tooltip box focusable, described by the message, when the content has no focusable element', async () => {
      const { box, message } = await render('<ds-tooltip icon="info"><span>VAT</span><span slot="message" id="vat-help">Value added tax, 20%</span></ds-tooltip>');

      expect(message.id).toBe('vat-help');
      expect(box).toEqualAttributes({ 'tabindex': '0', 'aria-describedby': 'vat-help' });
    });

    it('does not take the message or the content of a tooltip in its content', async () => {
      const page = await renderPage(
        '<ds-tooltip id="outer"><ds-tooltip id="inner"><a href="#a">Inner</a><span slot="message">Inner message</span></ds-tooltip><span slot="message">Outer message</span></ds-tooltip>',
      );
      const outer = page.body.querySelector('#outer');
      const inner = page.body.querySelector('#inner');
      const outerMessage = Array.from(outer.querySelectorAll('[slot="message"]')).find(message => message.textContent === 'Outer message');

      expect(inner.querySelector('a').getAttribute('aria-describedby')).toBe(inner.querySelector('[slot="message"]').id);
      expect(outer.querySelector('.ds-tooltip').getAttribute('aria-describedby')).toBe(outerMessage.id);
    });

    it('is neither focusable nor describing while disabled', async () => {
      const { page, box } = await render('<ds-tooltip><button>Help</button><span slot="message">Message</span></ds-tooltip>');
      const button = box.querySelector('button');

      page.root.isDisabled = true;
      await page.waitForChanges();
      expect(button.hasAttribute('aria-describedby')).toBe(false);
      expect(box.hasAttribute('tabindex')).toBe(false);

      focus(button, 'focusin');
      mouse(button, 'mouseover');
      await page.waitForChanges();
      expect(box).not.toHaveClass('--is-shown');
    });
  });

  describe('keyboard', () => {
    it('shows the message while the content has the focus', async () => {
      const { page, box, isShown } = await render('<ds-tooltip><button>Help</button><span slot="message">Message</span></ds-tooltip>');
      const button = box.querySelector('button');

      focus(button, 'focusin');
      await page.waitForChanges();
      expect(isShown()).toBe(true);

      focus(button, 'focusout', page.body);
      await page.waitForChanges();
      expect(isShown()).toBe(false);
    });

    it('hides the message on Escape, without moving the focus, and the key press goes no further', async () => {
      const { page, box, isShown } = await render('<ds-tooltip><button>Help</button><span slot="message">Message</span></ds-tooltip>');
      const button = box.querySelector('button');
      // The simulated DOM has no capture phase: the document listener of the tooltip comes last but for the window's.
      const outer = vi.fn();
      page.win.addEventListener('keydown', outer);

      focus(button, 'focusin');
      await page.waitForChanges();
      expect(escape(button).defaultPrevented).toBe(false);
      await page.waitForChanges();
      expect(isShown()).toBe(false);
      expect(outer).not.toHaveBeenCalled();

      // Hidden, Escape goes on as usual.
      escape(button);
      expect(outer).toHaveBeenCalledTimes(1);
      page.win.removeEventListener('keydown', outer);

      // The focus comes back: shown again.
      focus(button, 'focusout', page.body);
      focus(button, 'focusin');
      await page.waitForChanges();
      expect(isShown()).toBe(true);
    });
  });

  describe('pointer', () => {
    it('stays shown while the pointer goes from the content to the message, and hides once it has left both', async () => {
      const { page, box, message, isShown } = await render('<ds-tooltip><span id="content">VAT</span><span slot="message">Message</span></ds-tooltip>');
      const content = box.querySelector('#content');

      mouse(content, 'mouseover');
      await page.waitForChanges();
      expect(isShown()).toBe(true);

      // From the content to the message: in the tooltip.
      mouse(content, 'mouseout', message);
      mouse(message, 'mouseover', content);
      await page.waitForChanges();
      expect(isShown()).toBe(true);

      // Out of the tooltip, then back over the message across the offset before the delay.
      mouse(message, 'mouseout', page.body);
      await wait(TOOLTIP_HIDE_DELAY / 3);
      mouse(message, 'mouseover', page.body);
      await wait(TOOLTIP_HIDE_DELAY);
      await page.waitForChanges();
      expect(isShown()).toBe(true);

      mouse(message, 'mouseout', page.body);
      await wait(TOOLTIP_HIDE_DELAY + 20);
      await page.waitForChanges();
      expect(isShown()).toBe(false);
    });

    it('hides on Escape while hovered, and stays hidden until the pointer leaves and comes back', async () => {
      const { page, box, isShown } = await render('<ds-tooltip><span id="content">VAT</span><span slot="message">Message</span></ds-tooltip>');
      const content = box.querySelector('#content');

      mouse(content, 'mouseover');
      await page.waitForChanges();
      escape();
      await page.waitForChanges();
      expect(isShown()).toBe(false);

      mouse(content, 'mouseover');
      await page.waitForChanges();
      expect(isShown()).toBe(false);

      mouse(content, 'mouseout', page.body);
      mouse(content, 'mouseover', page.body);
      await page.waitForChanges();
      expect(isShown()).toBe(true);
    });

    it('stays shown while focused when the pointer leaves', async () => {
      const { page, box, isShown } = await render('<ds-tooltip><button>Help</button><span slot="message">Message</span></ds-tooltip>');
      const button = box.querySelector('button');

      mouse(button, 'mouseover');
      focus(button, 'focusin');
      mouse(button, 'mouseout', page.body);
      await wait(TOOLTIP_HIDE_DELAY + 20);
      await page.waitForChanges();

      expect(isShown()).toBe(true);
    });
  });

  describe('touch screens', () => {
    // A touch screen: 'ontouchstart' in window (the tooltip), 'ontouchend' in window (Stencil then listens to touchend).
    // On the prototype, as each spec page has a window of its own.
    beforeEach(() => {
      for (const name of ['ontouchstart', 'ontouchend']) Object.defineProperty(Object.getPrototypeOf(window), name, { configurable: true, writable: true, value: null });
    });

    afterEach(() => {
      for (const name of ['ontouchstart', 'ontouchend']) delete Object.getPrototypeOf(window)[name];
    });

    it('toggles on a tap, not on the mouse events of the tap', async () => {
      const { page, box, isShown } = await render('<ds-tooltip><span id="content">VAT</span><span slot="message">Message</span></ds-tooltip>');
      const content = box.querySelector('#content');

      mouse(content, 'mouseover');
      await page.waitForChanges();
      expect(isShown()).toBe(false);

      content.dispatchEvent(new Event('touchend', { bubbles: true }));
      await page.waitForChanges();
      expect(isShown()).toBe(true);

      mouse(content, 'mouseout', page.body);
      await wait(TOOLTIP_HIDE_DELAY + 20);
      await page.waitForChanges();
      expect(isShown()).toBe(true);

      content.dispatchEvent(new Event('touchend', { bubbles: true }));
      await page.waitForChanges();
      expect(isShown()).toBe(false);
    });
  });

  it('shows and hides on the request events', async () => {
    const { page, isShown } = await render('<ds-tooltip><span>VAT</span><span slot="message">Message</span></ds-tooltip>');

    page.root.dispatchEvent(new CustomEvent('request_tooltipShow_event'));
    await page.waitForChanges();
    expect(isShown()).toBe(true);

    page.root.dispatchEvent(new CustomEvent('request_tooltipToggle_event', { detail: { mustShow: false } }));
    await page.waitForChanges();
    expect(isShown()).toBe(false);
  });
});
