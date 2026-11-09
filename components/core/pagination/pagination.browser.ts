import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { accessibleNode, focused, mount, nextFrame, recordEvents, setForcedColors } from '../../../test/helpers/browser';

type Pagination = HTMLElement & { current: number | string; total: number | string };

const element = () => document.querySelector<Pagination>('ds-pagination');
const control = (kind: string) => document.querySelector<HTMLElement>(`.ds-pagination__control.--${kind}`);
const pageControl = (number: number) => Array.from(document.querySelectorAll<HTMLElement>('.ds-pagination__control.--page')).find(item => item.textContent === String(number));
/** The list as text: the page numbers, `[n]` for the current page, `…` for an ellipsis. */
const list = () =>
  Array.from(document.querySelectorAll('.ds-pagination__item'))
    .map(item => (item.classList.contains('--ellipsis') ? '…' : item.querySelector('[aria-current]') ? `[${item.textContent}]` : item.textContent))
    .join(' ');
/** What has the focus: a page number, or the kind of a control (`next`), or the id of another element. */
const focusName = () => {
  const active = focused() as HTMLElement;
  const kind = ['first', 'previous', 'next', 'last'].find(name => active.classList.contains(`--${name}`));
  return kind ?? (active.classList.contains('--page') ? Number(active.textContent) : active.id || active.localName);
};

