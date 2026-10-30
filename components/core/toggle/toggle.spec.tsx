import { newSpecPage } from '@stencil/core/testing';
import { DSToggle } from './toggle';

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
});
