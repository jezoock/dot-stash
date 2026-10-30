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
});
