import { describe, expect, it, vi } from 'vitest';
import './select';
import { renderPage } from '../../../test/helpers';

describe('ds-select', () => {
  const options = '<option value="red">Red</option><option value="blue" selected>Blue</option>';

  const render = async (attributes = '', html = options) => {
    const page = await renderPage(`<ds-select ${attributes}>${html}</ds-select>`);
    const select = page.root.querySelector('select');
    const label = page.root.querySelector('.ds-select__label') as HTMLElement;
    return { page, select, label };
  };

  it('renders a native select with the options, its name and its id, and the label of the selected option', async () => {
    const { page, select, label } = await render('name="color"');

    expect(select).toHaveClass('ds-select__input');
    expect([select.getAttribute('name'), select.getAttribute('id')]).toEqual(['color', 'color']);
    expect(Array.from(select.querySelectorAll('option')).map(option => option.getAttribute('value'))).toEqual(['red', 'blue']);
    expect(label.textContent).toBe('Blue');
    // The simulated DOM has no option values (a browser gives "blue").
    expect((await page.root.getValue()).label).toBe('Blue');
  });

  it('selects in the native select the option the box shows: the first one, without a selected option', async () => {
    const { select, label } = await render('', '<option value="s">S</option><option value="m">M</option>');
    const [first, second] = Array.from(select.querySelectorAll('option'));

    expect(label.textContent).toBe('S');
    // The simulated DOM has no selectedness: the property set by the component.
    expect([first.selected, second.selected]).toEqual([true, undefined]);
  });

  it('hides the label of the box from assistive technologies: the select gives its value', async () => {
    const { label } = await render();

    expect(label.getAttribute('aria-hidden')).toBe('true');
  });

  it.each([
    ['label', 'label="Color"', 'Color', null],
    ['labelledby', 'labelledby="color-title" label="Color"', null, 'color-title'],
    ['nothing (a <label> around it or a <label for> names it)', '', null, null],
  ])('is named by %s', async (_, attributes, ariaLabel, ariaLabelledby) => {
    const { select } = await render(attributes);

    expect([select.getAttribute('aria-label'), select.getAttribute('aria-labelledby')]).toEqual([ariaLabel, ariaLabelledby]);
  });

  it('disables the native select (no focus, no change) while disabled', async () => {
    const { page, select } = await render('disabled');

    // The simulated DOM has no disabled property: the attribute is written.
    expect(select.hasAttribute('disabled')).toBe(true);
    expect(page.root).toHaveClass('--disabled');

    page.root.disabled = false;
    await page.waitForChanges();

    expect(select.hasAttribute('disabled')).toBe(false);
    expect(page.root).not.toHaveClass('--disabled');
  });

  it('shows the label of the option selected with the select, and emits valueChange', async () => {
    const { page, select, label } = await render();
    const onChange = vi.fn();
    page.root.addEventListener('valueChange', onChange);

    // The simulated DOM has no selectedOptions, nor option values: as a browser gives them.
    const red = select.querySelector('option');
    Object.defineProperty(red, 'value', { value: 'red' });
    Object.defineProperty(select, 'selectedOptions', { value: [red] });
    select.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(label.textContent).toBe('Red');
    expect(await page.root.getValue()).toEqual({ value: 'red', label: 'Red' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  describe('form', () => {
    it('is not form-associated: its native select is the only form control, which submits the value once', async () => {
      const page = await renderPage(`<form><ds-select name="color">${options}</ds-select></form>`);

      expect((page.win.customElements.get('ds-select') as unknown as { formAssociated?: boolean }).formAssociated).toBeFalsy();
      expect(Array.from(page.body.querySelectorAll('select, [name]')).filter(element => element.tagName !== 'DS-SELECT')).toEqual([page.root.querySelector('select')]);
    });

    it('makes its native select required', async () => {
      const { page, select } = await render('name="color" required');

      expect(select.hasAttribute('required')).toBe(true);

      page.root.required = false;
      await page.waitForChanges();
      expect(select.hasAttribute('required')).toBe(false);
    });

    it('shows the option the native select selects again after a reset of its form', async () => {
      const page = await renderPage(`<form><ds-select name="color">${options}</ds-select></form><form id="other"></form>`);
      const select = page.root.querySelector('select');
      const label = page.root.querySelector('.ds-select__label');
      const [red, blue] = Array.from(select.querySelectorAll('option'));
      /** The browser resets the controls after the reset event: the component reads the select after a timeout. */
      const afterTimeout = () => new Promise(resolve => setTimeout(resolve));

      // The user selected Red, then the form is reset: the browser selects Blue again after the reset event.
      Object.defineProperty(red, 'value', { value: 'red' });
      Object.defineProperty(select, 'selectedOptions', { configurable: true, value: [red] });
      select.dispatchEvent(new Event('change'));
      await page.waitForChanges();
      expect(label.textContent).toBe('Red');

      Object.defineProperty(blue, 'value', { value: 'blue' });
      Object.defineProperty(select, 'selectedOptions', { configurable: true, value: [blue] });
      // The reset of another form changes nothing.
      page.body.querySelector('#other').dispatchEvent(new Event('reset', { bubbles: true }));
      await afterTimeout();
      await page.waitForChanges();
      expect(label.textContent).toBe('Red');

      page.body.querySelector('form').dispatchEvent(new Event('reset', { bubbles: true }));
      expect(label.textContent).toBe('Red');
      await afterTimeout();
      await page.waitForChanges();
      expect(label.textContent).toBe('Blue');
      expect(await page.root.getValue()).toEqual({ value: 'blue', label: 'Blue' });
    });

    it('shows the invalid state of its native select (aria-invalid, --invalid) after an invalid event or a change, until it is valid', async () => {
      const { page, select } = await render('name="color" required', '<option value="">Choose</option><option value="red">Red</option>');
      // The simulated DOM has no constraint validation: the validity a browser gives.
      const validity = { valid: false };
      Object.defineProperty(select, 'validity', { configurable: true, get: () => validity });
      const shown = () => [select.getAttribute('aria-invalid'), page.root.classList.contains('--invalid')];

      page.root.required = true;
      page.root.label = 'Color';
      await page.waitForChanges();
      await page.waitForChanges();
      // Invalid, not shown yet: "false" (the browser would tell it at once).
      expect(shown()).toEqual(['false', false]);

      select.dispatchEvent(new Event('invalid'));
      await page.waitForChanges();
      expect(shown()).toEqual(['true', true]);

      validity.valid = true;
      Object.defineProperty(select, 'selectedOptions', { configurable: true, value: [select.querySelectorAll('option')[1]] });
      select.dispatchEvent(new Event('change'));
      await page.waitForChanges();
      expect(shown()).toEqual([null, false]);
    });
  });
});
