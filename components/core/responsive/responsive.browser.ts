import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { mount, recordEvents } from '../../../test/helpers/browser';
import type { BreakpointChangeDetail } from '../../utils/interfaces/breakpoints';

/** A ds-rsp and a subscriber that gets, per breakpoint, the label as its `title` property (data-rsp). */
const RSP = `<ds-rsp></ds-rsp><div id="item" data-use-rsp data-rsp='{"xxs": {"title": "xxs"}, "xs": {"title": "xs"}, "sm": {"title": "sm"}, "md": {"title": "md"}, "lg": {"title": "lg"}}'></div>`;

describe('ds-rsp in a browser (the breakpoints of the theme: xs 576, sm 768, md 992, lg 1200 px)', () => {
  const render = async (width: number) => {
    await page.viewport(width, 800);
    const changes = recordEvents(document, ['breakpointChange'], event => (event as CustomEvent<BreakpointChangeDetail>).detail.current.label);
    await mount(RSP);
    const item = document.querySelector<HTMLElement>('#item');
    await expect.poll(() => changes.length).toBe(1);
    return { item, changes };
  };

  it.each([
    [575, 'xxs'],
    [576, 'xs'],
    [767, 'xs'],
    [768, 'sm'],
    [991, 'sm'],
    [992, 'md'],
    [1199, 'md'],
    [1200, 'lg'],
  ])('at %i px, the breakpoint is %s, as the media queries of the theme', async (width, label) => {
    const { item, changes } = await render(width);

    expect(changes).toEqual([label]);
    expect(item.title).toBe(label);
    // The theme stylesheet agrees: its media queries of the boundaries (min-width).
    expect(matchMedia('(min-width: 992px)').matches).toBe(width >= 992);
  });

  it('a resize across a boundary changes the breakpoint at once; a resize within a breakpoint notifies nothing', async () => {
    const { item, changes } = await render(800);
    expect(changes).toEqual(['sm']);

    // Within sm: nothing.
    await page.viewport(900, 800);
    await page.viewport(991, 800);
    // Across md: the subscriber has its params when the event comes.
    await page.viewport(992, 800);
    await expect.poll(() => changes).toEqual(['sm', 'md']);
    expect(item.title).toBe('md');

    // Within md, then down across md and xs at once.
    await page.viewport(1100, 800);
    await page.viewport(500, 800);
    await expect.poll(() => changes).toEqual(['sm', 'md', 'xxs']);
    expect(item.title).toBe('xxs');
  });

  it('a subscriber inserted later gets the params of the current breakpoint at once', async () => {
    await render(1300);
    const later = document.createElement('div');
    later.setAttribute('data-use-rsp', '');
    later.setAttribute('data-rsp', '{"md": {"title": "from md"}}');

    document.body.appendChild(later);

    await expect.poll(() => later.title).toBe('from md');
  });
});
