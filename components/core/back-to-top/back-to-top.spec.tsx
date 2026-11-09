import { afterEach, describe, expect, it, vi } from 'vitest';
import './back-to-top';
import { renderPage, trackFocus } from '../../../test/helpers';

type BackToTop = HTMLElement & { threshold: number | string; target: string; label: string; scrollToTop(): Promise<void> };

describe('ds-back-to-top', () => {
  afterEach(() => {
    Object.assign(window, { scrollY: 0, innerHeight: 768 });
  });

  const render = async (html: string) => {
    const page = await renderPage(html);
    const element = page.body.querySelector('ds-back-to-top') as BackToTop;
    const link = element.querySelector<HTMLAnchorElement>('.ds-back-to-top__link');
    /** Scrolls the window to `y` and dispatches `scroll`, then waits for the frame that reads it. */
    const scrollTo = async (y: number) => {
      Object.assign(window, { scrollY: y });
      window.dispatchEvent(new Event('scroll'));
      await page.waitForChanges();
    };
    return { page, element, link, scrollTo };
  };

  /** A click on the link, as a browser dispatches it (cancelable). Returns the event. */
  const click = (link: HTMLElement, init: MouseEventInit = {}) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
    link.dispatchEvent(event);
    return event;
  };

  describe('rendering', () => {
    it('renders a link to #top named "Back to top", hidden (inert) at the top of the page', async () => {
      const { element, link } = await render('<ds-back-to-top></ds-back-to-top>');

      expect(element).toHaveClasses(['ds-back-to-top', '--hidden']);
      expect([link.tagName, link.getAttribute('href'), link.textContent]).toEqual(['A', '#top', 'Back to top']);
      expect(link.querySelector('.ds-back-to-top__label').textContent).toBe('Back to top');
      expect(link.hasAttribute('inert')).toBe(true);
    });

    it('label names it; an id target is its href', async () => {
      const { link } = await render('<ds-back-to-top label="Retour en haut" target="#page-title" mods="dark"></ds-back-to-top>');

      expect([link.textContent, link.getAttribute('href')]).toEqual(['Retour en haut', '#page-title']);
      expect(link.closest('ds-back-to-top')).toHaveClass('--dark');
    });

    it('another selector as target: the href stays #top', async () => {
      const { link } = await render('<ds-back-to-top target="main h1"></ds-back-to-top>');

      expect(link.getAttribute('href')).toBe('#top');
    });
  });

  describe('threshold', () => {
    it('shows once the page is scrolled past one viewport height by default, and hides again above it', async () => {
      Object.assign(window, { innerHeight: 800 });
      const { element, link, scrollTo } = await render('<ds-back-to-top></ds-back-to-top>');

      await scrollTo(800);
      expect(element).toHaveClass('--hidden');

      await scrollTo(801);
      expect(element).toHaveClasses(['ds-back-to-top', '--shown']);
      expect(link.hasAttribute('inert')).toBe(false);

      await scrollTo(10);
      expect(element).toHaveClass('--hidden');
      expect(link.hasAttribute('inert')).toBe(true);
    });

    it.each([
      ['400', 400],
      ['400px', 400],
      [' 250 PX ', 250],
      ['50vh', 500],
      ['1.5vh', 15],
      ['0', 0],
      ['nope', 1000],
      ['-100', 1000],
      ['', 1000],
    ])('threshold="%s": %s px', async (threshold, px) => {
      Object.assign(window, { innerHeight: 1000 });
      const { element, scrollTo } = await render(`<ds-back-to-top threshold="${threshold}"></ds-back-to-top>`);

      await scrollTo(px);
      expect(element).toHaveClass('--hidden');
      await scrollTo(px + 1);
      expect(element).toHaveClass('--shown');
    });

    it('a number as a property; a new threshold applies at once', async () => {
      const { page, element, scrollTo } = await render('<ds-back-to-top threshold="600"></ds-back-to-top>');
      await scrollTo(300);
      expect(element).toHaveClass('--hidden');

      element.threshold = 200;
      await page.waitForChanges();
      expect(element).toHaveClass('--shown');
    });

    it('shown when the page is already scrolled when it loads', async () => {
      Object.assign(window, { scrollY: 2000, innerHeight: 800 });
      const { element } = await render('<ds-back-to-top></ds-back-to-top>');

      expect(element).toHaveClass('--shown');
    });

    it('reads the scroll once per animation frame, with passive listeners, and removes them (and the frame) when it leaves', async () => {
      const add = vi.spyOn(window, 'addEventListener');
      const remove = vi.spyOn(window, 'removeEventListener');
      const raf = vi.spyOn(window, 'requestAnimationFrame');
      const cancel = vi.spyOn(window, 'cancelAnimationFrame');
      const { page, element } = await render('<ds-back-to-top></ds-back-to-top>');
      const listeners = add.mock.calls.filter(([type]) => type === 'scroll' || type === 'resize');

      expect(listeners.map(([type, , options]) => [type, options])).toEqual([
        ['scroll', { passive: true }],
        ['resize', { passive: true }],
      ]);

      raf.mockClear();
      for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
      expect(raf.mock.calls.filter(([callback]) => callback.toString().includes('update'))).toHaveLength(1);

      element.remove();
      await page.waitForChanges();
      for (const [type, listener] of listeners) expect(remove).toHaveBeenCalledWith(type, listener);
      expect(cancel).toHaveBeenCalled();

      // Gone: a scroll does nothing.
      raf.mockClear();
      window.dispatchEvent(new Event('scroll'));
      expect(raf.mock.calls.filter(([callback]) => callback.toString().includes('update'))).toHaveLength(0);
    });

    it('stays shown while its link has the focus', async () => {
      const { element, link, scrollTo } = await render('<ds-back-to-top threshold="100"></ds-back-to-top>');
      await scrollTo(500);

      link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await scrollTo(0);
      expect(element).toHaveClass('--shown');

      link.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      await scrollTo(0);
      expect(element).toHaveClass('--hidden');
    });
  });

  describe('activation', () => {
    const stubMotion = (reduce: boolean) =>
      vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({ media: query, matches: reduce && query === '(prefers-reduced-motion: reduce)' })),
      );

    it('a click scrolls smoothly to the top instead of following the link, moves the focus and emits backToTop', async () => {
      stubMotion(false);
      const focused = trackFocus();
      const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const { page, element, link } = await render('<main><h1>Title</h1></main><ds-back-to-top></ds-back-to-top>');
      const events: HTMLElement[] = [];
      element.addEventListener('backToTop', (event: CustomEvent<{ target: HTMLElement }>) => events.push(event.detail.target));

      const event = click(link);

      expect(event.defaultPrevented).toBe(true);
      expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
      expect(focused()).toBe(page.body.querySelector('main'));
      expect(events).toEqual([page.body.querySelector('main')]);
    });

    it('with less motion, it scrolls at once', async () => {
      stubMotion(true);
      trackFocus();
      const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const { element } = await render('<ds-back-to-top></ds-back-to-top>');

      await element.scrollToTop();

      expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    });

    it.each([['ctrlKey'], ['metaKey'], ['shiftKey'], ['altKey']])('a click with %s is left to the browser (a new tab, a new window)', async key => {
      const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const { link } = await render('<ds-back-to-top></ds-back-to-top>');

      const event = click(link, { [key]: true });

      expect([event.defaultPrevented, scroll.mock.calls.length]).toEqual([false, 0]);
    });
  });

  describe('focus target', () => {
    const activate = async (html: string) => {
      vi.stubGlobal('matchMedia', undefined);
      vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const focused = trackFocus();
      const { page, element } = await render(html);
      await element.scrollToTop();
      return { page, focused };
    };

    it.each([
      ['target', '<p id="intro">Intro</p><h2 id="title">Title</h2><main id="main"></main><ds-back-to-top target="#title"></ds-back-to-top>', 'title'],
      ['target, else #top', '<div id="top"></div><main id="main"></main><ds-back-to-top target=".missing"></ds-back-to-top>', 'top'],
      ['#top', '<header><h1 id="h">Shop</h1></header><span id="top"></span><main id="main"></main><ds-back-to-top></ds-back-to-top>', 'top'],
      ['main', '<header><h1 id="h">Shop</h1></header><main id="main"><h2>Products</h2></main><ds-back-to-top></ds-back-to-top>', 'main'],
      ['role="main"', '<h1 id="h">Shop</h1><div role="main" id="main"></div><ds-back-to-top></ds-back-to-top>', 'main'],
      ['the first heading', '<p>Text</p><h2 id="h">Shop</h2><h1>Other</h1><ds-back-to-top></ds-back-to-top>', 'h'],
    ])('%s', async (_, html, id) => {
      const { page, focused } = await activate(html);

      expect(focused()).toBe(page.body.querySelector(`#${id}`));
    });

    it('else the body', async () => {
      const { page, focused } = await activate('<p>Text</p><ds-back-to-top></ds-back-to-top>');

      expect(focused()).toBe(page.body);
    });

    it('an element that cannot take the focus gets tabindex="-1" until it loses it; a focusable one keeps its own', async () => {
      const { page, focused } = await activate('<main id="main"></main><a id="link" href="#">Link</a><ds-back-to-top></ds-back-to-top>');
      const main = page.body.querySelector<HTMLElement>('#main');

      expect([focused(), main.getAttribute('tabindex')]).toEqual([main, '-1']);
      main.dispatchEvent(new FocusEvent('blur'));
      expect(main.hasAttribute('tabindex')).toBe(false);

      const linkPage = await activate('<a id="link" href="#">Link</a><ds-back-to-top target="#link"></ds-back-to-top>');
      expect([linkPage.focused().id, linkPage.page.body.querySelector('#link').hasAttribute('tabindex')]).toEqual(['link', false]);

      const own = await activate('<section id="own" tabindex="-1"></section><ds-back-to-top target="#own"></ds-back-to-top>');
      own.page.body.querySelector('#own').dispatchEvent(new FocusEvent('blur'));
      expect(own.page.body.querySelector('#own').getAttribute('tabindex')).toBe('-1');
    });

    it('logs an error for a target that is not a valid selector, and takes the default one', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const focused = trackFocus();
      const { page, element } = await render('<main id="main"></main><ds-back-to-top target="[["></ds-back-to-top>');
      // The simulated DOM accepts any selector: one that a browser rejects.
      vi.spyOn(document, 'querySelectorAll').mockImplementationOnce(() => {
        throw new Error('not a valid selector');
      });

      await element.scrollToTop();

      expect(focused()).toBe(page.body.querySelector('#main'));
      expect(error).toHaveBeenCalledWith('[ds-back-to-top] target is not a valid selector: [[');
    });
  });
});
