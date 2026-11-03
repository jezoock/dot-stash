import { h } from '@stencil/core';
import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSCombo } from './combo';
import { DSComboSelectedEventDetail, DSOption } from './combo.types';
import { COMBO_TYPE_AHEAD_DELAY } from './combo.constants';

/**
 * The simulated DOM of the spec tests has no focus: `focus()` only dispatches a `focus` event. This gives the document an
 * `activeElement`, which `focus()` sets, dispatching `focusout` and `focusin` as a browser does.
 */
const trackFocus = (page: SpecPage) => {
  const focus: { active: HTMLElement | null } = { active: null };
  let owner = Object.getPrototypeOf(page.body);
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);

  jest.spyOn(owner, 'focus').mockImplementation(function (this: HTMLElement) {
    const previous = focus.active;
    if (previous === this) return;
    focus.active = this;
    previous?.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: this }));
    this.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: previous }));
  });
  Object.defineProperty(page.doc, 'activeElement', { configurable: true, get: () => focus.active ?? page.body });

  return () => page.doc.activeElement as HTMLElement;
};

const dispatchKey = (target: EventTarget, key: string, options: KeyboardEventInit = {}, type = 'keydown') => {
  const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
};

const colors: DSOption[] = [
  { name: 'Red', value: 'red' },
  { name: 'Green', value: 'green' },
  { name: 'Blue', value: 'blue' },
];
const colorsJSON = JSON.stringify(colors);

