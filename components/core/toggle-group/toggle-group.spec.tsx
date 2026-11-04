import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSToggle } from '../toggle/toggle';
import { DSToggleGroup } from './toggle-group';

/**
 * The simulated DOM of the spec tests has no focus: `focus()` only dispatches a `focus` event. This gives the document an
 * `activeElement`, which `focus()` sets.
 */
const trackFocus = (page: SpecPage) => {
  const focus: { active: HTMLElement | null } = { active: null };
  let owner = Object.getPrototypeOf(page.body);
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);

  jest.spyOn(owner, 'focus').mockImplementation(function (this: HTMLElement) {
    focus.active = this;
  });
  Object.defineProperty(page.doc, 'activeElement', { configurable: true, get: () => focus.active ?? page.body });

  return () => page.doc.activeElement as HTMLElement;
};

/** The form callbacks the browser calls on a form-associated element (not in the element types). */
type FormCallbacks = { formResetCallback(): void; formStateRestoreCallback(state: unknown, mode: string): void; formDisabledCallback(isDisabled: boolean): void };
const formCallbacks = (element: Element) => element as unknown as FormCallbacks;

/** What the fake ElementInternals below records, read by the tests. */
type FakeInternals = ElementInternals & { value: unknown; state: unknown; anchor: HTMLElement | undefined; states: Set<string> };

/**
 * The simulated DOM of the spec tests has no ElementInternals (its `attachInternals()` gives an object without methods,
 * and the components then leave the form alone). This gives the elements a fake one, which records the form value, the
 * state and the validity, dispatches `invalid` as a browser does and gives the `<label>` elements of the document. Returns
 * the internals of an element.
 */
const mockElementInternals = () => {
  const internalsOf = new WeakMap<Element, FakeInternals>();
  let owner = Object.getPrototypeOf(document.createElement('div'));
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'attachInternals')) owner = Object.getPrototypeOf(owner);

  const createInternals = (host: HTMLElement) => {
    let flags: ValidityStateFlags = {};
    let message = '';
    const internals = {
      value: null,
      state: null,
      anchor: undefined,
      states: new Set<string>(),
      setFormValue(value: unknown, state: unknown = value) {
        Object.assign(internals, { value, state });
      },
      setValidity(newFlags: ValidityStateFlags = {}, newMessage = '', anchor?: HTMLElement) {
        flags = newFlags;
        message = newMessage;
        internals.anchor = anchor;
      },
      get validity() {
        return { valid: !Object.values(flags).some(Boolean), ...flags };
      },
      get validationMessage() {
        return internals.validity.valid ? '' : message;
      },
      get willValidate() {
        return !host.hasAttribute('disabled');
      },
      get labels() {
        const labels = Array.from(host.ownerDocument.querySelectorAll('label')) as HTMLLabelElement[];
        return labels.filter(label => (label.hasAttribute('for') ? !!host.id && label.getAttribute('for') === host.id : label.contains(host)));
      },
      checkValidity() {
        const { valid } = internals.validity;
        if (!valid) host.dispatchEvent(new Event('invalid', { cancelable: true }));
        return valid;
      },
      reportValidity() {
        const valid = internals.checkValidity();
        if (!valid) (internals.anchor ?? host).focus();
        return valid;
      },
    };
    internalsOf.set(host, internals as unknown as FakeInternals);
    return internals as unknown as ElementInternals;
  };
  jest.spyOn(owner, 'attachInternals').mockImplementation(function (this: HTMLElement) {
    return createInternals(this);
  });

  return (element: Element) => internalsOf.get(element);
};

const keydown = (target: EventTarget, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
};

