import { afterEach, beforeEach, describe, expect, it, vi, type Mock, type MockInstance } from 'vitest';
import '../grid/grid';
import '../grid/grid-item/grid-item';
import type { DSRsp } from './responsive';
import './responsive';
import { componentClass, fakeMatchMedia, mockTokens, renderPage } from '../../../test/helpers';

/** The breakpoint custom properties of the compiled themes, on :root. */
const THEME_TOKENS: Record<string, string> = {
  '--ds-bp-xxs': '360px',
  '--ds-bp-xs': '576px',
  '--ds-bp-sm': '768px',
  '--ds-bp-md': '992px',
  '--ds-bp-lg': '1200px',
  '--ds-bp-xl': '1400px',
  '--ds-bp-xxl': '1600px',
  '--ds-bp-labels': 'xxs xs sm md lg xl xxl',
};

/** No theme stylesheet: no custom property. */
const NO_THEME: Record<string, string> = {};

/** The media queries of the boundaries of the theme breakpoints, which ds-rsp watches. */
const THEME_QUERIES = ['(min-width: 576px)', '(min-width: 768px)', '(min-width: 992px)', '(min-width: 1200px)', '(min-width: 1400px)', '(min-width: 1600px)'];

describe('ds-rsp', () => {
  /** The custom properties the stubbed getComputedStyle returns: the mock DOM computes no style. */
  let themeTokens: Record<string, string>;
  let warnSpy: MockInstance;
  let media: ReturnType<typeof fakeMatchMedia>;

  const stubTheme = () => mockTokens(() => themeTokens);

  /** Resizes the viewport: the media queries that change dispatch their change event, at once. */
  const resizeTo = (width: number) => media.resize(width);

  /** The page is reset first, then the spies and the fake matchMedia are installed, then the content is rendered. */
  const render = async (html: string) => {
    const page = await renderPage('');

    stubTheme();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    media = fakeMatchMedia(1000);

    await page.setContent(html);
    return page;
  };

  beforeEach(() => {
    themeTokens = THEME_TOKENS;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets the data-rsp params of the current breakpoint, or of the nearest smaller one', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"sm": {"width": 3}, "lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');

    expect(item['width']).toBe(3);

    resizeTo(1300);
    expect(item['width']).toBe(5);

    resizeTo(400);
    expect(item['width']).toBe('1');
  });

  it('marks the initialised subscribers with a data-rsp-init attribute', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);

    expect(page.body.querySelector('#item').getAttribute('data-rsp-init')).toBe('true');
    expect(page.body.querySelectorAll(page.root.subscriberSelector)).toHaveLength(0);
  });

  it('watches one media query per boundary of the breakpoints, and applies a change at once, only when the breakpoint changes', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"sm": {"width": 3}, "lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');
    const onChange = vi.fn();
    item.addEventListener('breakpointChange', onChange);

    expect(media.watched()).toEqual(THEME_QUERIES);

    // Within md (992 to 1199 px): nothing.
    resizeTo(1100);
    resizeTo(1199.5);
    expect(onChange).not.toHaveBeenCalled();

    // Across a boundary: at once, without waiting.
    resizeTo(1200);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(item['width']).toBe(5);

    // From lg to xxs, five boundaries: one change.
    resizeTo(400);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1][0].detail.current).toEqual({ label: 'xxs', limits: [0, 575] });
    expect(item['width']).toBe('1');
  });

  it.each([
    [575, 'xxs'],
    [575.5, 'xxs'],
    [576, 'xs'],
    [767, 'xs'],
    [767.9, 'xs'],
    [768, 'sm'],
    [991.5, 'sm'],
    [992, 'md'],
    [1199, 'md'],
    [1200, 'lg'],
    [1599.9, 'xl'],
    [1600, 'xxl'],
  ])('at %j px, the breakpoint is %j (the media queries of the minimums, at a fractional width too)', async (width, label) => {
    const page = await render(`<ds-rsp></ds-rsp>`);

    resizeTo(width);
    expect((await page.root.getCurrentBreakpoint()).label).toBe(label);
  });

  it('removes the listeners of its media queries', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');

    expect(media.watched()).toEqual(THEME_QUERIES);

    page.root.remove();
    await page.waitForChanges();

    expect(media.watched()).toEqual([]);

    // At 1000 px (md), the item has the initial value, stored for the smallest breakpoint.
    expect(item['width']).toBe('1');
    resizeTo(1300);
    expect(item['width']).toBe('1');
  });

  it('listens again when it is put back in the document', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');
    const rsp = page.root;

    rsp.remove();
    await page.waitForChanges();
    expect(media.watched()).toEqual([]);
    page.body.appendChild(rsp);
    await page.waitForChanges();
    resizeTo(1300);

    expect(item['width']).toBe(5);
    expect(media.watched()).toEqual(THEME_QUERIES);
  });

  it('tells whether the window grows, up to the last breakpoint', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" data-use-rsp></div>`);
    const details = [];
    page.body.querySelector('#item').addEventListener('breakpointChange', (event: CustomEvent) => details.push(event.detail));

    resizeTo(1700);
    resizeTo(1000);

    expect(details.map(({ current, isGrowing }) => [current.label, isGrowing])).toEqual([
      ['xxl', true],
      ['md', false],
    ]);
  });

  it('does not crash without the theme stylesheet: it warns and dispatches no breakpoint event', async () => {
    themeTokens = NO_THEME;
    const page = await render(`<div id="item" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);
    const item = page.body.querySelector('#item');
    const onBreakpointChange = vi.fn();
    item.addEventListener('breakpointChange', onBreakpointChange);

    page.body.appendChild(page.doc.createElement('ds-rsp'));
    await page.waitForChanges();
    resizeTo(500);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[ds-rsp]'));
    expect(onBreakpointChange).not.toHaveBeenCalled();
    expect(item.hasAttribute('data-rsp-init')).toBe(false);
    expect(media.watched()).toEqual([]);
  });

  it('uses the breakpoints property (label: minimum width) instead of the theme ones', async () => {
    themeTokens = NO_THEME;
    const page = await render(`<ds-rsp breakpoints='{"small": 0, "large": 900}'></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"large": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');

    expect(await page.root.getData()).toEqual({ breakpoints: { small: [0, 899], large: [900] } });
    expect(media.watched()).toEqual(['(min-width: 900px)']);
    expect(item['width']).toBe(5);

    // Back to the smallest breakpoint: the initial value is restored.
    resizeTo(500);
    expect(item['width']).toBe('1');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('reads the params from the attribute named by property-name', async () => {
    const page = await render(`<ds-rsp property-name="data-bp"></ds-rsp><div id="item" width="1" data-use-rsp data-bp='{"sm": {"width": 3}}'></div>`);
    const item = page.body.querySelector('#item');

    expect(item['width']).toBe(3);
    expect(page.body.querySelector('#item').hasAttribute('data-rsp')).toBe(false);

    resizeTo(400);
    expect(item['width']).toBe('1');
  });

  it('ignores invalid data-rsp JSON with a warning', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="bad" data-use-rsp data-rsp="[object Object]"></div><div id="good" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);

    expect(page.body.querySelector('#good')['width']).toBe(3);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[ds-rsp]'), page.body.querySelector('#bad'));
  });

  it('emits breakpointChange from ds-rsp (it bubbles), once the subscribers have their params', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');
    const events: [EventTarget, string, string, boolean, unknown][] = [];
    page.doc.addEventListener('breakpointChange', (event: CustomEvent) => {
      const { current, previous, isGrowing } = event.detail;
      events.push([event.target, current.label, previous?.label, isGrowing, item['width']]);
    });

    resizeTo(1300);
    resizeTo(1250);
    resizeTo(400);

    expect(events).toEqual([
      [page.root, 'lg', 'md', true, 5],
      [page.root, 'xxs', 'lg', false, '1'],
    ]);
  });

  it('emits breakpointChange when it starts, with the breakpoints', async () => {
    const page = await renderPage('');
    stubTheme();
    media = fakeMatchMedia(1000);
    const details = [];
    page.doc.addEventListener('breakpointChange', (event: CustomEvent) => details.push(event.detail));

    await page.setContent('<ds-rsp></ds-rsp>');

    expect(details).toEqual([{ all: (await page.root.getData()).breakpoints, current: { label: 'md', limits: [992, 1199] }, previous: undefined, isGrowing: false }]);
  });

  it('a subscriber that contains ds-rsp handles each change once', async () => {
    const applyParams = vi.spyOn(componentClass<DSRsp>('ds-rsp').prototype, 'applyParams');
    const page = await render(`<ds-grid id="grid" cols="2" data-rsp='{"lg": {"cols": 4}}'><ds-grid-item></ds-grid-item><ds-rsp></ds-rsp></ds-grid>`);
    const grid = page.body.querySelector('ds-grid');
    const callsOnGrid = () => applyParams.mock.calls.filter(([element]) => element === grid).length;
    applyParams.mockClear();

    resizeTo(1300);
    await page.waitForChanges();

    expect(grid.cols).toBe(4);
    expect(callsOnGrid()).toBe(1);

    applyParams.mockClear();
    resizeTo(1250);
    resizeTo(1300);
    expect(callsOnGrid()).toBe(0);
  });

  it('changes the props of ds-grid and ds-grid-item per breakpoint: their custom properties follow, at once', async () => {
    const page = await render(
      `<ds-rsp></ds-rsp><ds-grid cols="2" h-gap="10px" data-use-rsp data-rsp='{"md": {"cols": 4, "hGap": "20px"}, "xl": {"cols": 6}}'><ds-grid-item width="1" data-use-rsp data-rsp='{"md": {"width": 2}}'></ds-grid-item></ds-grid>`,
    );
    const grid = page.body.querySelector<HTMLElement>('.ds-grid');
    const item = page.body.querySelector<HTMLElement>('ds-grid-item');
    const layout = async () => {
      await page.waitForChanges();
      return [grid.style.getPropertyValue('--ds-grid-cols'), grid.style.getPropertyValue('--ds-grid-h-gap'), item.style.getPropertyValue('--ds-grid-span')];
    };

    // 1000 px: md.
    expect(await layout()).toEqual(['4', '20px', '2']);
    resizeTo(1500);
    expect(await layout()).toEqual(['6', '20px', '2']);
    resizeTo(400);
    expect(await layout()).toEqual(['2', '10px', '1']);
    expect(item.getAttribute('style')).toBe('--ds-grid-span: 1;');
  });

  it('reads the initial value of a camelCase property from the property, not from a lowercase attribute', async () => {
    const page = await render(`<ds-rsp></ds-rsp><ds-grid h-gap="10px" data-use-rsp data-rsp='{"lg": {"hGap": "30px"}}'></ds-grid>`);
    const grid = page.body.querySelector('ds-grid');

    expect(JSON.parse(grid.getAttribute('data-rsp'))).toEqual({ xxs: { hGap: '10px' }, lg: { hGap: '30px' } });

    resizeTo(1300);
    expect(grid.hGap).toBe('30px');

    resizeTo(400);
    expect(grid.hGap).toBe('10px');
  });

  it('falls back on the kebab-case attribute of an element without the property', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" max-items="2" data-use-rsp data-rsp='{"lg": {"maxItems": 6}}'></div>`);
    const item = page.body.querySelector('#item');

    resizeTo(1300);
    expect(item['maxItems']).toBe(6);

    resizeTo(400);
    expect(item['maxItems']).toBe('2');
  });

  it('gives an element subscribed with subscribe() the params of the current breakpoint at once', async () => {
    const page = await render(`<ds-rsp></ds-rsp>`);
    const item = page.doc.createElement('div');
    item.setAttribute('width', '1');
    item.setAttribute('data-rsp', '{"sm": {"width": 3}}');
    page.body.appendChild(item);

    await page.root.subscribe(item);

    expect(item['width']).toBe(3);
    expect(item.getAttribute('data-rsp-init')).toBe('true');

    resizeTo(400);
    expect(item['width']).toBe('1');
  });

  it('subscribes the matching elements inserted in the document later, at once', async () => {
    const observers: { callback: MutationCallback; observe: Mock; disconnect: Mock }[] = [];
    class FakeMutationObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: MutationCallback) {
        observers.push(this);
      }
    }
    const page = await renderPage('');
    stubTheme();
    vi.stubGlobal('MutationObserver', FakeMutationObserver);
    media = fakeMatchMedia(1000);
    await page.setContent(`<ds-rsp subscriber-selector=".rsp"></ds-rsp>`);
    const [observer] = observers;
    expect(observer.observe).toHaveBeenCalledWith(page.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-use-rsp'] });
    const notify = (record: Partial<MutationRecord>) => observer.callback([record as MutationRecord], observer as unknown as MutationObserver);

    const wrapper = page.doc.createElement('section');
    wrapper.innerHTML = `<div class="rsp" id="item" width="1" data-rsp='{"md": {"width": 4}}'></div><p>Not a subscriber</p>`;
    page.body.appendChild(wrapper);
    notify({ type: 'childList', addedNodes: [wrapper] as unknown as NodeList });
    const item = page.body.querySelector('#item');
    expect(item['width']).toBe(4);

    // Inserted again (moved), it is not initialised twice: its initial value stays.
    notify({ type: 'childList', addedNodes: [item] as unknown as NodeList });
    expect(JSON.parse(item.getAttribute('data-rsp'))).toEqual({ xxs: { width: '1' }, md: { width: 4 } });
    resizeTo(400);
    expect(item['width']).toBe('1');

    // An element that gets the attribute later (a component reflecting data-use-rsp), at once too.
    resizeTo(1000);
    const late = page.doc.createElement('div');
    late.setAttribute('data-rsp', '{"md": {"width": 2}}');
    page.body.appendChild(late);
    late.className = 'rsp';
    notify({ type: 'attributes', target: late, addedNodes: [] as unknown as NodeList });
    expect(late['width']).toBe(2);

    page.root.remove();
    await page.waitForChanges();
    expect(observer.disconnect).toHaveBeenCalled();
  });
  describe('refresh()', () => {
    /** The breakpointChange events emitted by ds-rsp: [current label, current limits, previous label]. */
    const recordEvents = (page: { doc: Document }) => {
      const events: [string, number[], string][] = [];
      page.doc.addEventListener('breakpointChange', (event: CustomEvent) => {
        if ((event.target as Element).tagName === 'DS-RSP') {
          events.push([event.detail.current.label, event.detail.current.limits, event.detail.previous?.label]);
        }
      });
      return events;
    };

    it('starts when the theme stylesheet loads after it: refresh() then initialises everything', async () => {
      themeTokens = NO_THEME;
      const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);
      const item = page.body.querySelector('#item');
      const late = page.doc.createElement('div');
      late.setAttribute('data-rsp', '{"lg": {"width": 5}}');
      page.body.appendChild(late);
      await page.root.subscribe(late);
      const events = recordEvents(page);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(item.hasAttribute('data-rsp-init')).toBe(false);
      expect(media.watched()).toEqual([]);

      themeTokens = THEME_TOKENS;
      await page.root.refresh();

      expect(events).toEqual([['md', [992, 1199], undefined]]);
      expect(media.watched()).toEqual(THEME_QUERIES);
      expect(item['width']).toBe(3);
      expect(item.getAttribute('data-rsp-init')).toBe('true');
      expect(late.getAttribute('data-rsp-init')).toBe('true');
      expect(await page.root.getData()).toEqual({ breakpoints: await page.root.getBreakpoints() });

      resizeTo(1300);
      expect(late['width']).toBe(5);
      resizeTo(400);
      expect(item['width']).toBe('1');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('is called by ds-rsp when a stylesheet <link> loads, not on other loads', async () => {
      themeTokens = NO_THEME;
      const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);
      const item = page.body.querySelector('#item');
      // The load event does not bubble: ds-rsp listens to it on the document, in the capture phase, which the mock DOM does
      // not have. Here it bubbles up to the document instead.
      const load = (element: Element) => element.dispatchEvent(new Event('load', { bubbles: true }));
      themeTokens = THEME_TOKENS;

      const image = page.doc.createElement('img');
      page.body.appendChild(image);
      load(image);
      const icon = page.doc.createElement('link');
      icon.setAttribute('rel', 'icon');
      page.doc.head.appendChild(icon);
      load(icon);
      expect(item.hasAttribute('data-rsp-init')).toBe(false);

      const stylesheet = page.doc.createElement('link');
      stylesheet.setAttribute('rel', 'stylesheet');
      page.doc.head.appendChild(stylesheet);
      load(stylesheet);

      expect(item['width']).toBe(3);
      expect(item.getAttribute('data-rsp-init')).toBe('true');

      // Removed from the document, it no longer listens.
      page.root.remove();
      await page.waitForChanges();
      const refresh = vi.spyOn(componentClass<DSRsp>('ds-rsp').prototype, 'update');
      load(stylesheet);
      expect(refresh).not.toHaveBeenCalled();
    });

    it('sets the params again without any event when nothing changed', async () => {
      const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);
      const item = page.body.querySelector('#item');
      const onItemChange = vi.fn();
      item.addEventListener('breakpointChange', onItemChange);
      const events = recordEvents(page);
      item['width'] = 99;

      await page.root.refresh();

      expect(item['width']).toBe(3);
      expect(events).toEqual([]);
      expect(onItemChange).not.toHaveBeenCalled();
    });

    it('applies new theme breakpoints, and emits breakpointChange only when the label or the limits of the current one changed', async () => {
      const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"sm": {"width": 3}, "md": {"width": 4}}'></div>`);
      const item = page.body.querySelector('#item');
      const events = recordEvents(page);

      // The same breakpoints: the same media queries.
      await page.root.refresh();
      expect(media.watched()).toEqual(THEME_QUERIES);

      // At 1000 px: md [992, 1199]. Only xxl changes: md stays the same; the media queries follow the new boundaries.
      themeTokens = { ...THEME_TOKENS, '--ds-bp-xxl': '1700px' };
      await page.root.refresh();
      expect(events).toEqual([]);
      expect((await page.root.getData()).breakpoints.xxl).toEqual([1700]);
      expect(media.watched()).toEqual([...THEME_QUERIES.slice(0, 5), '(min-width: 1700px)']);
      resizeTo(1650);
      expect(events.map(([label]) => label)).toEqual(['xl']);
      resizeTo(1700);
      expect(events.map(([label]) => label)).toEqual(['xl', 'xxl']);
      resizeTo(1000);
      events.length = 0;

      // md starts at 900 px: same label, other limits.
      themeTokens = { ...THEME_TOKENS, '--ds-bp-md': '900px' };
      await page.root.refresh();
      expect(events).toEqual([['md', [900, 1199], 'md']]);

      // md starts at 1024 px: 1000 px is sm.
      themeTokens = { ...THEME_TOKENS, '--ds-bp-md': '1024px' };
      await page.root.refresh();
      expect(events.slice(1)).toEqual([['sm', [768, 1023], 'md']]);
      expect(item['width']).toBe(3);
    });

    it('keeps its breakpoints when it finds none (theme stylesheet removed), warns once, and goes on when the theme is back', async () => {
      const page = await render(`<ds-rsp></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"lg": {"width": 5}}'></div>`);
      const item = page.body.querySelector('#item');
      const events = recordEvents(page);

      themeTokens = NO_THEME;
      await page.root.refresh();
      await page.root.refresh();

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[ds-rsp] refresh'));
      expect((await page.root.getData()).breakpoints.md).toEqual([992, 1199]);
      resizeTo(1300);
      expect(item['width']).toBe(5);

      themeTokens = THEME_TOKENS;
      await page.root.refresh();
      expect(events).toEqual([['lg', [1200, 1399], 'md']]);

      // Found again: a next removal warns again.
      themeTokens = NO_THEME;
      await page.root.refresh();
      expect(warnSpy).toHaveBeenCalledTimes(2);
    });

    it('uses the breakpoints property rather than the theme, and applies a new value', async () => {
      const page = await render(`<ds-rsp breakpoints='{"small": 0, "large": 900}'></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"large": {"width": 5}}'></div>`);
      const item = page.body.querySelector('#item');
      const events = recordEvents(page);

      await page.root.refresh();
      expect(events).toEqual([]);
      expect(item['width']).toBe(5);

      page.root.setAttribute('breakpoints', '{"small": 0, "large": 1200}');
      await page.waitForChanges();

      expect(events).toEqual([['small', [0, 1199], 'large']]);
      expect(item['width']).toBe('1');
      expect(media.watched()).toEqual(['(min-width: 1200px)']);
      resizeTo(1200);
      expect(item['width']).toBe(5);
    });

    it('ignores an invalid breakpoints property with a warning', async () => {
      themeTokens = NO_THEME;
      await render(`<ds-rsp breakpoints="{small: 0}"></ds-rsp>`);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('the breakpoints property is not valid JSON'));
      expect(media.watched()).toEqual([]);
    });

    it('does nothing once removed from the document', async () => {
      themeTokens = NO_THEME;
      const page = await render(`<ds-rsp></ds-rsp><div id="item" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);
      const rsp = page.root;
      rsp.remove();
      await page.waitForChanges();

      themeTokens = THEME_TOKENS;
      await rsp.refresh();

      expect(page.body.querySelector('#item').hasAttribute('data-rsp-init')).toBe(false);
      expect(media.watched()).toEqual([]);
    });
  });

  describe('debounce-delay (deprecated)', () => {
    it('is ignored, with one warning: the change is applied at once', async () => {
      const page = await render(`<ds-rsp debounce-delay="500"></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"lg": {"width": 5}}'></div>`);
      const item = page.body.querySelector('#item');

      resizeTo(1300);
      expect(item['width']).toBe(5);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('debounce-delay is deprecated'));

      page.root.debounceDelay = 100;
      await page.waitForChanges();
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('warns when it is set after the load, and not without it', async () => {
      const page = await render(`<ds-rsp></ds-rsp>`);
      expect(warnSpy).not.toHaveBeenCalled();

      page.root.debounceDelay = 100;
      await page.waitForChanges();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('debounce-delay is deprecated'));
    });
  });
});
