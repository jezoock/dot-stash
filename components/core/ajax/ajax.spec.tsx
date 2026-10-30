import { newSpecPage } from '@stencil/core/testing';
import { DSAjax } from './ajax';

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

  it('keeps its content, with an error, when the response has no .ds-ajax-content', async () => {
    const page = await render('<ds-ajax on="load"><a href="/page">Load</a></ds-ajax>', htmlResponse('<p>No wrapper</p>'));

    expect(page.root.querySelector('a').textContent).toBe('Load');
    expect(page.root).not.toHaveClass('--is-loading');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('.ds-ajax-content'));
  });
});