describe('ds-pagination in a browser', () => {
  afterEach(() => history.replaceState(null, '', location.pathname + location.search));

  it('a navigation landmark named "Pagination": a list of named pages, the current one marked, the ellipses not in the tree', async () => {
    await mount('<ds-pagination total="20" current="10" href-template="#page-{page}"></ds-pagination>');

    expect(await accessibleNode('ds-pagination')).toMatchObject({ role: 'navigation', name: 'Pagination' });
    expect(await accessibleNode('.ds-pagination__list')).toMatchObject({ role: 'list' });
    expect(await accessibleNode('.ds-pagination__control.--previous')).toMatchObject({ role: 'link', name: 'Previous page', properties: { focusable: true } });
    expect(await accessibleNode('.ds-pagination__control.--next')).toMatchObject({ role: 'link', name: 'Next page' });
    expect(await accessibleNode('.ds-pagination__item:nth-child(3) a')).toMatchObject({ role: 'link', name: 'Page 9' });
    expect(await accessibleNode('[aria-current="page"]')).toMatchObject({ role: 'link', name: 'Page 10' });
    expect(await accessibleNode('.ds-pagination__item.--ellipsis')).toBeNull();
    // The links of the page, by their role and name, as the browser computes them.
    await expect.element(page.getByRole('link', { name: 'Page 20', exact: true })).toHaveAttribute('href', '#page-20');
    expect(page.getByRole('navigation', { name: 'Pagination' }).getByRole('listitem').elements()).toHaveLength(5);
  });

  it('links mode: unavailable previous on the first page, out of the Tab order; the links navigate to their page', async () => {
    await mount('<button id="before">Before</button><ds-pagination total="3" current="1" href-template="#page-{page}"></ds-pagination>');
    const clicks = recordEvents(document, ['click'], event => event.defaultPrevented);

    expect(await accessibleNode('.ds-pagination__control.--previous')).toMatchObject({ role: 'link', name: 'Previous page', properties: { disabled: true } });
    document.querySelector<HTMLElement>('#before').focus();
    const order = [];
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      order.push(focusName());
    }
    expect(order).toEqual([1, 2, 3, 'next']);

    await userEvent.keyboard('{Enter}');
    expect([location.hash, clicks]).toEqual(['#page-2', [false]]);
    pageControl(3).focus();
    await userEvent.keyboard('{Enter}');
    expect(location.hash).toBe('#page-3');
  });

  it('buttons mode: Tab skips the disabled previous; Enter and Space change the page and emit pageChange', async () => {
    await mount('<button id="before">Before</button><ds-pagination total="10" current="1"></ds-pagination>');
    const events = recordEvents(document, ['pageChange'], event => (event as CustomEvent).detail.page);

    expect(await accessibleNode('.ds-pagination__control.--previous')).toMatchObject({ role: 'button', name: 'Previous page', properties: { disabled: true } });
    expect(await accessibleNode('.ds-pagination__control.--current')).toMatchObject({ role: 'button', name: 'Page 1' });
    document.querySelector<HTMLElement>('#before').focus();
    await userEvent.tab();
    await userEvent.tab();
    expect(focusName()).toBe(2);

    await userEvent.keyboard('{Enter}');
    await expect.poll(list).toBe('1 [2] 3 4 5 … 10');
    expect(focusName()).toBe(2);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect.poll(list).toBe('1 2 [3] 4 5 … 10');
    expect([events, focusName(), element().getAttribute('current')]).toEqual([[2, 3], 3, '3']);
  });

  it('buttons mode: the focus is never lost, through the pages with the next control, to the last page', async () => {
    await mount('<ds-pagination total="12" current="1" first-last></ds-pagination>');
    control('next').focus();
    const steps = [];

    for (let page = 2; page <= 12; page++) {
      await userEvent.keyboard('{Enter}');
      await expect.poll(() => element().getAttribute('current')).toBe(String(page));
      await nextFrame();
      steps.push(focusName());
    }

    // On the next control while it is available, then on the last page.
    expect(steps).toEqual(['next', 'next', 'next', 'next', 'next', 'next', 'next', 'next', 'next', 'next', 12]);
    expect([list(), (control('next') as HTMLButtonElement).disabled]).toEqual(['1 … 8 9 10 11 [12]', true]);

    // The previous control to the first page, then the first control: the first page.
    control('previous').focus();
    element().current = 2;
    await expect.poll(list).toBe('1 [2] 3 4 5 … 12');
    await userEvent.keyboard('{Enter}');
    await expect.poll(list).toBe('[1] 2 3 4 5 … 12');
    await nextFrame();
    expect(focusName()).toBe(1);

    control('last').focus();
    await userEvent.keyboard(' ');
    await expect.poll(list).toBe('1 … 8 9 10 11 [12]');
    await nextFrame();
    expect(focusName()).toBe(12);
  });

  it('buttons mode: a page clicked with the pointer keeps the focus as the list moves around it', async () => {
    await mount('<ds-pagination total="30" current="1"></ds-pagination>');

    await userEvent.click(pageControl(5));
    await expect.poll(list).toBe('1 … 4 [5] 6 … 30');
    await nextFrame();
    expect(focusName()).toBe(5);

    await userEvent.click(pageControl(6));
    await expect.poll(list).toBe('1 … 5 [6] 7 … 30');
    await nextFrame();
    expect(focusName()).toBe(6);
  });

  it('buttons mode, compact: the next control on the last page gives the focus to the previous one', async () => {
    await mount('<ds-pagination total="2" current="1" compact></ds-pagination>');
    control('next').focus();

    await userEvent.keyboard('{Enter}');

    await expect.poll(() => document.querySelector('.ds-pagination__status').textContent).toBe('Page 2 of 2');
    await nextFrame();
    expect(focusName()).toBe('previous');
  });

  it('compact below sm, across the breakpoint, with the same names; no horizontal scroll at 320 px', async () => {
    await page.viewport(767, 800);
    await mount('<ds-pagination total="250" current="120" href-template="#page-{page}" first-last></ds-pagination>');
    const names = () => Array.from(document.querySelectorAll('.ds-pagination__control'), item => item.getAttribute('aria-label'));

    expect([element().classList.contains('--compact'), document.querySelector('.ds-pagination__status').textContent]).toEqual([true, 'Page 120 of 250']);
    expect(names()).toEqual(['First page', 'Previous page', 'Next page', 'Last page']);
    expect(await accessibleNode('ds-pagination')).toMatchObject({ role: 'navigation', name: 'Pagination' });

    await page.viewport(768, 800);
    await expect.poll(() => element().classList.contains('--compact')).toBe(false);
    expect(names()).toEqual(['First page', 'Previous page', 'Page 1', 'Page 119', 'Page 120', 'Page 121', 'Page 250', 'Next page', 'Last page']);

    await page.viewport(320, 640);
    await expect.poll(() => element().classList.contains('--compact')).toBe(true);
    expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth);
    for (const item of Array.from(element().children)) expect(item.getBoundingClientRect().right).toBeLessThanOrEqual(320);
    // A target of 40 × 40 px.
    const box = control('next').getBoundingClientRect();
    expect([box.width, box.height]).toEqual([40, 40]);
  });

  it('never compact, at 320 px: the list wraps between the arrows, without a horizontal scroll', async () => {
    await page.viewport(320, 640);
    await mount('<ds-pagination total="250" current="120" siblings="3" boundaries="2" compact-below="none" first-last></ds-pagination>');
    const tops = new Set(Array.from(document.querySelectorAll('.ds-pagination__control.--page'), item => Math.round(item.getBoundingClientRect().top)));
    const box = (selector: string) => document.querySelector(selector).getBoundingClientRect();

    expect(element().classList.contains('--compact')).toBe(false);
    expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth);
    expect(tops.size).toBeGreaterThan(1);
    // The arrows at the ends of the list, centered on its lines.
    const listBox = box('.ds-pagination__list');
    expect([box('.--previous').right <= listBox.left, box('.--next').left >= listBox.right, box('.--last').right <= 320]).toEqual([true, true, true]);
    expect(Math.abs((box('.--next').top + box('.--next').bottom) / 2 - (listBox.top + listBox.bottom) / 2)).toBeLessThan(1);
  });

  it('right to left: the previous control on the right, the arrows mirrored', async () => {
    document.documentElement.dir = 'rtl';
    await mount('<ds-pagination total="10" current="5" first-last></ds-pagination>');
    const left = (kind: string) => control(kind).getBoundingClientRect().left;

    expect(left('first')).toBeGreaterThan(left('previous'));
    expect(left('previous')).toBeGreaterThan(pageControl(1).getBoundingClientRect().left);
    expect(pageControl(1).getBoundingClientRect().left).toBeGreaterThan(pageControl(10).getBoundingClientRect().left);
    expect(left('next')).toBeGreaterThan(left('last'));
    for (const kind of ['first', 'previous', 'next', 'last']) expect([kind, getComputedStyle(control(kind), '::before').transform]).toEqual([kind, 'matrix(-1, 0, 0, 1, 0, 0)']);

    document.documentElement.dir = 'ltr';
    expect(getComputedStyle(control('next'), '::before').transform).toBe('none');
  });

  it.each([
    ['links', 'href-template="#page-{page}"'],
    ['buttons', ''],
  ])('forced colors, %s: the current page framed and bold, the unavailable control in another color, the arrows and the ellipsis visible', async (_, attributes) => {
    await mount(`<ds-pagination total="10" current="1" ${attributes}></ds-pagination>`);
    await setForcedColors(true);
    await nextFrame();
    const current = getComputedStyle(pageControl(1));
    const other = getComputedStyle(pageControl(2));
    const previous = getComputedStyle(control('previous'));
    const next = getComputedStyle(control('next'));
    const arrow = getComputedStyle(control('next'), '::before');
    const ellipsis = getComputedStyle(document.querySelector('.ds-pagination__item.--ellipsis'), '::before');

    expect([current.borderTopStyle, current.borderTopWidth, current.borderTopColor, current.fontWeight]).toEqual(['solid', '2px', current.color, '700']);
    expect([other.borderTopStyle, other.fontWeight]).toEqual(['none', '600']);
    expect(previous.color).not.toBe(next.color);
    expect([arrow.forcedColorAdjust, arrow.backgroundColor, arrow.content]).toEqual(['preserve-parent-color', next.color, '"" / ""']);
    expect([ellipsis.forcedColorAdjust, ellipsis.width]).toEqual(['preserve-parent-color', '20px']);

    // The focus indicator shows.
    pageControl(2).focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect([focusName(), getComputedStyle(pageControl(1)).outlineStyle]).toEqual([1, 'solid']);
  });
});
