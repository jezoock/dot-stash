import { describe, expect, it, vi } from 'vitest';
import './scroller';
import '../trigger/trigger';
import { mockComputedStyle, renderPage } from '../../../test/helpers';

type Scroller = HTMLElement & { label: string; orientation: string; snap: boolean; controls: boolean; next(): Promise<void>; previous(): Promise<void>; refresh(): Promise<void> };

/** The sizes of the viewport (the simulated DOM has no layout): its scrollable size and its visible size. */
const setSizes = (viewport: HTMLElement, sizes: Partial<Record<'scrollWidth' | 'clientWidth' | 'scrollLeft' | 'scrollHeight' | 'clientHeight' | 'scrollTop', number>>) => {
  for (const [name, value] of Object.entries(sizes)) Object.defineProperty(viewport, name, { configurable: true, writable: true, value });
};

describe('ds-scroller', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    const scroller = page.body.querySelector('ds-scroller') as Scroller;
    const viewport = scroller.querySelector<HTMLElement>('.ds-scroller__viewport');
    return { page, scroller, viewport };
  };

  it('lays its children out in a viewport, horizontal, never inert nor hidden', async () => {
    const { scroller, viewport } = await render('<ds-scroller><a href="#a">A</a><a href="#b">B</a></ds-scroller>');

    expect(scroller).toHaveClasses(['ds-scroller', '--horizontal', '--at-start', '--at-end']);
    expect(Array.from(viewport.children).map(child => child.textContent)).toEqual(['A', 'B']);
    expect(scroller.querySelectorAll('[inert], [aria-hidden], [hidden], [tabindex]').length).toBe(0);
    expect(scroller.hasAttribute('role')).toBe(false);
  });

  it('label: a region of the page, with that name', async () => {
    const { page, scroller } = await render('<ds-scroller label="Continue watching"><a href="#a">A</a></ds-scroller>');

    expect(scroller).toEqualAttributes({ 'role': 'region', 'aria-label': 'Continue watching' });

    scroller.label = ' ';
    await page.waitForChanges();
    expect(scroller.hasAttribute('role')).toBe(false);
    expect(scroller.hasAttribute('aria-label')).toBe(false);
  });

  it('vertical, snap: their classes; an unknown orientation is horizontal', async () => {
    const { page, scroller } = await render('<ds-scroller orientation="vertical" snap></ds-scroller>');

    expect(scroller).toHaveClasses(['ds-scroller', '--vertical', '--snap']);

    scroller.orientation = 'diagonal';
    await page.waitForChanges();
    expect(scroller).toHaveClass('--horizontal');
  });

  it('controls: no buttons while the content fits; a next button at the start, both in the middle, a previous one at the end', async () => {
    const { page, scroller, viewport } = await render('<ds-scroller controls><a href="#a">A</a></ds-scroller>');
    const buttons = () => Array.from(scroller.querySelectorAll('ds-trigger')).map(button => [button.className.match(/ds-scroller__(\w+)/)[1], button.getAttribute('aria-label')]);

    expect(buttons()).toEqual([]);

    setSizes(viewport, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 0 });
    await scroller.refresh();
    await page.waitForChanges();
    expect(scroller).toHaveClasses(['--overflowing', '--controls', '--at-start']);
    expect(buttons()).toEqual([['next', 'Next items']]);

    setSizes(viewport, { scrollLeft: 300 });
    viewport.dispatchEvent(new Event('scroll'));
    await page.waitForChanges();
    expect(buttons()).toEqual([
      ['prev', 'Previous items'],
      ['next', 'Next items'],
    ]);
    expect(Array.from(scroller.children).map(child => child.className.split(' ')[0])).toEqual(['ds-scroller__prev', 'ds-scroller__viewport', 'ds-scroller__next']);

    // From right to left, the position is negative.
    setSizes(viewport, { scrollLeft: -600 });
    viewport.dispatchEvent(new Event('scroll'));
    await page.waitForChanges();
    expect(scroller).toHaveClass('--at-end');
    expect(buttons()).toEqual([['prev', 'Previous items']]);
  });

  it('labels translates the names of the buttons; an invalid JSON: an error, and the defaults', async () => {
    const { page, scroller, viewport } = await render(`<ds-scroller controls labels='{"next": "Suivants"}'></ds-scroller>`);

    setSizes(viewport, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 0 });
    await scroller.refresh();
    await page.waitForChanges();
    expect(scroller.querySelector('.ds-scroller__next').getAttribute('aria-label')).toBe('Suivants');

    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    scroller.setAttribute('labels', '{"next":');
    await page.waitForChanges();
    expect(error).toHaveBeenCalledWith('[ds-scroller] labels is not valid JSON');
    expect(scroller.querySelector('.ds-scroller__next').getAttribute('aria-label')).toBe('Next items');
  });

  it('next() and previous() scroll by a page: the width of the viewport less its margins, toward the end (to the left from right to left)', async () => {
    const { scroller, viewport } = await render('<ds-scroller></ds-scroller>');
    const scrollBy = vi.fn();
    Object.assign(viewport, { scrollBy });
    setSizes(viewport, { clientWidth: 400, clientHeight: 100 });
    const style = mockComputedStyle({ scrollPaddingLeft: '24px', scrollPaddingRight: '24px', scrollPaddingTop: '10px', scrollPaddingBottom: '0px', direction: 'ltr' });

    await scroller.next();
    await scroller.previous();
    expect(scrollBy.mock.calls.map(([options]) => options.left)).toEqual([352, -352]);

    style.mockReturnValue({ scrollPaddingLeft: '24px', scrollPaddingRight: '24px', direction: 'rtl' } as CSSStyleDeclaration);
    await scroller.next();
    expect(scrollBy.mock.lastCall[0].left).toBe(-352);

    scroller.orientation = 'vertical';
    style.mockReturnValue({ scrollPaddingTop: '10px', scrollPaddingBottom: '0px', direction: 'ltr' } as CSSStyleDeclaration);
    await scroller.next();
    expect(scrollBy.mock.lastCall[0].top).toBe(90);
  });

  it('mods: a class per modifier', async () => {
    const { scroller } = await render('<ds-scroller mods="tiles, wide"></ds-scroller>');

    expect(scroller).toHaveClasses(['ds-scroller', '--tiles', '--wide']);
  });
});
