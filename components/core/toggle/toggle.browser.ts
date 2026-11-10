import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focused, formEntries, mount, recordEvents } from '../../../test/helpers/browser';

type Toggle = HTMLDsToggleElement & HTMLElement;

describe('ds-toggle in a browser', () => {
  describe('keyboard', () => {
    it.each(['checkbox', 'switch', 'icon'])('Space toggles a %s, once per key press, without scrolling the page', async type => {
      await mount(`<ds-toggle type="${type}" label="Option"></ds-toggle><div style="height: 3000px"></div>`);
      const toggle = document.querySelector<Toggle>('ds-toggle');
      const toggles = recordEvents(toggle, ['toggle'], event => (event as CustomEvent).detail.checked);

      toggle.focus();
      await userEvent.keyboard(' ');
      expect(toggle.checked).toBe(true);
      await userEvent.keyboard(' ');
      expect(toggle.checked).toBe(false);

      expect(toggles).toEqual([true, false]);
      expect(window.scrollY).toBe(0);
    });

    it('Space checks a radio, and does not uncheck it', async () => {
      const toggle = await mount<Toggle>('<ds-toggle type="radio" value="a" label="A"></ds-toggle>');

      toggle.focus();
      await userEvent.keyboard('  ');

      expect(toggle.checked).toBe(true);
    });

    it.each([
      ['switch', true],
      ['icon', true],
      ['checkbox', false],
      ['radio', false],
    ])('Enter on a %s toggles it: %s', async (type, toggles) => {
      const toggle = await mount<Toggle>(`<ds-toggle type="${type}" label="Option"></ds-toggle>`);

      toggle.focus();
      await userEvent.keyboard('{Enter}');

      expect(!!toggle.checked).toBe(toggles);
    });

    it('Tab reaches an enabled toggle, not a disabled one', async () => {
      await mount('<button>Before</button><ds-toggle label="Off" disabled></ds-toggle><ds-toggle label="On"></ds-toggle>');
      const [disabled, enabled] = Array.from(document.querySelectorAll<Toggle>('ds-toggle'));
      document.querySelector('button').focus();

      await userEvent.tab();

      expect(focused()).toBe(enabled);
      expect(focused()).not.toBe(disabled);
    });
  });

  describe('focus right after it is shown', () => {
    it.each(['checkbox', 'radio', 'switch', 'icon'])('a toggle of type %s takes the focus in the frame it is shown: its visibility does not transition', async type => {
      await mount(`<div id="box" style="visibility: hidden"><ds-toggle type="${type}" label="Option"></ds-toggle></div>`);
      const toggle = document.querySelector<Toggle>('ds-toggle');

      document.querySelector<HTMLElement>('#box').style.visibility = 'visible';
      toggle.focus();

      expect(focused()).toBe(toggle);
      expect(toggle.getAnimations().map(animation => (animation as CSSTransition).transitionProperty)).not.toContain('visibility');
    });

    it('takes the focus as soon as it is hydrated, without waiting for a frame', async () => {
      document.body.innerHTML = '<ds-toggle type="checkbox" label="Option"></ds-toggle>';
      const toggle = document.querySelector<Toggle>('ds-toggle');
      await customElements.whenDefined('ds-toggle');
      await toggle.componentOnReady();

      toggle.focus();
      expect(focused()).toBe(toggle);
    });

    it('still animates its changes of state: the border, the mark and the knob', async () => {
      const checkbox = await mount<Toggle>('<ds-toggle type="checkbox" label="Option"></ds-toggle>');
      checkbox.click();
      const properties = (element: Element, pseudo?: string) =>
        element
          .getAnimations({ subtree: true })
          .filter(animation => (animation.effect as KeyframeEffect).pseudoElement === (pseudo ?? null))
          .map(animation => (animation as CSSTransition).transitionProperty)
          .sort();
      await expect.poll(() => properties(checkbox)).toEqual(['border-bottom-color', 'border-left-color', 'border-right-color', 'border-top-color']);
      expect(properties(checkbox, '::after')).toEqual(['background-color', 'opacity']);

      const toggle = await mount<Toggle>('<ds-toggle type="switch" label="Option"></ds-toggle>');
      toggle.click();
      await expect.poll(() => properties(toggle, '::after')).toEqual(['background-color', 'left']);
    });
  });

  describe('form', () => {
    it.each([
      ['checkbox', 'value="accepted"', [['terms', 'accepted']]],
      ['checkbox', '', [['terms', 'on']]],
      ['switch', '', [['terms', 'on']]],
      ['icon', 'value="5"', [['terms', '5']]],
    ])('a checked %s (%s) is in the FormData of its form, as a native checkbox', async (type, attributes, submitted) => {
      // An icon toggle shows its content (no box of its own).
      const content = type === 'icon' ? '★' : '';
      const form = await mount<HTMLFormElement>(`<form><ds-toggle type="${type}" name="terms" ${attributes} label="Terms">${content}</ds-toggle></form>`);
      const toggle = form.querySelector<Toggle>('ds-toggle');

      expect(formEntries(form)).toEqual([]);
      await userEvent.click(toggle);

      expect(toggle.checked).toBe(true);
      expect(formEntries(form)).toEqual(submitted);
    });

    it('a form reset gives back the checked state of the load, without a toggle event', async () => {
      const form = await mount<HTMLFormElement>('<form><ds-toggle name="a" checked label="A"></ds-toggle><ds-toggle name="b" label="B"></ds-toggle></form>');
      const [a, b] = Array.from(form.querySelectorAll<Toggle>('ds-toggle'));
      await userEvent.click(a);
      await userEvent.click(b);
      expect(formEntries(form)).toEqual([['b', 'on']]);
      const toggles = recordEvents(form, ['toggle']);

      form.reset();

      await expect.poll(() => [a.checked, b.checked]).toEqual([true, false]);
      expect(formEntries(form)).toEqual([['a', 'on']]);
      expect(toggles).toEqual([]);
    });

    it('a fieldset disabled at runtime disables it: not submitted, not focusable, no click; enabled again, it is', async () => {
      const form = await mount<HTMLFormElement>('<form><fieldset><ds-toggle name="gift" checked label="Gift"></ds-toggle></fieldset></form>');
      const fieldset = form.querySelector('fieldset');
      const toggle = form.querySelector<Toggle>('ds-toggle');

      fieldset.disabled = true;
      await expect.poll(() => toggle.getAttribute('aria-disabled')).toBe('true');
      expect(formEntries(form)).toEqual([]);
      expect(toggle.hasAttribute('tabindex')).toBe(false);
      expect(toggle).toHaveClass('--disabled');
      expect(toggle.disabled).toBeFalsy();
      toggle.click();
      expect(toggle.checked).toBe(true);

      fieldset.disabled = false;
      await expect.poll(() => toggle.getAttribute('aria-disabled')).toBeNull();
      expect(formEntries(form)).toEqual([['gift', 'on']]);
      expect(toggle.getAttribute('tabindex')).toBe('0');
    });

    it('required: the form is invalid and not submitted until it is checked; aria-invalid only after the invalid event', async () => {
      const form = await mount<HTMLFormElement>('<form><ds-toggle type="checkbox" name="terms" required label="Terms"></ds-toggle><button>Send</button></form>');
      const toggle = form.querySelector<Toggle>('ds-toggle');
      const submits = recordEvents(form, ['submit', 'invalid']);
      form.addEventListener('submit', event => event.preventDefault());
      toggle.addEventListener('invalid', () => submits.push('invalid on the toggle'));

      // Invalid from the load, not shown yet.
      expect(form.checkValidity()).toBe(false);
      expect(toggle.matches(':invalid')).toBe(true);
      await expect.poll(() => toggle.getAttribute('aria-invalid')).toBe('true');
      expect(toggle.validity.valueMissing).toBe(true);
      expect(toggle.validationMessage).not.toBe('');

      // A submission is blocked, and the browser gives the focus to the toggle.
      await userEvent.click(form.querySelector('button'));
      expect(submits).toEqual(['invalid on the toggle', 'invalid on the toggle']);
      expect(focused()).toBe(toggle);

      await userEvent.keyboard(' ');
      expect(form.checkValidity()).toBe(true);
      await expect.poll(() => toggle.getAttribute('aria-invalid')).toBeNull();
      await userEvent.click(form.querySelector('button'));
      expect(submits.at(-1)).toBe('submit');
    });

    it('a required toggle shows no invalid state before the user did anything, and shows it once the user unchecks it', async () => {
      const form = await mount<HTMLFormElement>('<form><ds-toggle type="switch" name="n" required checked label="N"></ds-toggle></form>');
      const toggle = form.querySelector<Toggle>('ds-toggle');

      expect(toggle.getAttribute('aria-invalid')).toBeNull();
      await userEvent.click(toggle);

      await expect.poll(() => toggle.getAttribute('aria-invalid')).toBe('true');
      expect(toggle.matches(':state(user-invalid)')).toBe(true);
    });

    it('a click on its <label> (for or around it) toggles it and gives it the focus; the label names it', async () => {
      await mount('<label for="terms">I accept the terms</label> <ds-toggle id="terms" type="checkbox"></ds-toggle> <label>News <ds-toggle id="news"></ds-toggle></label>');
      const terms = document.querySelector<Toggle>('#terms');
      const news = document.querySelector<Toggle>('#news');

      await userEvent.click(document.querySelector('label[for="terms"]'));
      expect([terms.checked, focused()]).toEqual([true, terms]);

      await userEvent.click(news.closest('label'), { position: { x: 2, y: 2 } });
      expect([news.checked, focused()]).toEqual([true, news]);

      // A form-associated element is labelable: each label controls (and names) its toggle.
      expect(Array.from(document.querySelectorAll('label')).map(label => label.control)).toEqual([terms, news]);
    });
  });
});
