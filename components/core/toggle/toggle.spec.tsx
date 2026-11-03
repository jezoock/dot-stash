import { newSpecPage } from '@stencil/core/testing';
import { DSToggle } from './toggle';

const keydown = (target: EventTarget, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
};

describe('ds-toggle', () => {
  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSToggle], html });
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
    expect(page.rootInstance.unknown).toBeUndefined();

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
      const onClick = jest.fn();
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