describe('ds-toggle-group', () => {
  afterEach(() => {
    delete global.MutationObserver;
    delete window.MutationObserver;
    jest.restoreAllMocks();
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
    expect(observer.observe).toHaveBeenCalledWith(group, { childList: true, subtree: true, attributes: true, attributeFilter: ['checked'] });
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
  describe('form', () => {
    let internals: (element: Element) => FakeInternals;
    beforeEach(() => (internals = mockElementInternals()));

    /** Records the observers of the group, to give them mutation records (the simulated DOM has no MutationObserver). */
    const fakeObservers = () => {
      const observers: { callback: MutationCallback }[] = [];
      class FakeMutationObserver {
        observe = jest.fn();
        disconnect = jest.fn();
        constructor(public callback: MutationCallback) {
          observers.push(this);
        }
      }
      global.MutationObserver = window.MutationObserver = FakeMutationObserver as unknown as typeof MutationObserver;
      /** The `checked` attributes of these toggles changed: the records a browser gives. */
      return (toggles: Element[]) =>
        observers.forEach(({ callback }) =>
          callback(
            toggles.map(target => ({ type: 'attributes', attributeName: 'checked', target }) as unknown as MutationRecord),
            undefined,
          ),
        );
    };

    it('submits nothing itself: each toggle submits its value under the name of the group, as native checkboxes or radios', async () => {
      const { page, click } = await render('name="size" type="checkbox" count="[0, 3]"');
      const toggles = Array.from(page.root.querySelectorAll('ds-toggle'));

      await click('a');
      await click('c');

      expect(internals(page.root).value).toBeNull();
      expect(toggles.map(toggle => [toggle.getAttribute('name'), internals(toggle).value])).toEqual([
        ['size', 'a'],
        ['size', null],
        ['size', 'c'],
      ]);

      const radios = await render('name="color" type="radio"');
      await radios.click('b');
      await radios.click('c');
      expect(Array.from(radios.page.root.querySelectorAll('ds-toggle')).map(toggle => internals(toggle).value)).toEqual([null, null, 'c']);
    });

    it('its toggles submit nothing while it is disabled', async () => {
      const { page, click } = await render('name="size" type="checkbox" count="[0, 3]"');
      const [a] = Array.from(page.root.querySelectorAll('ds-toggle'));

      await click('a');
      page.root.disabled = true;
      await page.waitForChanges();

      expect([a.checked, internals(a).value]).toEqual([true, null]);
    });

    it('required: valueMissing until a toggle is checked, with the message of the browser at the radio Tab reaches, or its required-message', async () => {
      const { page, click } = await render('name="size" type="radio" required');
      const [a] = Array.from(page.root.querySelectorAll('ds-toggle'));

      expect([page.root.validity.valueMissing, page.root.validationMessage, internals(page.root).anchor]).toEqual([true, 'Please select one of these options.', a]);
      expect(page.root.getAttribute('aria-required')).toBe('true');

      page.root.requiredMessage = 'Choose a size';
      await page.waitForChanges();
      expect(page.root.validationMessage).toBe('Choose a size');

      await click('b');
      expect([page.root.validity.valid, page.root.validationMessage]).toEqual([true, '']);
    });

    it('a radio with required makes its group required; a group of checkboxes has no aria-required (not a property of the group role)', async () => {
      const page = await newSpecPage({
        components: [DSToggleGroup, DSToggle],
        html: '<ds-toggle-group type="radio"><ds-toggle value="a" required></ds-toggle><ds-toggle value="b"></ds-toggle></ds-toggle-group>',
      });
      expect([page.root.validity.valueMissing, page.root.getAttribute('aria-required')]).toEqual([true, 'true']);

      const checkboxes = await newSpecPage({
        components: [DSToggleGroup, DSToggle],
        html: '<ds-toggle-group type="checkbox" count="[0, 3]" required><ds-toggle value="a"></ds-toggle></ds-toggle-group>',
      });
      expect([checkboxes.root.validity.valueMissing, checkboxes.root.getAttribute('role'), checkboxes.root.getAttribute('aria-required')]).toEqual([true, 'group', null]);
    });

    it('a disabled group is not validated', async () => {
      const { page } = await render('type="radio" required disabled');

      expect([page.root.validity.valid, page.root.hasAttribute('aria-required')]).toEqual([true, false]);
    });

    it('shows its invalid state (aria-invalid, --invalid, :state(user-invalid)) after an invalid event or a change by the user, until it is valid or reset', async () => {
      const { page, click } = await render('type="checkbox" count="[0, 3]" required');
      const shown = () => [page.root.getAttribute('aria-invalid'), page.root.classList.contains('--invalid'), internals(page.root).states.has('user-invalid')];

      expect(shown()).toEqual(['false', false, false]);

      expect(await page.root.checkValidity()).toBe(false);
      await page.waitForChanges();
      expect(shown()).toEqual(['true', true, true]);

      await click('a');
      expect(shown()).toEqual([null, false, false]);

      // Unchecked by the user: none checked, shown again.
      await click('a');
      expect(shown()).toEqual(['true', true, true]);

      formCallbacks(page.root).formResetCallback();
      await page.waitForChanges();
      expect(shown()).toEqual(['false', false, false]);
    });

    it('reportValidity() gives the focus to the anchor of its message', async () => {
      const { page } = await render('type="radio" required');
      const [a] = Array.from(page.root.querySelectorAll('ds-toggle'));
      const focus = jest.spyOn(a, 'focus').mockImplementation(() => undefined);

      expect(await page.root.reportValidity()).toBe(false);
      expect(focus).toHaveBeenCalled();
    });

    it('follows its toggles checked otherwise than by a click (form reset, restored state, script), without toggleValueChange', async () => {
      const changed = fakeObservers();
      const { page, changes, click, value } = await render('name="size" type="checkbox" count="[0, 3]"');
      const toggles = Array.from(page.root.querySelectorAll('ds-toggle'));

      await click('b');
      expect(value()).toEqual(['b']);

      // A form reset: each toggle takes back its state of the load (none checked), then the observer tells the group.
      toggles.forEach(toggle => formCallbacks(toggle).formResetCallback());
      await page.waitForChanges();
      changed(toggles);
      await page.waitForChanges();
      expect(value()).toEqual([]);

      formCallbacks(toggles[2]).formStateRestoreCallback('checked', 'restore');
      toggles[0].checked = true;
      await page.waitForChanges();
      changed([toggles[2], toggles[0]]);
      await page.waitForChanges();
      expect(value()).toEqual(['a', 'c']);
      expect(changes).toEqual([['b']]);
    });

    it('saves its value as its state (and submits nothing), and gives the restored state back to its toggles, without events', async () => {
      const { page, changes, click, checked, value } = await render('name="size" type="checkbox" count="[0, 3]"');
      await click('b');
      expect([internals(page.root).value, internals(page.root).state]).toEqual([null, '["b"]']);
      const toggleEvents: string[] = [];
      page.root.addEventListener('toggle', event => toggleEvents.push(event.type));

      formCallbacks(page.root).formStateRestoreCallback('["c","a"]', 'restore');
      await page.waitForChanges();
      expect([checked(), value()]).toEqual([
        ['a', 'c'],
        ['a', 'c'],
      ]);
      expect(internals(page.root).state).toBe('["a","c"]');

      formCallbacks(page.root).formStateRestoreCallback('not JSON', 'restore');
      await page.waitForChanges();
      expect(checked()).toEqual(['a', 'c']);
      expect([changes, toggleEvents]).toEqual([[['b']], []]);
    });

    it('a click on the group itself (from its <label>) moves the focus to the radio Tab reaches, without selecting it', async () => {
      const { page, click, checked } = await render('type="radio"');
      const focused = trackFocus(page);
      const toggles = Array.from(page.root.querySelectorAll('ds-toggle'));

      page.root.click();
      expect(focused()).toBe(toggles[0]);
      expect(checked()).toEqual([]);

      await click('c');
      page.root.click();
      expect(focused()).toBe(toggles[2]);
      expect(checked()).toEqual(['c']);
    });
  });

  describe('accessibility', () => {
    const tabindexes = (page: SpecPage) => Array.from(page.root.querySelectorAll('ds-toggle')).map(toggle => toggle.getAttribute('tabindex'));

    it.each([
      ['switches', 'group', 'type="switch"'],
      ['checkboxes', 'group', 'type="checkbox" count="[0, 3]"'],
      ['radios', 'radiogroup', 'type="radio"'],
      ['radios with a single optional selection', 'radiogroup', 'type="radio" count="[0, 1]"'],
      ['radios with a multiple selection', 'group', 'type="radio" count="[0, 2]"'],
    ])('a group of %s has the role %s', async (_, role, attributes) => {
      const { page } = await render(attributes);

      expect(page.root.getAttribute('role')).toBe(role);
    });

    it('is a group when one of its toggles has another type of its own, a radio group with radios of their own type', async () => {
      const mixed = await newSpecPage({
        components: [DSToggleGroup, DSToggle],
        html: '<ds-toggle-group type="radio"><ds-toggle value="a"></ds-toggle><ds-toggle value="b" type="checkbox"></ds-toggle></ds-toggle-group>',
      });
      expect(mixed.root.getAttribute('role')).toBe('group');

      const { page } = await render('', 'type="radio"');
      expect(page.root.getAttribute('role')).toBe('radiogroup');
    });

    it('is named by label (aria-label), or keeps the aria-labelledby of the page', async () => {
      const { page } = await render('type="radio" label="Size"');
      expect(page.root.getAttribute('aria-label')).toBe('Size');

      const { page: labelled } = await render('type="radio" aria-labelledby="size-title"');
      expect(labelled.root.hasAttribute('aria-label')).toBe(false);
      expect(labelled.root.getAttribute('aria-labelledby')).toBe('size-title');
    });

    it('a radio group puts the checked radio in the Tab order, else the first enabled one', async () => {
      const { page, click } = await render('type="radio"');
      expect(tabindexes(page)).toEqual(['0', '-1', '-1']);

      await click('c');
      // The group renders, then the toggles it calls setTabbable() on.
      await page.waitForChanges();
      expect(tabindexes(page)).toEqual(['-1', '-1', '0']);

      const disabledFirst = await newSpecPage({
        components: [DSToggleGroup, DSToggle],
        html: '<ds-toggle-group type="radio"><ds-toggle value="a" disabled></ds-toggle><ds-toggle value="b"></ds-toggle><ds-toggle value="c"></ds-toggle></ds-toggle-group>',
      });
      expect(tabindexes(disabledFirst)).toEqual([null, '0', '-1']);
    });

    it('the other groups keep every toggle in the Tab order, also after they stop being a radio group', async () => {
      const { page } = await render('type="checkbox" count="[0, 3]"');
      expect(tabindexes(page)).toEqual(['0', '0', '0']);

      const radios = await render('type="radio"');
      radios.page.root.type = 'switch';
      await radios.page.waitForChanges();
      await radios.page.waitForChanges();
      expect(radios.page.root.getAttribute('role')).toBe('group');
      expect(tabindexes(radios.page)).toEqual(['0', '0', '0']);
    });

    it('the arrow keys move the focus and the selection between the radios, round the group; Home and End to the ends', async () => {
      const { page, checked, changes } = await render('type="radio"');
      const focused = trackFocus(page);
      const [a, b, c] = Array.from(page.root.querySelectorAll('ds-toggle'));
      const press = async (key: string, from = focused()) => {
        const event = keydown(from, key);
        await page.waitForChanges();
        return event;
      };

      expect((await press('ArrowDown', a)).defaultPrevented).toBe(true);
      expect([focused(), checked()]).toEqual([b, ['b']]);
      await press('ArrowRight');
      expect([focused(), checked()]).toEqual([c, ['c']]);
      await press('ArrowDown');
      expect([focused(), checked()]).toEqual([a, ['a']]);
      await press('ArrowUp');
      expect([focused(), checked()]).toEqual([c, ['c']]);
      await press('ArrowLeft');
      expect([focused(), checked()]).toEqual([b, ['b']]);
      await press('Home');
      expect([focused(), checked()]).toEqual([a, ['a']]);
      await press('End');
      expect([focused(), checked()]).toEqual([c, ['c']]);

      await page.waitForChanges();
      expect(tabindexes(page)).toEqual(['-1', '-1', '0']);
      expect(changes).toEqual([['b'], ['c'], ['a'], ['c'], ['b'], ['a'], ['c']]);
    });

    it('the arrow keys skip the disabled radios, and leave the keys with a modifier and the other groups alone', async () => {
      const page = await newSpecPage({
        components: [DSToggleGroup, DSToggle],
        html: '<ds-toggle-group type="radio"><ds-toggle value="a"></ds-toggle><ds-toggle value="b" disabled></ds-toggle><ds-toggle value="c"></ds-toggle></ds-toggle-group>',
      });
      const focused = trackFocus(page);
      const [a, , c] = Array.from(page.root.querySelectorAll('ds-toggle'));

      keydown(a, 'ArrowDown');
      await page.waitForChanges();
      expect([focused(), c.checked]).toEqual([c, true]);

      expect(keydown(c, 'ArrowDown', { altKey: true }).defaultPrevented).toBe(false);
      expect(keydown(c, 'a').defaultPrevented).toBe(false);

      const { page: checkboxes } = await render('type="checkbox" count="[0, 3]"');
      const first = checkboxes.root.querySelector('ds-toggle');
      expect(keydown(first, 'ArrowDown').defaultPrevented).toBe(false);
      await checkboxes.waitForChanges();
      expect(Array.from(checkboxes.root.querySelectorAll('ds-toggle')).some(toggle => toggle.checked)).toBe(false);
    });

    it('disabled, disables its toggles (aria-disabled on the group and on each) and leaves their own disabled as it is', async () => {
      const page = await newSpecPage({
        components: [DSToggleGroup, DSToggle],
        html: '<ds-toggle-group type="checkbox" count="[0, 3]" disabled><ds-toggle value="a"></ds-toggle><ds-toggle value="b" disabled></ds-toggle></ds-toggle-group>',
      });
      const toggles = Array.from(page.root.querySelectorAll('ds-toggle'));
      const states = () =>
        toggles.map(toggle => [!!toggle.disabled, toggle.getAttribute('aria-disabled'), toggle.getAttribute('tabindex'), toggle.classList.contains('--disabled')]);

      expect([page.root.getAttribute('aria-disabled'), page.root.classList.contains('--disabled')]).toEqual(['true', true]);
      expect(states()).toEqual([
        [false, 'true', null, true],
        [true, 'true', null, true],
      ]);
      toggles[0].click();
      await page.waitForChanges();
      expect(toggles[0].checked).toBeFalsy();

      page.root.disabled = false;
      await page.waitForChanges();
      expect(page.root.hasAttribute('aria-disabled')).toBe(false);
      expect(states()).toEqual([
        [false, null, '0', false],
        [true, 'true', null, true],
      ]);

      // A disabled fieldset around the group (the browser calls formDisabledCallback).
      formCallbacks(page.root).formDisabledCallback(true);
      await page.waitForChanges();
      expect(page.root.getAttribute('aria-disabled')).toBe('true');
      expect(states()).toEqual([
        [false, 'true', null, true],
        [true, 'true', null, true],
      ]);
    });
  });
});
