import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSToggle } from '../toggle/toggle';
import { DSToggleGroup } from './toggle-group';

describe('ds-toggle-group', () => {
  afterEach(() => {
    delete global.MutationObserver;
    delete window.MutationObserver;
  });

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

  /** The `--<type>` class each toggle renders. */
  const renderedTypes = (page: SpecPage) =>
    Array.from(page.root.querySelectorAll('ds-toggle')).map(toggle => ['radio', 'checkbox', 'switch', 'icon'].find(type => toggle.classList.contains(`--${type}`)));

  it('passes its name and type to the toggles, which keep their own otherwise', async () => {
    const { page } = await render('name="size" type="checkbox"');
    const toggles = Array.from(page.root.querySelectorAll('ds-toggle'));

    expect(toggles.map(toggle => toggle.name)).toEqual(['size', 'size', 'size']);
    expect(renderedTypes(page)).toEqual(['checkbox', 'checkbox', 'checkbox']);

    const { page: untyped } = await render('');
    expect(renderedTypes(untyped)).toEqual(['switch', 'switch', 'switch']);
  });

  it("a toggle's own type wins over the group's", async () => {
    const page = await newSpecPage({
      components: [DSToggleGroup, DSToggle],
      html: '<ds-toggle-group type="checkbox"><ds-toggle value="a"></ds-toggle><ds-toggle value="b" type="radio"></ds-toggle></ds-toggle-group>',
    });

    expect(renderedTypes(page)).toEqual(['checkbox', 'radio']);
  });

  it('passes on its name, type and mods when they change after the load, and gives the toggles their own back', async () => {
    const page = await newSpecPage({
      components: [DSToggleGroup, DSToggle],
      html: '<ds-toggle-group><ds-toggle value="a"></ds-toggle><ds-toggle value="b" name="own" mods="small" type="radio"></ds-toggle></ds-toggle-group>',
    });
    const group = page.root;
    const toggles = Array.from(group.querySelectorAll('ds-toggle'));
    // Sorted: Stencil appends the classes it adds.
    const props = () => toggles.map(toggle => [toggle.name, toggle.className.split(' ').sort().join(' ')]);

    group.name = 'size';
    group.type = 'checkbox';
    group.mods = 'large';
    await page.waitForChanges();
    expect(props()).toEqual([
      ['size', '--checkbox --large ds-toggle'],
      ['size', '--large --radio ds-toggle'],
    ]);

    group.mods = 'large,dark';
    group.type = 'icon';
    await page.waitForChanges();
    expect(props()).toEqual([
      ['size', '--dark --icon --large ds-toggle'],
      ['size', '--dark --large --radio ds-toggle'],
    ]);

    group.removeAttribute('name');
    group.removeAttribute('type');
    group.mods = [];
    await page.waitForChanges();
    expect(props()).toEqual([
      [null, '--switch ds-toggle'],
      ['own', '--radio --small ds-toggle'],
    ]);
  });

  it('registers the toggles added after the load', async () => {
    const observers: { callback: MutationCallback; observe: jest.Mock; disconnect: jest.Mock }[] = [];
    class FakeMutationObserver {
      observe = jest.fn();
      disconnect = jest.fn();
      constructor(public callback: MutationCallback) {
        observers.push(this);
      }
    }
    const page = await newSpecPage({ components: [DSToggleGroup, DSToggle], html: '' });
    global.MutationObserver = window.MutationObserver = FakeMutationObserver as unknown as typeof MutationObserver;
    await page.setContent('<ds-toggle-group name="size" type="checkbox" mods="large" count="[0, 3]"><ds-toggle value="a"></ds-toggle></ds-toggle-group>');
    const group = page.root;
    const [observer] = observers;
    expect(observer.observe).toHaveBeenCalledWith(group, { childList: true, subtree: true });
    const changes: unknown[] = [];
    group.addEventListener('toggleValueChange', (event: CustomEvent) => changes.push(event.detail.value));

    const wrapper = page.doc.createElement('div');
    wrapper.innerHTML = '<ds-toggle value="b" checked></ds-toggle><ds-toggle value="c"></ds-toggle>';
    group.appendChild(wrapper);
    await page.waitForChanges();
    observer.callback([{ addedNodes: [wrapper] } as unknown as MutationRecord], observer as unknown as MutationObserver);
    // Added again (moved): registered once.
    observer.callback([{ addedNodes: [wrapper.firstElementChild] } as unknown as MutationRecord], observer as unknown as MutationObserver);
    await page.waitForChanges();

    // Selected by value: the slot patch of Stencil inserts the appended wrapper at the place of the slot.
    const [b, c] = ['b', 'c'].map(value => group.querySelector<HTMLDsToggleElement>(`ds-toggle[value="${value}"]`));
    expect([b, c].map(toggle => [toggle.name, toggle.className])).toEqual([
      ['size', 'ds-toggle --large --checkbox'],
      ['size', 'ds-toggle --large --checkbox'],
    ]);
    expect(page.rootInstance.value).toEqual(['b']);

    c.click();
    await page.waitForChanges();
    expect(changes).toEqual([['b', 'c']]);

    group.remove();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('applies a count changed after the load', async () => {
    const { page, click, value } = await render('type="checkbox"');

    page.root.count = '[0, 3]';
    await page.waitForChanges();
    await click('a');
    await click('b');

    expect(value()).toEqual(['a', 'b']);
  });
});
