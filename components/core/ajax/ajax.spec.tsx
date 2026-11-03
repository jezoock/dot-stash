import { newSpecPage, SpecPage } from '@stencil/core/testing';
import { DSAjax } from './ajax';

/**
 * The simulated DOM of the spec tests has no focus: `focus()` only dispatches a `focus` event. This gives the document an
 * `activeElement`, which `focus()` sets, and that a removed element loses.
 */
const trackFocus = (page: SpecPage) => {
  const focus: { active: HTMLElement | null } = { active: null };
  let owner = Object.getPrototypeOf(page.body);
  while (owner && !Object.prototype.hasOwnProperty.call(owner, 'focus')) owner = Object.getPrototypeOf(owner);

  jest.spyOn(owner, 'focus').mockImplementation(function (this: HTMLElement) {
    focus.active = this;
  });
  Object.defineProperty(page.doc, 'activeElement', { configurable: true, get: () => (focus.active?.isConnected ? focus.active : page.body) });

  return () => page.doc.activeElement as HTMLElement;
};

const PAGE = '<html><body><header>Site</header><div class="ds-ajax-content"><p>Loaded <a href="/next">next</a></p></div></body></html>';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('ds-ajax', () => {
  let fetchMock: jest.Mock;
  let errorSpy: jest.SpyInstance;

  /** A text/html response: json() rejects, as for a real HTML body. */
  const htmlResponse = (html: string) => ({
    ok: true,
    text: () => Promise.resolve(html),
    json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON')),
  });

  /** newSpecPage resets the window: fetch is mocked once the page exists, then the content is rendered. */
  const render = async (html: string, response = htmlResponse(PAGE)) => {
    const page = await newSpecPage({ components: [DSAjax], html: '' });

    fetchMock = jest.fn(() => Promise.resolve(response));
    global.fetch = fetchMock;
    window.fetch = fetchMock;
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await page.setContent(html);
    await flush();
    await page.waitForChanges();
    return page;
  };

  const click = async (page, element: Element) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    await flush();
    await page.waitForChanges();
    return event;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ['/page', '', '/page'],
    ['/page', 'ajax=1', '/page?ajax=1'],
    ['/page?lang=fr', 'ajax=1', '/page?lang=fr&ajax=1'],
    ['/page?lang=fr', '', '/page?lang=fr'],
  ])('requests %p with the suffix %p as %p', async (href, suffix, url) => {
    await render(`<ds-ajax on="load" suffix="${suffix}"><a href="${href}">Load</a></ds-ajax>`);

    expect(fetchMock).toHaveBeenCalledWith(url);
  });

  it('loads the .ds-ajax-content of the HTML response into itself', async () => {
    const page = await render('<ds-ajax on="load"><a href="/page">Load</a></ds-ajax>');

    expect(page.root.innerHTML).toBe('<p>Loaded <a href="/next">next</a></p>');
    expect(page.root).not.toHaveClass('--is-loading');
  });

  it('loads on click by default, then lets the loaded links work', async () => {
    const page = await render('<ds-ajax><a href="/page">Load</a></ds-ajax>');

    expect(fetchMock).not.toHaveBeenCalled();

    const loadClick = await click(page, page.root.querySelector('a'));
    expect(loadClick.defaultPrevented).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/page');
    expect(page.root.textContent).toBe('Loaded next');

    const nextClick = await click(page, page.root.querySelector('a'));
    expect(nextClick.defaultPrevented).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('loads into the element matching the target selector', async () => {
    const page = await render('<div id="out"></div><ds-ajax target="#out"><a href="/page">Load</a></ds-ajax>');

    await click(page, page.root.querySelector('a'));

    expect(page.body.querySelector('#out').innerHTML).toBe('<p>Loaded <a href="/next">next</a></p>');
    expect(page.root.querySelector('a').getAttribute('href')).toBe('/page');
  });

  it('keeps its content, with an error, when the request fails', async () => {
    const page = await render('<ds-ajax on="load"><a href="/missing">Load</a></ds-ajax>', { ok: false, text: () => Promise.resolve('Not found'), json: () => Promise.reject() });

    expect(page.root.querySelector('a').textContent).toBe('Load');
    expect(page.root).not.toHaveClass('--is-loading');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('/missing'), 'Not found');
  });

  it('renders the loading state of a load on load at once, without a Stencil warning', async () => {
    const page = await newSpecPage({ components: [DSAjax], html: '' });
    let respond: (value: unknown) => void;
    fetchMock = jest.fn(() => new Promise(resolve => (respond = resolve)));
    global.fetch = fetchMock;
    window.fetch = fetchMock;
    const warnSpy = jest.spyOn(console, 'warn');

    await page.setContent('<ds-ajax on="load"><a href="/page">Load</a></ds-ajax>');

    expect(page.root).toHaveClass('--is-loading');
    expect(page.root).toEqualAttribute('aria-busy', 'true');
    expect(warnSpy.mock.calls.filter(args => String(args[0]).includes('changed during'))).toEqual([]);

    respond(htmlResponse(PAGE));
    await flush();
    await page.waitForChanges();
    expect(page.root).not.toHaveClass('--is-loading');
    expect(page.root).not.toHaveAttribute('aria-busy');
  });

  it('the target is aria-busy while it loads, then a polite live region after a click; a click while it loads does nothing', async () => {
    const page = await newSpecPage({ components: [DSAjax], html: '' });
    let respond: (value: unknown) => void;
    fetchMock = jest.fn(() => new Promise(resolve => (respond = resolve)));
    global.fetch = fetchMock;
    window.fetch = fetchMock;
    await page.setContent('<div id="out"></div><div id="own" aria-live="assertive"></div><ds-ajax target="#out"><a href="/page">Load</a></ds-ajax>');
    const out = page.body.querySelector('#out');

    await click(page, page.root.querySelector('a'));
    expect(out).toEqualAttributes({ 'aria-busy': 'true', 'aria-live': 'polite' });
    await click(page, page.root.querySelector('a'));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    respond(htmlResponse(PAGE));
    await flush();
    await page.waitForChanges();
    expect(out).not.toHaveAttribute('aria-busy');
    expect(out).toEqualAttribute('aria-live', 'polite');
    expect(out.textContent).toBe('Loaded next');
  });

  it('keeps the aria-live of the target, and makes no live region of a load on load', async () => {
    const page = await render(
      '<div id="own" aria-live="assertive"></div><div id="out"></div><ds-ajax target="#own"><a href="/page">Load</a></ds-ajax><ds-ajax on="load" target="#out"><a href="/page">Load</a></ds-ajax>',
    );

    await click(page, page.body.querySelector('ds-ajax a'));

    expect(page.body.querySelector('#own')).toEqualAttribute('aria-live', 'assertive');
    expect(page.body.querySelector('#out')).not.toHaveAttribute('aria-live');
  });

  it('gives the focus of the replaced link to the loaded content, and emits ajaxLoaded', async () => {
    const page = await render('<ds-ajax><a href="/page">Load</a></ds-ajax>');
    const getFocused = trackFocus(page);
    const loaded = jest.fn();
    page.root.addEventListener('ajaxLoaded', (event: CustomEvent) => loaded(event.detail));

    page.root.querySelector('a').focus();
    await click(page, page.root.querySelector('a'));

    expect(getFocused()).toBe(page.root);
    expect(page.root).toEqualAttribute('tabindex', '-1');
    expect(loaded).toHaveBeenCalledWith({ target: page.root, url: '/page' });
  });

  it('does not move the focus that is elsewhere', async () => {
    const page = await render('<button>Elsewhere</button><ds-ajax><a href="/page">Load</a></ds-ajax>');
    const getFocused = trackFocus(page);

    page.body.querySelector('button').focus();
    await click(page, page.body.querySelector('ds-ajax a'));

    expect(getFocused()).toBe(page.body.querySelector('button'));
    expect(page.body.querySelector('ds-ajax')).not.toHaveAttribute('tabindex');
  });

  it('shows the error message in an alert after the link, emits ajaxError, and removes the message on the next load', async () => {
    const page = await render('<ds-ajax error-message="Not loaded."><a href="/missing">Load</a></ds-ajax>', {
      ok: false,
      text: () => Promise.resolve('Not found'),
      json: () => Promise.reject(),
    });
    const errors = jest.fn();
    page.root.addEventListener('ajaxError', (event: CustomEvent) => errors(event.detail.url));

    await click(page, page.root.querySelector('a'));
    const alert = page.root.querySelector('.ds-ajax__error');
    expect(alert).toEqualAttribute('role', 'alert');
    expect(alert).toHaveClasses(['ds-message', '--error']);
    expect(alert.textContent).toBe('Not loaded.');
    expect(alert.previousElementSibling.tagName).toBe('A');
    expect(errors).toHaveBeenCalledWith('/missing');

    await click(page, page.root.querySelector('a'));
    expect(page.root.querySelectorAll('.ds-ajax__error')).toHaveLength(1);
  });

  it('shows the default error message, or none with an empty error-message', async () => {
    const failing = { ok: false, text: () => Promise.resolve('Not found'), json: () => Promise.reject() };
    const page = await render('<ds-ajax on="load"><a href="/missing">Load</a></ds-ajax>', failing);
    expect(page.root.querySelector('[role="alert"]').textContent).toBe('The content could not be loaded.');

    const silent = await render('<ds-ajax on="load" error-message=""><a href="/missing">Load</a></ds-ajax>', failing);
    expect(silent.root.querySelector('[role="alert"]')).toBeNull();
  });

  it('keeps its content, with an error, when the response has no .ds-ajax-content', async () => {
    const page = await render('<ds-ajax on="load"><a href="/page">Load</a></ds-ajax>', htmlResponse('<p>No wrapper</p>'));

    expect(page.root.querySelector('a').textContent).toBe('Load');
    expect(page.root).not.toHaveClass('--is-loading');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('.ds-ajax-content'));
  });
});
