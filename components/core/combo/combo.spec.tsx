import { h } from '@stencil/core';
import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSCombo } from './combo';
import { DSComboSelectedEventDetail, DSOption } from './combo.types';

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
});
