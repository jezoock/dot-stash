import { newSpecPage } from '@stencil/core/testing';
import { DSRsp } from './responsive';

/** What Chromium returns for the `content` of `body::before` with the compiled theme. */
const THEME_CONTENT = String.raw`"{ \"breakpoints\": {\"xxs\": 360,\"xs\": 576,\"sm\": 768,\"md\": 992,\"lg\": 1200,\"xl\": 1400,\"xxl\": 1600}, \"palettes\": {\"primary\": { \"base\": \"#e4be90\"} } }"`;

const wait = (ms = 20) => new Promise(resolve => setTimeout(resolve, ms));

const setWidth = (width: number) => {
  (window as { innerWidth: number }).innerWidth = width;
};

const resizeTo = async (width: number) => {
  setWidth(width);
  window.dispatchEvent(new Event('resize'));
  await wait();
};

describe('ds-rsp', () => {
  let themeContent: string;
  let warnSpy: jest.SpyInstance;
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  /** newSpecPage resets the window: the spies are installed once the page exists, then the content is rendered. */
  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSRsp], html: '' });

    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ content: themeContent }) as CSSStyleDeclaration);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    setWidth(1000);

    await page.setContent(html);
    return page;
  };

  beforeEach(() => {
    themeContent = THEME_CONTENT;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const resizeListeners = (spy: jest.SpyInstance) => spy.mock.calls.filter(([type]) => type === 'resize').map(([, listener]) => listener);

  it('sets the data-rsp params of the current breakpoint, or of the nearest smaller one', async () => {
    const page = await render(`<ds-rsp debounce-delay="0"></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"sm": {"width": 3}, "lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');

    expect(item['width']).toBe(3);

    await resizeTo(1300);
    expect(item['width']).toBe(5);

    await resizeTo(400);
    expect(item['width']).toBe('1');
  });

  it('marks the initialised subscribers with a data-rsp-init attribute', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="item" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);

    expect(page.body.querySelector('#item').getAttribute('data-rsp-init')).toBe('true');
    expect(page.body.querySelectorAll(page.root.subscriberSelector)).toHaveLength(0);
  });

  it('removes the resize listener it added', async () => {
    const page = await render(`<ds-rsp debounce-delay="0"></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');
    const [resizeListener] = resizeListeners(addEventListenerSpy);

    expect(resizeListener).toBeDefined();

    page.root.remove();
    await page.waitForChanges();

    expect(resizeListeners(removeEventListenerSpy)).toContain(resizeListener);

    // At 1000 px (md), the item has the initial value, stored for the smallest breakpoint.
    expect(item['width']).toBe('1');
    await resizeTo(1300);
    expect(item['width']).toBe('1');
  });

  it('listens again when it is put back in the document', async () => {
    const page = await render(`<ds-rsp debounce-delay="0"></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"lg": {"width": 5}}'></div>`);
    const item = page.body.querySelector('#item');
    const rsp = page.root;

    rsp.remove();
    await page.waitForChanges();
    page.body.appendChild(rsp);
    await page.waitForChanges();
    await resizeTo(1300);

    expect(item['width']).toBe(5);
    expect(resizeListeners(addEventListenerSpy)).toHaveLength(2);
  });

  it('tells whether the window grows, up to the last breakpoint', async () => {
    const page = await render(`<ds-rsp debounce-delay="0"></ds-rsp><div id="item" data-use-rsp></div>`);
    const details = [];
    page.body.querySelector('#item').addEventListener('breakpointChange', (event: CustomEvent) => details.push(event.detail));

    await resizeTo(1700);
    await resizeTo(1000);

    expect(details.map(({ current, isGrowing }) => [current.label, isGrowing])).toEqual([
      ['xxl', true],
      ['md', false],
    ]);
  });

  it('does not crash without the theme stylesheet: it warns and dispatches no breakpoint event', async () => {
    themeContent = 'none';
    const page = await render(`<div id="item" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);
    const item = page.body.querySelector('#item');
    const onBreakpointChange = jest.fn();
    item.addEventListener('breakpointChange', onBreakpointChange);

    page.body.appendChild(page.doc.createElement('ds-rsp'));
    await page.waitForChanges();
    await resizeTo(500);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[ds-rsp]'));
    expect(onBreakpointChange).not.toHaveBeenCalled();
    expect(item.hasAttribute('data-rsp-init')).toBe(false);
    expect(resizeListeners(addEventListenerSpy)).toHaveLength(0);
  });

  it('uses the breakpoints property (label: minimum width) instead of the theme ones', async () => {
    themeContent = 'none';
    const page = await render(
      `<ds-rsp debounce-delay="0" breakpoints='{"small": 0, "large": 900}'></ds-rsp><div id="item" width="1" data-use-rsp data-rsp='{"large": {"width": 5}}'></div>`,
    );
    const item = page.body.querySelector('#item');

    expect(await page.root.getData()).toEqual({ breakpoints: { small: [0, 899], large: [900] } });
    expect(item['width']).toBe(5);

    // Back to the smallest breakpoint: the initial value is restored.
    await resizeTo(500);
    expect(item['width']).toBe('1');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('reads the params from the attribute named by property-name', async () => {
    const page = await render(`<ds-rsp debounce-delay="0" property-name="data-bp"></ds-rsp><div id="item" width="1" data-use-rsp data-bp='{"sm": {"width": 3}}'></div>`);
    const item = page.body.querySelector('#item');

    expect(item['width']).toBe(3);
    expect(page.body.querySelector('#item').hasAttribute('data-rsp')).toBe(false);

    await resizeTo(400);
    expect(item['width']).toBe('1');
  });

  it('ignores invalid data-rsp JSON with a warning', async () => {
    const page = await render(`<ds-rsp></ds-rsp><div id="bad" data-use-rsp data-rsp="[object Object]"></div><div id="good" data-use-rsp data-rsp='{"sm": {"width": 3}}'></div>`);

    expect(page.body.querySelector('#good')['width']).toBe(3);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[ds-rsp]'), page.body.querySelector('#bad'));
  });
});
