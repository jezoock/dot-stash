import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { accessibleNode, focused, mount, nextFrame, setReducedMotion } from '../../../test/helpers/browser';

type Scroller = HTMLElement & { next(): Promise<void>; previous(): Promise<void>; refresh(): Promise<void>; orientation: string };

/** A scroller 400 px wide of `count` tiles of 100 px (a link each), with the attributes given. */
const tiles = (count: number, attributes = '', style = 'width: 400px') =>
  `<ds-scroller ${attributes} style="${style}">${Array.from({ length: count }, (_, index) => `<a href="#t${index}" class="tile" style="display: block; width: 100px; height: 60px">Tile ${index}</a>`).join('')}</ds-scroller>`;

const scrollerOf = () => document.querySelector<Scroller>('ds-scroller');
const viewportOf = () => document.querySelector<HTMLElement>('.ds-scroller__viewport');
const tile = (index: number) => document.querySelectorAll<HTMLElement>('.tile')[index];

/** Whether an element is inside the visible box of the viewport, at `margin` px from its edges at least. */
const isShown = (element: HTMLElement, margin = 0) => {
  const viewport = viewportOf();
  const box = viewport.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return rect.left >= box.left + viewport.clientLeft + margin - 1 && rect.right <= box.left + viewport.clientLeft + viewport.clientWidth - margin + 1;
};

/** Waits for the scroll to stop. */
const scrollEnd = async () => {
  let last = NaN;
  await expect
    .poll(async () => {
      await nextFrame();
      const position = viewportOf().scrollLeft + viewportOf().scrollTop;
      const isStill = position === last;
      last = position;
      return isStill;
    })
    .toBe(true);
};

