import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './toggle';
import { type FakeInternals, formCallbacks, keydown, mockElementInternals, renderPage, type SpecPage } from '../../../test/helpers';

describe('ds-toggle', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const events: { name: string; value: unknown; checked: boolean }[] = [];
    page.root.addEventListener('toggle', (event: CustomEvent) => events.push(event.detail));
    return { page, events };
  };

  const click = async (page, times = 1) => {
    for (let i = 0; i < times; i++) {
      page.root.click();
      await page.waitForChanges();
    }
  };

  it.each(['checkbox', 'switch', 'icon'])('a %s is checked then unchecked by clicks', async type => {
    const { page, events } = await render(`<ds-toggle type="${type}" name="n" value="v"></ds-toggle>`);

    await click(page);
    expect(page.root.checked).toBe(true);
    expect(page.root).toHaveAttribute('checked');

    await click(page);
    expect(page.root.checked).toBe(false);
    expect(page.root).not.toHaveAttribute('checked');

    expect(events).toEqual([
      { name: 'n', value: 'v', checked: true },
      { name: 'n', value: 'v', checked: false },
    ]);
  });

  it('a switch (the default type) rendered checked can be unchecked', async () => {
    const { page } = await render('<ds-toggle checked></ds-toggle>');

    await click(page);

    expect(page.root.checked).toBe(false);
  });

  it('a radio is only checked by a click, never unchecked', async () => {
    const { page, events } = await render('<ds-toggle type="radio" value="a"></ds-toggle>');

    await click(page, 2);

    expect(page.root.checked).toBe(true);
    expect(events).toEqual([{ name: undefined, value: 'a', checked: true }]);
  });

  it('a disabled toggle ignores clicks', async () => {
    const { page, events } = await render('<ds-toggle type="checkbox" disabled></ds-toggle>');

    await click(page);

    expect(page.root.checked).toBeFalsy();
    expect(events).toEqual([]);
  });

  it('setProps writes the known props that have a value', async () => {
    const { page } = await render('<ds-toggle mods="small"></ds-toggle>');

    await page.root.setProps({ name: 'group', type: 'radio', checked: true, mods: undefined, unknown: 'x' });
    await page.waitForChanges();

    expect(page.root.name).toBe('group');
    expect(page.root.type).toBe('radio');
    expect(page.root.checked).toBe(true);
    expect(page.root.mods).toBe('small');
    expect(page.root.unknown).toBeUndefined();

    await page.root.setProps({ checked: false });
    expect(page.root.checked).toBe(false);
  });

  it('renders the type class when the type changes', async () => {
    const { page } = await render('<ds-toggle mods="small"></ds-toggle>');

    expect(page.root).toHaveClasses(['ds-toggle', '--small', '--switch']);

    await page.root.setProps({ type: 'radio' });
    await page.waitForChanges();

    expect(page.root).toHaveClasses(['ds-toggle', '--small', '--radio']);
    expect(page.root).not.toHaveClass('--switch');
  });

  /** The `--<type>` class the toggle renders. */
  const renderedType = (toggle: HTMLElement) => ['radio', 'checkbox', 'switch', 'icon'].filter(type => toggle.classList.contains(`--${type}`));

  it('renders a switch by default, without a type attribute', async () => {
    const { page } = await render('<ds-toggle></ds-toggle>');

    expect(renderedType(page.root)).toEqual(['switch']);
    expect(page.root.type).toBeUndefined();
    expect(page.root.hasAttribute('type')).toBe(false);
  });

  it("uses its parent's type (setType) when it has none, and behaves as that type", async () => {
    const { page, events } = await render('<ds-toggle value="a"></ds-toggle>');

    await page.root.setType('radio');
    await page.waitForChanges();
    expect(renderedType(page.root)).toEqual(['radio']);

    // A radio cannot be unchecked by a click.
    await click(page, 2);
    expect(page.root.checked).toBe(true);
    expect(events).toHaveLength(1);

    await page.root.setType(undefined);
    await page.waitForChanges();
    expect(renderedType(page.root)).toEqual(['switch']);
  });

  it("keeps its own type over its parent's, and gets the parent's back without one", async () => {
    const { page } = await render('<ds-toggle type="checkbox"></ds-toggle>');

    await page.root.setType('radio');
    await page.waitForChanges();
    expect(renderedType(page.root)).toEqual(['checkbox']);
    expect(page.root.type).toBe('checkbox');

    page.root.removeAttribute('type');
    await page.waitForChanges();
    expect(renderedType(page.root)).toEqual(['radio']);
  });
  describe('form', () => {
    let internalsOf: (element: Element) => FakeInternals;
    beforeEach(() => (internalsOf = mockElementInternals()));
    afterEach(() => vi.restoreAllMocks());

    const internals = (page: SpecPage) => internalsOf(page.root);

    it.each([
      ['switch', 'value="v"', 'v'],
      ['checkbox', '', 'on'],
      ['icon', 'value="5"', '5'],
      ['radio', 'value="a"', 'a'],
    ])('a %s submits its value (%s) while it is checked, and saves its state', async (type, attributes, submitted) => {
      const { page } = await render(`<ds-toggle type="${type}" name="n" ${attributes}></ds-toggle>`);

      expect([internals(page).value, internals(page).state]).toEqual([null, 'unchecked']);

      await click(page);
      expect([internals(page).value, internals(page).state]).toEqual([submitted, 'checked']);
    });

    it('submits nothing while disabled: its own prop, its group or its form (fieldset), which leave its own prop alone', async () => {
      const { page } = await render('<ds-toggle type="checkbox" name="n" checked></ds-toggle>');
      const state = () => [
        internals(page).value,
        page.root.disabled,
        page.root.getAttribute('aria-disabled'),
        page.root.getAttribute('tabindex'),
        page.root.classList.contains('--disabled'),
      ];

      expect(state()).toEqual(['on', undefined, null, '0', false]);

      // A disabled fieldset around it (the browser calls formDisabledCallback).
      formCallbacks(page.root).formDisabledCallback(true);
      await page.waitForChanges();
      expect(state()).toEqual([null, undefined, 'true', null, true]);
      await click(page);
      expect(page.root.checked).toBe(true);

      formCallbacks(page.root).formDisabledCallback(false);
      await page.waitForChanges();
      expect(state()).toEqual(['on', undefined, null, '0', false]);

      await page.root.setGroupDisabled(true);
      await page.waitForChanges();
      expect(state()).toEqual([null, undefined, 'true', null, true]);

      await page.root.setGroupDisabled();
      page.root.disabled = true;
      await page.waitForChanges();
      expect(state()).toEqual([null, true, 'true', null, true]);
    });

    it('a form reset gives back the checked state of the load', async () => {
      const { page } = await render('<ds-toggle type="checkbox" name="n" checked></ds-toggle><ds-toggle type="switch" name="s"></ds-toggle>');
      const [checkedAtLoad, uncheckedAtLoad] = Array.from(page.body.querySelectorAll('ds-toggle'));

      checkedAtLoad.click();
      uncheckedAtLoad.click();
      await page.waitForChanges();
      expect([checkedAtLoad.checked, uncheckedAtLoad.checked]).toEqual([false, true]);

      formCallbacks(checkedAtLoad).formResetCallback();
      formCallbacks(uncheckedAtLoad).formResetCallback();
      await page.waitForChanges();
      expect([checkedAtLoad.checked, uncheckedAtLoad.checked]).toEqual([true, false]);
      expect([checkedAtLoad.hasAttribute('checked'), uncheckedAtLoad.hasAttribute('checked')]).toEqual([true, false]);
    });

    it('takes back the state the browser restores, without a toggle event', async () => {
      const { page, events } = await render('<ds-toggle type="checkbox" name="n"></ds-toggle>');

      formCallbacks(page.root).formStateRestoreCallback('checked', 'restore');
      await page.waitForChanges();
      expect([page.root.checked, internals(page).value]).toEqual([true, 'on']);

      formCallbacks(page.root).formStateRestoreCallback('something else', 'autocomplete');
      await page.waitForChanges();
      expect(page.root.checked).toBe(true);

      formCallbacks(page.root).formStateRestoreCallback('unchecked', 'restore');
      await page.waitForChanges();
      expect(page.root.checked).toBe(false);
      expect(events).toEqual([]);
    });

    it('required: valueMissing until it is checked, with the message of the browser at the toggle, or its required-message', async () => {
      const { page } = await render('<ds-toggle type="checkbox" name="n" required></ds-toggle>');

      expect([page.root.validity.valueMissing, page.root.validationMessage, internals(page).anchor]).toEqual([true, 'Please check this box if you want to proceed.', page.root]);
      expect(page.root.willValidate).toBe(true);

      page.root.requiredMessage = 'Accept the terms';
      await page.waitForChanges();
      expect(page.root.validationMessage).toBe('Accept the terms');

      await click(page);
      expect([page.root.validity.valid, page.root.validationMessage]).toEqual([true, '']);

      // Disabled: barred from the validation.
      await click(page);
      page.root.disabled = true;
      await page.waitForChanges();
      expect(page.root.validity.valid).toBe(true);
    });

    it.each([
      ['checkbox', 'true'],
      ['switch', 'true'],
      ['radio', null],
      ['icon', null],
    ])('a required %s has aria-required %s (the roles that support it)', async (type, ariaRequired) => {
      const { page } = await render(`<ds-toggle type="${type}" required></ds-toggle>`);

      expect(page.root.getAttribute('aria-required')).toBe(ariaRequired);
    });

    it('shows its invalid state (aria-invalid, --invalid, :state(user-invalid)) after an invalid event, until it is valid', async () => {
      const { page } = await render('<ds-toggle type="checkbox" name="n" required></ds-toggle>');
      const shown = () => [page.root.getAttribute('aria-invalid'), page.root.classList.contains('--invalid'), internals(page).states.has('user-invalid')];

      // Invalid at the load, but not shown: the user has done nothing yet ("false": the browser would tell it at once).
      expect(shown()).toEqual(['false', false, false]);

      expect(await page.root.checkValidity()).toBe(false);
      await page.waitForChanges();
      expect(shown()).toEqual(['true', true, true]);

      await click(page);
      expect(shown()).toEqual([null, false, false]);

      // Unchecked by the user: shown again (as :user-invalid).
      await click(page);
      expect(shown()).toEqual(['true', true, true]);

      // A form reset hides it.
      formCallbacks(page.root).formResetCallback();
      await page.waitForChanges();
      expect(shown()).toEqual(['false', false, false]);
    });

    it('shows its invalid state once the user unchecks it', async () => {
      const { page } = await render('<ds-toggle type="switch" name="n" required checked></ds-toggle>');

      await click(page);
      expect(page.root.getAttribute('aria-invalid')).toBe('true');
    });

    it('reportValidity() gives the focus to an invalid toggle (the anchor of its message)', async () => {
      const { page } = await render('<ds-toggle type="checkbox" required></ds-toggle>');
      const focus = vi.spyOn(page.root, 'focus').mockImplementation(() => undefined);

      expect(await page.root.reportValidity()).toBe(false);
      expect(focus).toHaveBeenCalled();
    });

    it('a radio of a ds-toggle-group leaves its validation to the group', async () => {
      const { page } = await render('<ds-toggle-group><ds-toggle type="radio" required></ds-toggle></ds-toggle-group>');
      const radio = page.body.querySelector('ds-toggle');

      expect(radio.validity.valid).toBe(true);
    });

    it('a boolean attribute is true when present, as on a native control: checked="false" is checked', async () => {
      const { page } = await render('<ds-toggle type="checkbox" checked="false"></ds-toggle>');

      expect(page.root.checked).toBe(true);
    });
  });

  describe('accessibility', () => {
    /** The ARIA attributes of the toggle element. */
    const aria = (toggle: HTMLElement) =>
      Object.fromEntries(['role', 'tabindex', 'aria-checked', 'aria-pressed', 'aria-disabled', 'aria-label'].map(name => [name, toggle.getAttribute(name)]));

    it.each([
      ['switch', 'switch', 'aria-checked'],
      ['checkbox', 'checkbox', 'aria-checked'],
      ['radio', 'radio', 'aria-checked'],
      ['icon', 'button', 'aria-pressed'],
    ])('a %s has the role %s, is focusable, and has its state in %s', async (type, role, stateAttribute) => {
      const { page } = await render(`<ds-toggle type="${type}"></ds-toggle>`);
      const otherStateAttribute = stateAttribute === 'aria-checked' ? 'aria-pressed' : 'aria-checked';

      expect(aria(page.root)).toEqual(expect.objectContaining({ 'role': role, 'tabindex': '0', [stateAttribute]: 'false', [otherStateAttribute]: null, 'aria-disabled': null }));

      await click(page);
      expect(page.root.getAttribute(stateAttribute)).toBe('true');
    });

    it('is a switch without a type, a toggle button with an unknown type, and follows the type it gets', async () => {
      const { page } = await render('<ds-toggle checked></ds-toggle>');
      expect(aria(page.root)).toEqual(expect.objectContaining({ 'role': 'switch', 'aria-checked': 'true' }));

      await page.root.setType('star');
      await page.waitForChanges();
      expect(aria(page.root)).toEqual(expect.objectContaining({ 'role': 'button', 'aria-pressed': 'true', 'aria-checked': null }));

      page.root.type = 'checkbox';
      await page.waitForChanges();
      expect(aria(page.root)).toEqual(expect.objectContaining({ 'role': 'checkbox', 'aria-checked': 'true', 'aria-pressed': null }));
    });

    it('a disabled toggle is aria-disabled, cannot be focused and ignores the keys; enabled, it is focusable again', async () => {
      const { page, events } = await render('<ds-toggle type="checkbox" disabled></ds-toggle>');

      expect(aria(page.root)).toEqual(expect.objectContaining({ 'aria-disabled': 'true', 'tabindex': null }));
      expect(keydown(page.root, ' ').defaultPrevented).toBe(false);
      await page.waitForChanges();
      expect(page.root.checked).toBeFalsy();
      expect(events).toEqual([]);

      page.root.disabled = false;
      await page.waitForChanges();
      expect(aria(page.root)).toEqual(expect.objectContaining({ 'aria-disabled': null, 'tabindex': '0' }));
    });

    it.each(['checkbox', 'switch', 'icon'])('Space toggles a %s with a click event, without scrolling the page, and does not repeat', async type => {
      const { page, events } = await render(`<ds-toggle type="${type}" value="v"></ds-toggle>`);
      const onClick = vi.fn();
      page.root.addEventListener('click', onClick);

      expect(keydown(page.root, ' ').defaultPrevented).toBe(true);
      await page.waitForChanges();
      expect(page.root.checked).toBe(true);

      // Held down: no change.
      expect(keydown(page.root, ' ', { repeat: true }).defaultPrevented).toBe(true);
      keydown(page.root, ' ');
      await page.waitForChanges();

      expect(page.root.checked).toBe(false);
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(events.map(event => event.checked)).toEqual([true, false]);
    });

    it('Space checks a radio and does not uncheck it', async () => {
      const { page, events } = await render('<ds-toggle type="radio" value="a"></ds-toggle>');

      keydown(page.root, ' ');
      await page.waitForChanges();
      keydown(page.root, ' ');
      await page.waitForChanges();

      expect(page.root.checked).toBe(true);
      expect(events).toHaveLength(1);
    });

    it.each([
      ['switch', true],
      ['icon', true],
      ['checkbox', false],
      ['radio', false],
    ])('Enter on a %s: toggles it, %s', async (type, toggles) => {
      const { page } = await render(`<ds-toggle type="${type}"></ds-toggle>`);

      expect(keydown(page.root, 'Enter').defaultPrevented).toBe(toggles);
      await page.waitForChanges();

      expect(!!page.root.checked).toBe(toggles);
    });

    it('ignores the keys with a modifier, and those of an element in its content', async () => {
      const { page } = await render('<ds-toggle type="icon"><span tabindex="-1">★</span></ds-toggle>');

      for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) keydown(page.root, ' ', { [modifier]: true });
      keydown(page.root.querySelector('span'), ' ');
      await page.waitForChanges();

      expect(page.root.checked).toBeFalsy();
    });

    it('is named by label (aria-label), or keeps the aria-labelledby of the page', async () => {
      const { page } = await render('<ds-toggle type="switch" label="Notifications"></ds-toggle><ds-toggle aria-labelledby="wifi-label"></ds-toggle>');
      const [named, labelled] = Array.from(page.body.querySelectorAll('ds-toggle'));

      expect(named.getAttribute('aria-label')).toBe('Notifications');
      expect(labelled.hasAttribute('aria-label')).toBe(false);
      expect(labelled.getAttribute('aria-labelledby')).toBe('wifi-label');
    });

    it('setTabbable(false) takes it out of the Tab order, setTabbable() puts it back', async () => {
      const { page } = await render('<ds-toggle type="radio"></ds-toggle>');

      await page.root.setTabbable(false);
      await page.waitForChanges();
      expect(page.root.getAttribute('tabindex')).toBe('-1');

      await page.root.setTabbable();
      await page.waitForChanges();
      expect(page.root.getAttribute('tabindex')).toBe('0');
    });
  });
});
