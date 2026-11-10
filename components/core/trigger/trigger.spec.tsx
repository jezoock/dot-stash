import { describe, expect, it, vi, type Mock } from 'vitest';
import './trigger';
import { keydown, keyup, renderPage } from '../../../test/helpers';

describe('ds-trigger', () => {
  const render = async (triggerAttributes: string, content = 'Go') => {
    const page = await renderPage(`<div id="slider"></div><ds-trigger ${triggerAttributes}>${content}</ds-trigger>`);
    const target = page.body.querySelector('#slider') as HTMLElement & Record<string, Mock>;
    target.next = vi.fn();
    target.goTo = vi.fn();
    const trigger = page.body.querySelector('ds-trigger');
    return { page, target, trigger };
  };

  it('calls the target action on click by default', async () => {
    const { target, trigger } = await render('target="#slider" action="next"');

    trigger.click();

    expect(target.next).toHaveBeenCalledTimes(1);
    expect(target.next).toHaveBeenCalledWith();
  });

  it('passes the JSON arguments of the action', async () => {
    const { target, trigger } = await render(`target="#slider" action='goTo:[2, "smooth"]'`);

    trigger.click();

    expect(target.goTo).toHaveBeenCalledWith(2, 'smooth');
  });

  it('listens to the event named by on', async () => {
    const { target, trigger } = await render('target="#slider" action="next" on="mouseenter"');

    trigger.click();
    expect(target.next).not.toHaveBeenCalled();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    expect(target.next).toHaveBeenCalledTimes(1);
  });

  it('does nothing while disabled', async () => {
    const { page, target, trigger } = await render('target="#slider" action="next" disabled');

    trigger.click();
    expect(target.next).not.toHaveBeenCalled();

    trigger.disabled = false;
    await page.waitForChanges();
    trigger.click();
    expect(target.next).toHaveBeenCalledTimes(1);
  });

  it('stops listening once removed', async () => {
    const { page, target, trigger } = await render('target="#slider" action="next"');

    trigger.remove();
    await page.waitForChanges();
    trigger.click();

    expect(target.next).not.toHaveBeenCalled();
  });
  describe('accessibility', () => {
    const aria = (trigger: HTMLElement) => ['role', 'tabindex', 'aria-disabled', 'aria-label'].map(name => trigger.getAttribute(name));

    it.each(['control', 'button', 'link'])('a %s trigger with a text is a focusable button', async type => {
      const { trigger } = await render(`type="${type}" target="#slider" action="next"`);

      expect(aria(trigger)).toEqual(['button', '0', null, null]);
    });

    it('Enter clicks it (the action and the click listeners run), once per key press', async () => {
      const { target, trigger } = await render('target="#slider" action="next"');
      const onClick = vi.fn();
      trigger.addEventListener('click', onClick);

      expect(keydown(trigger, 'Enter').defaultPrevented).toBe(true);
      keydown(trigger, 'Enter', { repeat: true });

      expect(target.next).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('Space clicks it on keyup, after a keydown on it, without scrolling the page', async () => {
      const { target, trigger } = await render('target="#slider" action="next"');

      expect(keydown(trigger, ' ').defaultPrevented).toBe(true);
      expect(target.next).not.toHaveBeenCalled();
      expect(keyup(trigger, ' ').defaultPrevented).toBe(true);
      expect(target.next).toHaveBeenCalledTimes(1);

      // A keyup without a keydown on it (the focus came from another element): nothing.
      keyup(trigger, ' ');
      expect(target.next).toHaveBeenCalledTimes(1);
    });

    it('ignores the keys with a modifier and the other keys', async () => {
      const { target, trigger } = await render('target="#slider" action="next"');

      for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) keydown(trigger, 'Enter', { [modifier]: true });
      expect(keydown(trigger, 'a').defaultPrevented).toBe(false);

      expect(target.next).not.toHaveBeenCalled();
    });

    it('disabled, it is aria-disabled, cannot be focused and ignores the keys; enabled, it is focusable again', async () => {
      const { page, target, trigger } = await render('target="#slider" action="next" disabled');

      expect(aria(trigger)).toEqual(['button', null, 'true', null]);
      expect(keydown(trigger, 'Enter').defaultPrevented).toBe(false);
      keydown(trigger, ' ');
      keyup(trigger, ' ');
      expect(target.next).not.toHaveBeenCalled();

      trigger.disabled = false;
      await page.waitForChanges();
      expect(aria(trigger)).toEqual(['button', '0', null, null]);
    });

    it('is named by label (aria-label), and keeps an aria-label of the page', async () => {
      const { trigger } = await render('target="#slider" action="next" label="Next slide"', '<ds-icon type="right"></ds-icon>');
      expect(aria(trigger)).toEqual(['button', '0', null, 'Next slide']);

      const { trigger: labelled } = await render('type="button" aria-label="Previous image"', '');
      expect(aria(labelled)).toEqual(['button', '0', null, 'Previous image']);
    });

    it.each([
      ['a native button', '<button type="button">Menu</button>'],
      ['a link', '<a href="/docs">Docs</a>'],
      ['a focusable element', '<span tabindex="0">Menu</span>'],
    ])('wrapping %s, it adds no role, no focus and no keys: the click of that control calls the action', async (_, content) => {
      const { target, trigger } = await render('target="#slider" action="next" label="Ignored" disabled', content);
      const control = trigger.firstElementChild as HTMLElement;

      expect(aria(trigger)).toEqual([null, null, null, null]);
      expect(keydown(control, 'Enter').defaultPrevented).toBe(false);
      expect(keydown(trigger, 'Enter').defaultPrevented).toBe(false);

      trigger.disabled = false;
      control.click();
      expect(target.next).toHaveBeenCalledTimes(1);
    });

    it('is not a button when it calls on another event than click', async () => {
      const { trigger } = await render('target="#slider" action="next" on="mouseenter"');

      expect(aria(trigger)).toEqual([null, null, null, null]);
      expect(keydown(trigger, 'Enter').defaultPrevented).toBe(false);
    });

    it('keeps the role the element has: Space does not click a link', async () => {
      const { trigger: tab } = await render('target="#slider" action="next" role="tab"');
      expect(aria(tab)).toEqual(['tab', '0', null, null]);

      const { target, trigger: link } = await render('type="link" target="#slider" action="next" role="link"');
      expect(keydown(link, ' ').defaultPrevented).toBe(false);
      keyup(link, ' ');
      expect(target.next).not.toHaveBeenCalled();
      keydown(link, 'Enter');
      expect(target.next).toHaveBeenCalledTimes(1);
    });

    it('gives up its role when a control is added to its content later (with MutationObserver, in browsers)', async () => {
      const observers: { callback: () => void; observe: Mock; disconnect: Mock }[] = [];
      class FakeMutationObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        constructor(public callback: () => void) {
          observers.push(this);
        }
      }
      const page = await renderPage('');
      vi.stubGlobal('MutationObserver', FakeMutationObserver);
      await page.setContent('<ds-trigger>Menu</ds-trigger>');
      const trigger = page.body.querySelector('ds-trigger');
      const [observer] = observers;
      expect(observer.observe).toHaveBeenCalledWith(trigger, { childList: true, subtree: true });
      expect(aria(trigger)[0]).toBe('button');

      trigger.appendChild(page.doc.createElement('button'));
      observer.callback();
      await page.waitForChanges();
      expect(aria(trigger)).toEqual([null, null, null, null]);

      trigger.remove();
      expect(observer.disconnect).toHaveBeenCalled();
    });
  });
});