describe('ds-scroller in a browser', () => {
  it('a row of items that scrolls natively, its overflow and its ends as classes', async () => {
    await mount(tiles(10));
    const scroller = scrollerOf();
    const viewport = viewportOf();

    expect(tile(0).parentElement).toBe(viewport);
    expect(getComputedStyle(viewport).overflowX).toBe('auto');
    // The items side by side, 16 px apart (the gap of the default theme), each at its own size.
    expect(tile(1).getBoundingClientRect().left - tile(0).getBoundingClientRect().right).toBe(16);
    expect(tile(0).getBoundingClientRect().width).toBe(100);
    await expect
      .poll(() =>
        Array.from(scroller.classList)
          .filter(name => name.startsWith('--'))
          .sort(),
      )
      .toEqual(['--at-start', '--horizontal', '--overflowing']);

    viewport.scrollLeft = viewport.scrollWidth;
    await expect.poll(() => scroller.classList.contains('--at-end')).toBe(true);
    expect(scroller.classList.contains('--at-start')).toBe(false);
  });

  it('never makes the items out of view inert nor hidden: Tab reaches every one, and each one stays in the accessibility tree', async () => {
    await mount(`<button id="before">Before</button>${tiles(10, 'label="Continue watching"')}<button id="after">After</button>`);

    expect(await accessibleNode('ds-scroller')).toMatchObject({ role: 'region', name: 'Continue watching' });
    for (let index = 0; index < 10; index++) {
      expect(tile(index).closest('[inert], [aria-hidden="true"], [hidden]')).toBeNull();
      expect(await accessibleNode(`.tile[href="#t${index}"]`)).toMatchObject({ role: 'link', name: `Tile ${index}` });
    }

    document.querySelector<HTMLElement>('#before').focus();
    const reached: string[] = [];
    for (let index = 0; index < 11; index++) {
      await userEvent.tab();
      reached.push(focused().textContent);
    }
    expect(reached).toEqual([...Array.from({ length: 10 }, (_, index) => `Tile ${index}`), 'After']);
  });

  it('keeps the focused item in view, scrolling as little as it can, with the margin of the theme (24 px)', async () => {
    await setReducedMotion(true);
    await mount(tiles(10));
    const viewport = viewportOf();

    // The tiles 0 to 2 are in view, the 3rd is cut: the scroller moves it to the end of the view, at the margin, not to the center.
    tile(3).focus();
    await scrollEnd();
    const box = viewport.getBoundingClientRect();
    expect(Math.round(box.right - tile(3).getBoundingClientRect().right)).toBe(24);
    expect(isShown(tile(3), 24)).toBe(true);

    // An item in view: no scroll.
    const position = viewport.scrollLeft;
    tile(2).focus();
    await scrollEnd();
    expect(viewport.scrollLeft).toBe(position);

    // Back to the first item: at the start.
    tile(0).focus();
    await scrollEnd();
    expect(viewport.scrollLeft).toBe(0);

    // The last one: at the end of the content (the margin cannot be kept there: no more content to scroll to).
    tile(9).focus();
    await scrollEnd();
    expect(isShown(tile(9))).toBe(true);
    expect(Math.round(viewport.scrollLeft)).toBe(viewport.scrollWidth - viewport.clientWidth);
  });

  it('follows a quick run of focus moves (a key held down) smoothly, and ends on the last one', async () => {
    await setReducedMotion(false);
    await mount(tiles(20));

    for (let index = 0; index < 12; index++) {
      tile(index).focus();
      await nextFrame();
    }
    await scrollEnd();

    expect(isShown(tile(11), 24)).toBe(true);
    expect(Math.round(viewportOf().getBoundingClientRect().right - tile(11).getBoundingClientRect().right)).toBe(24);
  });

  it('from right to left: the focused item in view at the start (the left) of the view', async () => {
    await setReducedMotion(true);
    await mount(`<div dir="rtl">${tiles(10)}</div>`);

    tile(5).focus();
    await scrollEnd();

    expect(isShown(tile(5), 24)).toBe(true);
    expect(Math.round(tile(5).getBoundingClientRect().left - viewportOf().getBoundingClientRect().left)).toBe(24);
  });

  it('vertical: a column that scrolls, the focused item in view', async () => {
    await setReducedMotion(true);
    await mount(`<div style="height: 200px">${tiles(10, 'orientation="vertical"', 'width: 200px')}</div>`);
    const viewport = viewportOf();

    expect(getComputedStyle(viewport).flexDirection).toBe('column');
    expect(viewport.clientHeight).toBe(200);
    tile(6).focus();
    await scrollEnd();
    const rect = tile(6).getBoundingClientRect();
    const box = viewport.getBoundingClientRect();
    expect(rect.top).toBeGreaterThanOrEqual(box.top + 24 - 1);
    expect(Math.round(box.bottom - rect.bottom)).toBe(24);
  });

  it('snap: stops on the start of an item, and the focused item stays in view', async () => {
    await setReducedMotion(true);
    await mount(tiles(10, 'snap'));
    const viewport = viewportOf();

    expect(getComputedStyle(viewport).scrollSnapType).toBe('x mandatory');
    expect(getComputedStyle(tile(0)).scrollSnapAlign).toBe('start');
    tile(4).focus();
    await scrollEnd();
    expect(isShown(tile(4))).toBe(true);

    viewport.scrollBy({ left: 30 });
    await scrollEnd();
    // On the start of an item, at the margin.
    const starts = Array.from(document.querySelectorAll<HTMLElement>('.tile')).map(item => Math.round(item.getBoundingClientRect().left - viewport.getBoundingClientRect().left));
    expect(starts).toContain(24);
  });

  describe('controls', () => {
    it('a next button at the start, both in the middle, a previous one at the end; each scrolls by a page', async () => {
      await setReducedMotion(true);
      await mount(tiles(12, 'controls'));
      const viewport = viewportOf();
      const buttons = () => Array.from(document.querySelectorAll('.ds-scroller__prev, .ds-scroller__next')).map(button => button.className.match(/ds-scroller__(\w+)/)[1]);

      await expect.poll(buttons).toEqual(['next']);
      expect(await accessibleNode('.ds-scroller__next')).toMatchObject({ role: 'button', name: 'Next items' });

      document.querySelector<HTMLElement>('.ds-scroller__next').click();
      await scrollEnd();
      // A page: the width of the viewport less the margins.
      expect(viewport.scrollLeft).toBe(400 - 48);
      await expect.poll(buttons).toEqual(['prev', 'next']);

      document.querySelector<HTMLElement>('.ds-scroller__prev').click();
      await scrollEnd();
      expect(viewport.scrollLeft).toBe(0);

      viewport.scrollLeft = viewport.scrollWidth;
      await expect.poll(buttons).toEqual(['prev']);
    });

    it('no buttons while the content fits; a button that disappears with the focus gives it to the other one', async () => {
      await setReducedMotion(true);
      await mount(tiles(3, 'controls'));

      expect(document.querySelector('.ds-scroller__next')).toBeNull();
      expect(scrollerOf().classList.contains('--overflowing')).toBe(false);

      await mount(tiles(6, 'controls'));
      const next = await expect.poll(() => document.querySelector<HTMLElement>('.ds-scroller__next')).toBeTruthy();
      void next;
      document.querySelector<HTMLElement>('.ds-scroller__next').focus();
      await userEvent.keyboard('{Enter}');
      await expect.poll(() => document.querySelector('.ds-scroller__next')).toBeNull();
      expect(focused()).toBe(document.querySelector('.ds-scroller__prev'));
    });

    it('labels translates the names of the buttons; next() and previous() scroll by a page', async () => {
      await setReducedMotion(true);
      await mount(tiles(12, `controls labels='{"previous": "Éléments précédents", "next": "Éléments suivants"}'`));

      await expect.poll(async () => (await accessibleNode('.ds-scroller__next'))?.name).toBe('Éléments suivants');
      await scrollerOf().next();
      await scrollEnd();
      expect(await accessibleNode('.ds-scroller__prev')).toMatchObject({ name: 'Éléments précédents' });
      await scrollerOf().previous();
      await scrollEnd();
      expect(viewportOf().scrollLeft).toBe(0);
    });

    it('from right to left: the previous button on the right, the next one on the left, which scrolls to the left', async () => {
      await setReducedMotion(true);
      await mount(`<div dir="rtl">${tiles(12, 'controls')}</div>`);
      await expect.poll(() => document.querySelector('.ds-scroller__next')).toBeTruthy();
      const box = scrollerOf().getBoundingClientRect();

      expect(document.querySelector('.ds-scroller__next').getBoundingClientRect().left - box.left).toBe(8);
      document.querySelector<HTMLElement>('.ds-scroller__next').click();
      await scrollEnd();
      expect(viewportOf().scrollLeft).toBe(-(400 - 48));
      await expect.poll(() => box.right - document.querySelector('.ds-scroller__prev').getBoundingClientRect().right).toBe(8);
    });
  });

  it('follows the content: an item added makes it overflow', async () => {
    await mount(tiles(3, 'controls'));
    const scroller = scrollerOf();

    expect(scroller.classList.contains('--overflowing')).toBe(false);
    const extra = tile(0).cloneNode(true) as HTMLElement;
    extra.style.width = '300px';
    viewportOf().append(extra);
    await expect.poll(() => scroller.classList.contains('--overflowing')).toBe(true);
    await expect.poll(() => document.querySelector('.ds-scroller__next')).toBeTruthy();
  });
});
