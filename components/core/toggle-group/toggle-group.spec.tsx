import { newSpecPage } from '@stencil/core/testing';
import { DSToggle } from '../toggle/toggle';
import { DSToggleGroup } from './toggle-group';

describe('ds-toggle-group', () => {
  const render = async (groupAttributes: string, toggleAttributes = '') => {
    const page = await newSpecPage({
      components: [DSToggleGroup, DSToggle],
      html: `<ds-toggle-group ${groupAttributes}>${['a', 'b', 'c'].map(value => `<ds-toggle value="${value}" ${toggleAttributes}></ds-toggle>`).join('')}</ds-toggle-group>`,
    });
    const changes: unknown[] = [];
    page.root.addEventListener('toggleValueChange', (event: CustomEvent) => changes.push(event.detail.value));

    const toggles = Array.from(page.root.querySelectorAll('ds-toggle'));
    const click = async (value: string) => {
      toggles.find(toggle => toggle.value === value).click();
      await page.waitForChanges();
    };
    const checked = () => toggles.filter(toggle => toggle.checked).map(toggle => toggle.value);
    const value = () => page.rootInstance.value;

    return { page, changes, click, checked, value };
  };

  it('single selection (default count [1, 1]): a click selects one value, which cannot be deselected', async () => {
    const { changes, click, checked, value } = await render('type="switch"');

    await click('a');
    expect(value()).toEqual(['a']);

    await click('b');
    expect(value()).toEqual(['b']);
    expect(checked()).toEqual(['b']);

    // A switch would uncheck itself: at least one value stays selected.
    await click('b');
    expect(value()).toEqual(['b']);
    expect(checked()).toEqual(['b']);

    expect(changes).toEqual([['a'], ['b']]);
  });

  it('single selection with radios', async () => {
    const { click, checked, value } = await render('type="radio"');

    await click('a');
    await click('a');
    await click('c');

    expect(value()).toEqual(['c']);
    expect(checked()).toEqual(['c']);
  });

  it('optional single selection (count [0, 1]): the value can be deselected', async () => {
    const { changes, click, checked, value } = await render('type="checkbox" count="[0, 1]"');

    await click('a');
    await click('a');

    expect(value()).toEqual([]);
    expect(checked()).toEqual([]);
    expect(changes).toEqual([['a'], []]);
  });

  it('multiple selection (count [0, 3]): clicks add and remove values', async () => {
    const { click, checked, value } = await render('type="checkbox" count="[0, 3]"');

    await click('a');
    await click('b');
    expect(value()).toEqual(['a', 'b']);

    await click('a');
    expect(value()).toEqual(['b']);
    expect(checked()).toEqual(['b']);
  });

  it('multiple selection keeps between min and max values (count [1, 2])', async () => {
    const { changes, click, checked, value } = await render('type="checkbox" count="[1, 2]"');

    await click('a');
    await click('b');
    await click('c');
    expect(value()).toEqual(['a', 'b']);
    expect(checked()).toEqual(['a', 'b']);

    await click('a');
    await click('b');
    expect(value()).toEqual(['b']);
    expect(checked()).toEqual(['b']);

    expect(changes).toEqual([['a'], ['a', 'b'], ['b']]);
  });

  it('passes its name and type to the toggles, which keep their own otherwise', async () => {
    const { page } = await render('name="size" type="checkbox"');
    const toggles = Array.from(page.root.querySelectorAll('ds-toggle'));

    expect(toggles.map(toggle => toggle.name)).toEqual(['size', 'size', 'size']);
    expect(toggles.map(toggle => toggle.type)).toEqual(['checkbox', 'checkbox', 'checkbox']);

    const { page: untyped } = await render('');
    expect(Array.from(untyped.root.querySelectorAll('ds-toggle')).map(toggle => toggle.type)).toEqual(['switch', 'switch', 'switch']);
  });
});