describe('ds-combo', () => {
  let pages: SpecPage[] = [];

  const listen = (page: SpecPage) => {
    pages.push(page);
    const events: DSComboSelectedEventDetail[] = [];
    page.root.addEventListener('optionSelected', (event: CustomEvent<DSComboSelectedEventDetail>) => events.push(event.detail));
    return events;
  };

  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSCombo], html });
    return { page, events: listen(page) };
  };

  const renderWith = async (props: Record<string, unknown>) => {
    const page = await newSpecPage({ components: [DSCombo], template: () => <ds-combo {...props}></ds-combo> });
    return { page, events: listen(page) };
  };

  const root = (page: SpecPage) => page.root.firstElementChild as HTMLElement;
  const toggleButton = (page: SpecPage) => page.root.querySelector('.ds-combo__selected-option') as HTMLButtonElement;
  const label = (page: SpecPage) => toggleButton(page).textContent;
  const list = (page: SpecPage) => page.root.querySelector('.ds-combo__option-list');
  const items = (page: SpecPage) => Array.from(page.root.querySelectorAll('.ds-combo__option')) as HTMLElement[];
  const isOpen = (page: SpecPage) => root(page).classList.contains('--open');
  const selectedNames = (page: SpecPage) => (page.root.selectedOptions as DSOption[]).map(option => option.name);

  const click = async (page: SpecPage, element: HTMLElement) => {
    element.click();
    await page.waitForChanges();
  };

  /** The outside-click listener is added after a timeout. */
  const flushTimers = () => new Promise(resolve => setTimeout(resolve));

  afterEach(() => {
    // Removes the combos, which stops their document listeners: the document outlives the spec pages.
    pages.forEach(page => page.body.querySelectorAll('ds-combo').forEach(combo => combo.remove()));
    pages = [];
    jest.restoreAllMocks();
  });

  describe('options', () => {
    it('renders without options', async () => {
      const { page } = await render('<ds-combo></ds-combo>');

      expect(toggleButton(page)).not.toBeNull();
      expect(label(page)).toBe('');

      await click(page, toggleButton(page));
      expect(list(page)).not.toBeNull();
      expect(items(page)).toHaveLength(0);
      expect(page.root.selectedOptions).toEqual([]);
    });

    it('renders when options are set to undefined after the load', async () => {
      const { page } = await render(`<ds-combo options='${colorsJSON}'></ds-combo>`);

      page.root.options = undefined;
      await page.waitForChanges();
      await click(page, toggleButton(page));

      expect(items(page)).toHaveLength(0);
    });

    it('logs and ignores an invalid JSON', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const { page } = await render(`<ds-combo options='[{"name": '></ds-combo>`);

      await click(page, toggleButton(page));

      expect(items(page)).toHaveLength(0);
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('[ds-combo] invalid options JSON'));
    });

    it.each([
      ['a JSON string', colorsJSON],
      ['an array', colors],
    ])('reads the options from %s, and shows the first one while nothing is selected', async (_, options) => {
      const { page } = await renderWith({ options });

      expect(label(page)).toBe('Red');
      expect(page.root.selectedOptions).toEqual([]);

      await click(page, toggleButton(page));

      expect(items(page).map(item => item.textContent)).toEqual(['Red', 'Green', 'Blue']);
      expect(items(page).map(item => item.firstElementChild.tagName)).toEqual(['SPAN', 'SPAN', 'SPAN']);
    });

    it('updates the list when the options change', async () => {
      const { page } = await renderWith({ options: colors });

      page.root.options = [{ name: 'Small', value: 's' }];
      await page.waitForChanges();
      await click(page, toggleButton(page));

      expect(items(page).map(item => item.textContent)).toEqual(['Small']);
    });

    it('does not change the option objects it is given', async () => {
      const options = colors.map(option => ({ ...option }));
      const { page } = await renderWith({ options, multiple: true });

      await click(page, toggleButton(page));
      await click(page, items(page)[1]);

      expect(options).toEqual(colors);
    });
  });

  describe('single selection', () => {
    it('opens on a click on the toggle button, selects the clicked option and closes', async () => {
      const { page, events } = await render(`<ds-combo name="color" options='${colorsJSON}'></ds-combo>`);

      expect(toggleButton(page).tagName).toBe('BUTTON');
      expect(toggleButton(page).getAttribute('type')).toBe('button');
      expect(toggleButton(page).getAttribute('aria-expanded')).toBe('false');
      expect(list(page)).toBeNull();

      await click(page, toggleButton(page));
      expect(isOpen(page)).toBe(true);
      expect(toggleButton(page).getAttribute('aria-expanded')).toBe('true');

      await click(page, items(page)[1]);

      expect(isOpen(page)).toBe(false);
      expect(list(page)).toBeNull();
      expect(label(page)).toBe('Green');
      expect(page.root.selectedOptions).toEqual([{ name: 'Green', value: 'green', index: 1, selected: true }]);
      expect(events).toEqual([
        {
          name: 'color',
          option: { name: 'Green', value: 'green', index: 1, selected: true },
          selectedOptions: [{ name: 'Green', value: 'green', index: 1, selected: true }],
        },
      ]);
    });

    it('replaces the selected option', async () => {
      const { page, events } = await render(`<ds-combo options='${colorsJSON}'></ds-combo>`);

      await click(page, toggleButton(page));
      await click(page, items(page)[1]);
      await click(page, toggleButton(page));
      await click(page, items(page)[2]);

      expect(selectedNames(page)).toEqual(['Blue']);
      expect(events.map(event => event.selectedOptions.map(option => option.name))).toEqual([['Green'], ['Blue']]);

      await click(page, toggleButton(page));
      expect(items(page).map(item => item.classList.contains('--selected'))).toEqual([false, false, true]);
    });

    it('shows custom-label instead of the selected option', async () => {
      const { page } = await render(`<ds-combo custom-label="Color" options='${colorsJSON}' selected='{"index": 1}'></ds-combo>`);

      expect(label(page)).toBe('Color');
      expect(selectedNames(page)).toEqual(['Green']);
    });
  });

  describe('multiple selection', () => {
    it('toggles the clicked options and stays open', async () => {
      const { page, events } = await render(`<ds-combo multiple name="colors" options='${colorsJSON}'></ds-combo>`);

      expect(label(page)).toBe('colors');

      await click(page, toggleButton(page));
      await click(page, items(page)[0]);
      await click(page, items(page)[2]);

      expect(isOpen(page)).toBe(true);
      expect(selectedNames(page)).toEqual(['Red', 'Blue']);
      expect(label(page)).toBe('colors (2)');
      expect(items(page).map(item => item.classList.contains('--selected'))).toEqual([true, false, true]);

      await click(page, items(page)[0]);

      expect(selectedNames(page)).toEqual(['Blue']);
      expect(label(page)).toBe('colors (1)');
      expect(events.map(({ name, option, selectedOptions }) => [name, option.name, option.selected, selectedOptions.map(selectedOption => selectedOption.name)])).toEqual([
        ['colors', 'Red', true, ['Red']],
        ['colors', 'Blue', true, ['Red', 'Blue']],
        ['colors', 'Red', false, ['Blue']],
      ]);
    });

    it('shows custom-label instead of the name', async () => {
      const { page } = await render(`<ds-combo multiple name="colors" custom-label="Colors" options='${colorsJSON}' selected='{"index": 0}'></ds-combo>`);

      expect(label(page)).toBe('Colors (1)');
    });
  });

  describe('pre-selection', () => {
    it.each(['{"index": 2}', '{"value": "blue"}', '{"name": "Blue"}'])('selects the option of selected=%s, without an event', async selected => {
      const { page, events } = await render(`<ds-combo options='${colorsJSON}' selected='${selected}'></ds-combo>`);

      expect(selectedNames(page)).toEqual(['Blue']);
      expect(label(page)).toBe('Blue');
      expect(events).toEqual([]);
    });

    it('accepts an object and compares the values as strings', async () => {
      const { page } = await renderWith({
        options: [
          { name: 'One', value: 1 },
          { name: 'Two', value: 2 },
        ],
        selected: { value: '2' },
      });

      expect(selectedNames(page)).toEqual(['Two']);
    });

    it.each(['{"index": 5}', '{"index": -1}', '{"value": "pink"}', '{"name": "Pink"}', '{}', 'not JSON'])('selects nothing for selected=%s', async selected => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const { page } = await render(`<ds-combo options='${colorsJSON}' selected='${selected}'></ds-combo>`);

      expect(page.root.selectedOptions).toEqual([]);
      expect(label(page)).toBe('Red');
    });

    it('selects the options flagged as selected', async () => {
      const options = [
        { name: 'Red', value: 'red', selected: true },
        { name: 'Green', value: 'green' },
        { name: 'Blue', value: 'blue', selected: true },
      ];
      const single = await renderWith({ options });
      expect(selectedNames(single.page)).toEqual(['Red']);

      const multiple = await renderWith({ options, multiple: true });
      expect(selectedNames(multiple.page)).toEqual(['Red', 'Blue']);
    });

    it('replaces the flags in a single combo, and adds to them in a multiple combo', async () => {
      const options = [
        { name: 'Red', value: 'red', selected: true },
        { name: 'Green', value: 'green' },
        { name: 'Blue', value: 'blue' },
      ];
      const single = await renderWith({ options, selected: { name: 'Green' } });
      expect(selectedNames(single.page)).toEqual(['Green']);

      const multiple = await renderWith({ options, selected: { name: 'Green' }, multiple: true });
      expect(selectedNames(multiple.page)).toEqual(['Red', 'Green']);
    });

    it('keeps the user selection when it gets options and a selection with the same content', async () => {
      const { page } = await renderWith({ options: colors, selected: { value: 'green' } });

      await click(page, toggleButton(page));
      await click(page, items(page)[0]);
      page.root.options = colors.map(option => ({ ...option }));
      page.root.selected = { value: 'green' };
      await page.waitForChanges();

      expect(selectedNames(page)).toEqual(['Red']);

      page.root.selected = { value: 'blue' };
      await page.waitForChanges();

      expect(selectedNames(page)).toEqual(['Blue']);
    });

    it('applies a new selected value', async () => {
      const { page, events } = await render(`<ds-combo options='${colorsJSON}' selected='{"index": 0}'></ds-combo>`);

      page.root.selected = { value: 'green' };
      await page.waitForChanges();

      expect(selectedNames(page)).toEqual(['Green']);
      expect(label(page)).toBe('Green');
      expect(events).toEqual([]);
    });
  });

  describe('options that cannot be selected', () => {
    it('does not select a disabled option', async () => {
      const options = [
        { name: 'Red', value: 'red' },
        { name: 'Green', value: 'green', disabled: true, selected: true },
      ];
      const { page, events } = await renderWith({ options, selected: { index: 1 } });

      expect(page.root.selectedOptions).toEqual([]);

      await click(page, toggleButton(page));
      expect(items(page)[1]).toHaveClass('--disabled');

      await click(page, items(page)[1]);

      expect(page.root.selectedOptions).toEqual([]);
      expect(events).toEqual([]);
      expect(isOpen(page)).toBe(true);
    });

    it('shows a first option with an empty value while nothing is selected, and does not select it', async () => {
      const options = [{ name: 'Choose a color', value: '' }, ...colors];
      const { page, events } = await renderWith({ options });

      expect(label(page)).toBe('Choose a color');

      await click(page, toggleButton(page));
      await click(page, items(page)[0]);

      expect(page.root.selectedOptions).toEqual([]);
      expect(events).toEqual([]);

      await click(page, items(page)[3]);
      expect(label(page)).toBe('Blue');
    });
  });

  describe('links', () => {
    const options = [
      { name: 'Home', value: 'home', url: '/home' },
      { name: 'Shop', value: 'shop', url: '/shop', disabled: true },
      { name: 'Text', value: 'text' },
    ];

    it('renders a link for an option with a url, and selects it on click', async () => {
      const { page, events } = await renderWith({ options });

      await click(page, toggleButton(page));
      const [home, shop, text] = items(page).map(item => item.firstElementChild);

      expect(home.tagName).toBe('A');
      expect(home.getAttribute('href')).toBe('/home');
      expect(home.textContent).toBe('Home');
      expect(text.tagName).toBe('SPAN');

      // A disabled link does not navigate.
      expect(shop.tagName).toBe('A');
      expect(shop.hasAttribute('href')).toBe(false);
      expect(shop.getAttribute('aria-disabled')).toBe('true');

      await click(page, home as HTMLElement);

      expect(selectedNames(page)).toEqual(['Home']);
      expect(events).toHaveLength(1);
    });
  });

  describe('image mode', () => {
    const options = [
      { name: 'Beach', value: 'beach', image: '/beach.jpg' },
      { name: 'Forest', value: 'forest', image: '/forest.jpg' },
      { name: 'Plain', value: 'plain' },
    ];

    it('keeps the hidden list in the DOM while closed, with the images', async () => {
      const { page } = await renderWith({ options, mode: 'image' });

      expect(root(page)).toHaveClass('--image');
      expect(list(page)).toHaveClass('--hidden');
      expect(Array.from(page.root.querySelectorAll('img')).map(image => [image.getAttribute('src'), image.getAttribute('alt')])).toEqual([
        ['/beach.jpg', ''],
        ['/forest.jpg', ''],
      ]);
      expect(items(page).map(item => item.querySelector('span').textContent)).toEqual(['Beach', 'Forest', 'Plain']);

      await click(page, toggleButton(page));
      expect(list(page)).not.toHaveClass('--hidden');

      await click(page, items(page)[1]);
      expect(list(page)).toHaveClass('--hidden');
      expect(selectedNames(page)).toEqual(['Forest']);
    });

    it('renders no image in the other modes', async () => {
      const { page } = await renderWith({ options });

      await click(page, toggleButton(page));

      expect(page.root.querySelector('img')).toBeNull();
    });
  });

  describe('dropdown mode', () => {
    it('renders no toggle button: the methods open the list', async () => {
      const { page } = await render(`<ds-combo mode="dropdown" options='${colorsJSON}'></ds-combo>`);

      expect(toggleButton(page)).toBeNull();
      expect(list(page)).toBeNull();

      await page.root.open();
      await page.waitForChanges();

      expect(items(page)).toHaveLength(3);
    });
  });

  describe('methods', () => {
    it('open, close and toggle the list', async () => {
      const { page } = await render(`<ds-combo options='${colorsJSON}'></ds-combo>`);
      const run = async (method: () => Promise<void>) => {
        await method();
        await page.waitForChanges();
        return isOpen(page);
      };

      expect(await run(() => page.root.open())).toBe(true);
      expect(await run(() => page.root.open())).toBe(true);
      expect(await run(() => page.root.close())).toBe(false);
      expect(await run(() => page.root.toggle())).toBe(true);
      expect(await run(() => page.root.toggle())).toBe(false);
      expect(await run(() => page.root.toggle(true))).toBe(true);
      expect(await run(() => page.root.toggle(true))).toBe(true);
      expect(await run(() => page.root.toggle(false))).toBe(false);
      expect(list(page)).toBeNull();
    });
  });

  describe('outside clicks', () => {
    const renderInPage = async (comboAttributes = '') => {
      const { page } = await render(`<div><ds-combo options='${colorsJSON}' ${comboAttributes}></ds-combo><button id="outside">Outside</button></div>`);
      const combo = page.body.querySelector('ds-combo');
      const outside = page.body.querySelector('#outside') as HTMLElement;
      return { page, combo, outside };
    };

    it('a click outside closes the list, a click inside does not', async () => {
      const { page, combo, outside } = await renderInPage('multiple');
      const comboToggle = combo.querySelector('.ds-combo__selected-option') as HTMLElement;

      await click(page, comboToggle);
      await flushTimers();
      await click(page, combo.querySelector('.ds-combo__option') as HTMLElement);
      expect(combo.firstElementChild).toHaveClass('--open');

      await click(page, outside);
      expect(combo.firstElementChild).not.toHaveClass('--open');
    });

    it('the click that opens the list from outside does not close it', async () => {
      const { page, combo, outside } = await renderInPage();
      // As ds-trigger does: the method of the element runs once the component is ready, after the listener.
      outside.addEventListener('click', () => combo.open());

      await click(page, outside);
      await flushTimers();
      await page.waitForChanges();
      expect(combo.firstElementChild).toHaveClass('--open');

      await click(page, outside);
      await flushTimers();
      await page.waitForChanges();
      expect(combo.firstElementChild).toHaveClass('--open');
      await click(page, page.body);
      expect(combo.firstElementChild).not.toHaveClass('--open');
    });

    it('stops listening to the document once closed or removed', async () => {
      const { page, combo } = await renderInPage();
      const addEventListener = jest.spyOn(page.doc, 'addEventListener');
      const removeEventListener = jest.spyOn(page.doc, 'removeEventListener');
      const clickListeners = (spy: jest.SpyInstance) => spy.mock.calls.filter(([type]) => type === 'click').map(([, listener]) => listener);

      await combo.open();
      await flushTimers();
      const [listener] = clickListeners(addEventListener);
      expect(listener).toEqual(expect.any(Function));

      await combo.close();
      expect(clickListeners(removeEventListener)).toContain(listener);

      await combo.open();
      await flushTimers();
      removeEventListener.mockClear();
      combo.remove();
      await page.waitForChanges();

      expect(clickListeners(removeEventListener)).toEqual([clickListeners(addEventListener)[1]]);
    });
  });

  describe('overlay', () => {
    it('is rendered while the list is open, and a click on it closes the list', async () => {
      const { page } = await render(`<ds-combo overlay options='${colorsJSON}'></ds-combo>`);
      const overlay = () => page.root.querySelector('.ds-combo__overlay') as HTMLElement;

      expect(root(page)).toHaveClass('--with-overlay');
      expect(overlay()).toBeNull();

      await click(page, toggleButton(page));
      expect(overlay()).not.toBeNull();

      await click(page, overlay());
      expect(isOpen(page)).toBe(false);
      expect(overlay()).toBeNull();
    });
  });

  describe('root element', () => {
    it('has a unique id that does not change', async () => {
      const { page } = await render(`<ds-combo name="a"></ds-combo><ds-combo name="a"></ds-combo>`);
      const [first, second] = Array.from(page.body.querySelectorAll('ds-combo')) as HTMLDsComboElement[];
      const firstId = first.firstElementChild.id;

      expect(firstId).toMatch(/^ds-combo-[0-9a-f-]{36}$/);
      expect(second.firstElementChild.id).not.toBe(firstId);

      page.body.appendChild(page.doc.createElement('ds-combo'));
      await first.open();
      await page.waitForChanges();

      expect(first.firstElementChild.id).toBe(firstId);
    });

    it('has a class for its position, left by default', async () => {
      const { page } = await render('<ds-combo></ds-combo>');

      expect(root(page)).toHaveClass('--position-left');

      page.root.position = 'top';
      await page.waitForChanges();

      expect(root(page)).toHaveClass('--position-top');
      expect(root(page)).not.toHaveClass('--position-left');
      expect(page.root.getAttribute('position')).toBe('top');
    });
  });
  describe('accessibility', () => {
    const listOf = (page: SpecPage) => list(page) as HTMLElement;
    /** The options as [name, aria-selected, aria-disabled], and whether the --active one is the active descendant. */
    const optionStates = (page: SpecPage) => items(page).map(item => [item.textContent, item.getAttribute('aria-selected'), item.getAttribute('aria-disabled')]);
    /** The name of the active option: the element the combobox (or the list, in dropdown mode) points to. */
    const activeName = (page: SpecPage, owner: HTMLElement = toggleButton(page)) => {
      const id = owner.getAttribute('aria-activedescendant');
      const active = items(page).filter(item => item.classList.contains('--active'));
      expect(active.map(item => item.id)).toEqual(id ? [id] : []);
      return id ? page.doc.getElementById(id).textContent : null;
    };

    /** A combo with the focus on its combobox; `press()` dispatches a key on the focused element. */
    const renderFocused = async (props: Record<string, unknown>) => {
      const { page, events } = await renderWith(props);
      const focused = trackFocus(page);
      toggleButton(page)?.focus();
      const press = async (key: string, options: KeyboardEventInit = {}) => {
        const event = dispatchKey(focused(), key, options);
        await page.waitForChanges();
        return event;
      };
      return { page, events, focused, press };
    };

    const palette: DSOption[] = [
      { name: 'Choose a color', value: '' },
      { name: 'Red', value: 'red' },
      { name: 'Green', value: 'green', disabled: true },
      { name: 'Blue', value: 'blue' },
      { name: 'Black', value: 'black' },
    ];

    it('renders a combobox that controls a listbox of options with ids, aria-selected and aria-disabled', async () => {
      const { page } = await renderWith({ options: palette, selected: { value: 'blue' } });
      const button = toggleButton(page);

      expect([button.getAttribute('role'), button.getAttribute('aria-haspopup'), button.getAttribute('aria-expanded')]).toEqual(['combobox', 'listbox', 'false']);
      // Closed: the list is not rendered, the combobox controls nothing yet.
      expect(button.hasAttribute('aria-controls')).toBe(false);
      expect(button.hasAttribute('aria-activedescendant')).toBe(false);

      await click(page, button);
      const listbox = listOf(page);

      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.getAttribute('aria-controls')).toBe(listbox.id);
      expect(listbox.id).toBe(`${root(page).id}-listbox`);
      // Out of the Tab order (a list that scrolls is a Tab stop in Chrome): the combobox keeps the focus and points to the option.
      expect([listbox.tagName, listbox.getAttribute('role'), listbox.hasAttribute('aria-multiselectable'), listbox.getAttribute('tabindex')]).toEqual([
        'UL',
        'listbox',
        false,
        '-1',
      ]);
      expect(listbox.hasAttribute('aria-activedescendant')).toBe(false);
      // A valid structure: the list hangs from a div (it was a menu holding a ul).
      expect(page.root.querySelector('menu')).toBeNull();
      expect(listbox.parentElement.tagName).toBe('DIV');
      expect(listbox.parentElement).toHaveClass('ds-combo__menu');
      expect(items(page).map(item => [item.getAttribute('role'), item.id])).toEqual(palette.map((_, index) => ['option', `${root(page).id}-option-${index}`]));
      // The placeholder and the disabled option cannot be chosen.
      expect(optionStates(page)).toEqual([
        ['Choose a color', 'false', 'true'],
        ['Red', 'false', null],
        ['Green', 'false', 'true'],
        ['Blue', 'true', null],
        ['Black', 'false', null],
      ]);
      expect(activeName(page)).toBe('Blue');
    });

    it('a multiple combo has a multiselectable listbox', async () => {
      const { page } = await renderWith({ options: colors, multiple: true, selected: { index: 1 } });

      await click(page, toggleButton(page));

      expect(listOf(page).getAttribute('aria-multiselectable')).toBe('true');
      expect(optionStates(page).map(([, selected]) => selected)).toEqual(['false', 'true', 'false']);
    });

    it.each([
      ['label', { label: 'Color', customLabel: 'Pick', name: 'color' }, 'Color', null],
      ['labelledby', { labelledby: 'color-label', label: 'Color' }, null, 'color-label'],
      ['custom-label', { customLabel: 'Pick', name: 'color' }, 'Pick', null],
      ['name', { name: 'color' }, 'color', null],
      ['nothing', {}, null, null],
    ])('is named by %s (combobox and listbox)', async (_, props, ariaLabel, ariaLabelledby) => {
      const { page } = await renderWith({ options: colors, ...props });

      await click(page, toggleButton(page));

      for (const element of [toggleButton(page), listOf(page)]) {
        expect([element.getAttribute('aria-label'), element.getAttribute('aria-labelledby')]).toEqual([ariaLabel, ariaLabelledby]);
      }
    });

    it.each(['Enter', ' ', 'ArrowDown', 'ArrowUp'])('%p opens the list on the selected option, without selecting', async key => {
      const { page, events, press } = await renderFocused({ options: palette, selected: { value: 'blue' } });

      expect((await press(key)).defaultPrevented).toBe(true);

      expect(isOpen(page)).toBe(true);
      expect(activeName(page)).toBe('Blue');
      expect(events).toEqual([]);
    });

    it('opens on the first option that can be chosen without a selection, Home and End on the first and the last one', async () => {
      const first = await renderFocused({ options: palette });
      await first.press('ArrowDown');
      expect(activeName(first.page)).toBe('Red');

      const end = await renderFocused({ options: palette, selected: { value: 'red' } });
      await end.press('End');
      expect(activeName(end.page)).toBe('Black');

      const home = await renderFocused({ options: palette, selected: { value: 'black' } });
      await home.press('Home');
      expect(activeName(home.page)).toBe('Red');
    });

    it('Space on the combobox does not click it on keyup (the native button would toggle the list again)', async () => {
      const { page } = await renderFocused({ options: colors });

      expect(dispatchKey(toggleButton(page), ' ', {}, 'keyup').defaultPrevented).toBe(true);
    });

    it('Down, Up, Home and End move the active option over the options that can be chosen, and stop at the ends', async () => {
      const { page, press, events } = await renderFocused({ options: palette });

      await press('ArrowDown');
      expect(activeName(page)).toBe('Red');
      expect((await press('ArrowDown')).defaultPrevented).toBe(true);
      // Green is disabled.
      expect(activeName(page)).toBe('Blue');
      await press('ArrowDown');
      await press('ArrowDown');
      expect(activeName(page)).toBe('Black');
      await press('ArrowUp');
      expect(activeName(page)).toBe('Blue');
      await press('Home');
      expect(activeName(page)).toBe('Red');
      // The placeholder is skipped too.
      await press('ArrowUp');
      expect(activeName(page)).toBe('Red');
      await press('End');
      expect(activeName(page)).toBe('Black');

      expect(isOpen(page)).toBe(true);
      expect(events).toEqual([]);
    });

    it('Page Down and Page Up move the active option by 10, stopping at the ends', async () => {
      const options = Array.from({ length: 25 }, (_, index) => ({ name: `Option ${index}`, value: `${index}` }));
      const { page, press } = await renderFocused({ options });

      await press('ArrowDown');
      await press('PageDown');
      expect(activeName(page)).toBe('Option 10');
      await press('PageDown');
      await press('PageDown');
      expect(activeName(page)).toBe('Option 24');
      await press('PageUp');
      expect(activeName(page)).toBe('Option 14');
      await press('PageUp');
      await press('PageUp');
      expect(activeName(page)).toBe('Option 0');
    });

    it('type-ahead: typed characters move to the next option they start, the same one repeated goes round them', async () => {
      const options = ['Blue', 'Gray', 'Green', 'Black', 'Brown'].map(name => ({ name, value: name.toLowerCase() }));
      const { page, press } = await renderFocused({ options });

      // Closed: the character opens the list on the option it starts.
      expect((await press('g')).defaultPrevented).toBe(true);
      expect([isOpen(page), activeName(page)]).toEqual([true, 'Gray']);
      // "gr" still matches Gray, "gre" Green.
      await press('r');
      expect(activeName(page)).toBe('Gray');
      await press('E');
      expect(activeName(page)).toBe('Green');

      page.rootInstance.clearTypeAhead();
      await press('b');
      expect(activeName(page)).toBe('Black');
      await press('b');
      expect(activeName(page)).toBe('Brown');
      await press('b');
      expect(activeName(page)).toBe('Blue');
      // No match: the active option stays.
      await press('z');
      expect(activeName(page)).toBe('Blue');
    });

    it(`type-ahead: a character typed ${COMBO_TYPE_AHEAD_DELAY} ms after the last one starts a new search`, async () => {
      const options = ['Red', 'Gray', 'Green'].map(name => ({ name, value: name.toLowerCase() }));
      const { page, press } = await renderFocused({ options });

      await press('g');
      await press('r');
      expect(activeName(page)).toBe('Gray');
      await new Promise(resolve => setTimeout(resolve, COMBO_TYPE_AHEAD_DELAY + 50));
      await press('r');
      expect(activeName(page)).toBe('Red');
    });

    it.each(['Enter', ' '])('%p selects the active option of a single combo, closes the list and keeps the focus on the combobox', async key => {
      const { page, events, press, focused } = await renderFocused({ name: 'color', options: palette });

      await press('ArrowDown');
      await press('ArrowDown');
      expect((await press(key)).defaultPrevented).toBe(true);

      expect(isOpen(page)).toBe(false);
      expect(label(page)).toBe('Blue');
      expect(events.map(event => event.option.name)).toEqual(['Blue']);
      expect(focused()).toBe(toggleButton(page));
      expect(toggleButton(page).hasAttribute('aria-activedescendant')).toBe(false);
    });

    it('Enter and Space toggle the active option of a multiple combo and keep the list open', async () => {
      const { page, events, press } = await renderFocused({ name: 'colors', options: colors, multiple: true });

      await press('ArrowDown');
      await press(' ');
      await press('ArrowDown');
      await press('Enter');
      expect([isOpen(page), selectedNames(page), label(page)]).toEqual([true, ['Red', 'Green'], 'colors (2)']);

      await press(' ');
      expect(selectedNames(page)).toEqual(['Red']);
      expect(activeName(page)).toBe('Green');
      expect(events.map(event => [event.option.name, event.option.selected])).toEqual([
        ['Red', true],
        ['Green', true],
        ['Green', false],
      ]);

      // A key held down does not repeat.
      await press(' ', { repeat: true });
      expect(selectedNames(page)).toEqual(['Red']);
    });

    it('Escape closes the list without selecting, keeps the focus, and goes no further; closed, it is left to the page', async () => {
      const { page, events, press, focused } = await renderFocused({ options: colors, selected: { index: 0 } });
      const pageKeys: string[] = [];
      page.body.addEventListener('keydown', (event: KeyboardEvent) => pageKeys.push(event.key));

      await press('ArrowDown');
      await press('ArrowDown');
      expect((await press('Escape')).defaultPrevented).toBe(true);

      expect([isOpen(page), selectedNames(page), events]).toEqual([false, ['Red'], []]);
      expect(focused()).toBe(toggleButton(page));
      expect(pageKeys).toEqual(['ArrowDown', 'ArrowDown']);

      expect((await press('Escape')).defaultPrevented).toBe(false);
      expect(pageKeys).toEqual(['ArrowDown', 'ArrowDown', 'Escape']);
    });

    it('Tab closes the list, selecting the active option of a single combo, and lets the focus move on', async () => {
      const single = await renderFocused({ options: colors, selected: { index: 0 } });
      await single.press('ArrowDown');
      await single.press('ArrowDown');
      expect((await single.press('Tab')).defaultPrevented).toBe(false);
      expect([isOpen(single.page), selectedNames(single.page), single.events.length]).toEqual([false, ['Green'], 1]);

      // On the selected option: no new event.
      await single.press('ArrowDown');
      await single.press('Tab');
      expect(single.events.length).toBe(1);

      const multiple = await renderFocused({ options: colors, multiple: true });
      await multiple.press('ArrowDown');
      await multiple.press('Tab');
      expect([isOpen(multiple.page), selectedNames(multiple.page)]).toEqual([false, []]);
    });

    it('Alt+Up selects the active option and closes the list, Alt+Down opens it; Ctrl and Meta are left to the browser', async () => {
      const { page, press } = await renderFocused({ options: colors });

      await press('ArrowDown', { altKey: true });
      expect(isOpen(page)).toBe(true);
      await press('ArrowDown', { altKey: true });
      expect(activeName(page)).toBe('Red');
      await press('ArrowDown');
      await press('ArrowUp', { altKey: true });
      expect([isOpen(page), selectedNames(page)]).toEqual([false, ['Green']]);

      expect((await press('ArrowDown', { ctrlKey: true })).defaultPrevented).toBe(false);
      expect((await press('a', { metaKey: true })).defaultPrevented).toBe(false);
      expect(isOpen(page)).toBe(false);
    });

    it('Enter on a link option clicks its link: the option is selected and the link followed; the links are out of the Tab order', async () => {
      const options = [
        { name: 'Home', value: 'home', url: '/home' },
        { name: 'Shop', value: 'shop', url: '/shop', disabled: true },
        { name: 'Docs', value: '', url: '/docs' },
      ];
      const { page, press, events } = await renderFocused({ options });

      await press('ArrowDown');
      const links = items(page).map(item => item.querySelector('a'));
      const linkClicks: string[] = [];
      links.forEach(link => link.addEventListener('click', () => linkClicks.push(link.textContent)));
      expect(links.map(link => link.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1']);
      // A link with an empty value is not selected, but it can be followed; the disabled one is skipped.
      expect(optionStates(page).map(([, , disabled]) => disabled)).toEqual([null, 'true', null]);

      await press('ArrowDown');
      expect(activeName(page)).toBe('Docs');
      await press('Enter');
      expect(linkClicks).toEqual(['Docs']);
      expect(events).toEqual([]);

      await press('ArrowUp');
      await press('Enter');
      expect(linkClicks).toEqual(['Docs', 'Home']);
      expect([isOpen(page), selectedNames(page)]).toEqual([false, ['Home']]);
      expect(events).toHaveLength(1);
    });

    it('Tab and Alt+Up do not select a link option (it would not be followed)', async () => {
      const { page, press } = await renderFocused({ options: [{ name: 'Home', value: 'home', url: '/home' }] });

      await press('ArrowDown');
      await press('Tab');

      expect(page.root.selectedOptions).toEqual([]);
    });

    it('a mouse down in the list keeps the focus; a click on an option makes it active (multiple) or gives the focus back (single)', async () => {
      const multiple = await renderFocused({ options: colors, multiple: true });
      await multiple.press('ArrowDown');
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      items(multiple.page)[2].dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      await click(multiple.page, items(multiple.page)[2]);
      expect(activeName(multiple.page)).toBe('Blue');

      const single = await renderFocused({ options: colors });
      await click(single.page, toggleButton(single.page));
      single.page.body.focus();
      await click(single.page, items(single.page)[1]);
      expect(single.focused()).toBe(toggleButton(single.page));
    });

    it('resets the active option when the options change while the list is open', async () => {
      const { page, press } = await renderFocused({ options: colors });

      await press('ArrowDown');
      await press('End');
      page.root.options = [{ name: 'Small', value: 's' }];
      await page.waitForChanges();

      expect(activeName(page)).toBe('Small');
    });

    describe('dropdown mode', () => {
      const renderDropdown = async (props: Record<string, unknown> = {}) => {
        const page = await newSpecPage({
          components: [DSCombo],
          template: () => (
            <div>
              <button id="opener">Menu</button>
              <ds-combo mode="dropdown" label="Colors" options={colors} {...props}></ds-combo>
            </div>
          ),
        });
        pages.push(page);
        const combo = page.body.querySelector('ds-combo');
        const events: DSComboSelectedEventDetail[] = [];
        combo.addEventListener('optionSelected', (event: CustomEvent<DSComboSelectedEventDetail>) => events.push(event.detail));
        const focused = trackFocus(page);
        const opener = page.body.querySelector('#opener') as HTMLElement;
        opener.focus();
        const listbox = () => combo.querySelector('.ds-combo__option-list') as HTMLElement;
        const press = async (key: string) => {
          const event = dispatchKey(focused(), key);
          await page.waitForChanges();
          return event;
        };
        const open = async () => {
          await combo.open();
          await page.waitForChanges();
        };
        return { page, combo, events, focused, opener, listbox, press, open };
      };

      const activeOf = (listbox: HTMLElement) => listbox.ownerDocument.getElementById(listbox.getAttribute('aria-activedescendant'))?.textContent;

      it('open() moves the focus to the listbox, which takes the keys and points to the active option', async () => {
        const { combo, focused, listbox, press, open } = await renderDropdown();

        await open();

        expect(focused()).toBe(listbox());
        expect([listbox().getAttribute('role'), listbox().getAttribute('tabindex'), listbox().getAttribute('aria-label')]).toEqual(['listbox', '-1', 'Colors']);
        expect(activeOf(listbox())).toBe('Red');
        await press('ArrowDown');
        expect(activeOf(listbox())).toBe('Green');
        expect(combo.querySelector('button')).toBeNull();
      });

      it('a selection with Enter, or Escape, closes the list and gives the focus back to the element that had it', async () => {
        const { combo, events, focused, opener, press, open } = await renderDropdown();

        await open();
        await press('ArrowDown');
        await press('Enter');
        expect([combo.firstElementChild.classList.contains('--open'), events.map(event => event.option.name)]).toEqual([false, ['Green']]);
        expect(focused()).toBe(opener);

        await open();
        await press('Escape');
        expect(combo.firstElementChild).not.toHaveClass('--open');
        expect(focused()).toBe(opener);
      });

      it('Tab and close() give the focus back to the opener when it is in the list', async () => {
        const { combo, focused, opener, page, open, press } = await renderDropdown();

        await open();
        await press('Tab');
        expect(focused()).toBe(opener);

        await open();
        await combo.close();
        await page.waitForChanges();
        expect(focused()).toBe(opener);
      });
    });

    it('image mode: the list, hidden while closed, is the listbox the combobox controls; its images are decorative', async () => {
      const options = [
        { name: 'Beach', value: 'beach', image: '/beach.jpg' },
        { name: 'Forest', value: 'forest', image: '/forest.jpg' },
      ];
      const { page, press } = await renderFocused({ options, mode: 'image' });

      expect(toggleButton(page).getAttribute('aria-controls')).toBe(listOf(page).id);
      expect(Array.from(page.root.querySelectorAll('img')).map(image => image.getAttribute('alt'))).toEqual(['', '']);

      await press('ArrowDown');
      await press('ArrowDown');
      await press('Enter');
      expect(selectedNames(page)).toEqual(['Forest']);
      expect(listOf(page)).toHaveClass('--hidden');
    });
  });
});
