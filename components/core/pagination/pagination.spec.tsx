import { describe, expect, it, vi } from 'vitest';
import './pagination';
import { fakeMatchMedia, renderPage, trackFocus } from '../../../test/helpers';
import { DS_PAGINATION_MAX_RANGE } from './pagination.constants';
import { getPaginationItems, getPaginationState } from './pagination.pages';
import { DSPaginationChangeDetail, DSPaginationItem } from './pagination.types';

type Pagination = HTMLElement & { total: number | string; current: number | string; compact: boolean; compactBelow: string; labels: unknown; label: string; hrefTemplate: string };

/** The items as text: the page numbers, `…` for an ellipsis. */
const text = (items: DSPaginationItem[]) => items.map(item => (item.type === 'page' ? String(item.page) : '…')).join(' ');

const itemsOf = (total: number, current: number, siblings = 1, boundaries = 1) => text(getPaginationItems(getPaginationState({ total, current, siblings, boundaries })));

describe('getPaginationState', () => {
  it.each([
    [
      { total: 10, current: 3 },
      { total: 10, current: 3, siblings: 1, boundaries: 1 },
    ],
    [
      { total: '10', current: '3', siblings: '2', boundaries: '0' },
      { total: 10, current: 3, siblings: 2, boundaries: 0 },
    ],
    [
      { total: 10.9, current: 3.9 },
      { total: 10, current: 3, siblings: 1, boundaries: 1 },
    ],
    // The current page in range, 1 when it is not a number.
    [
      { total: 10, current: 20 },
      { total: 10, current: 10, siblings: 1, boundaries: 1 },
    ],
    [
      { total: 10, current: -5 },
      { total: 10, current: 1, siblings: 1, boundaries: 1 },
    ],
    [
      { total: 10, current: 0 },
      { total: 10, current: 1, siblings: 1, boundaries: 1 },
    ],
    [
      { total: 10, current: 'three' },
      { total: 10, current: 1, siblings: 1, boundaries: 1 },
    ],
    [
      { total: 10, current: '' },
      { total: 10, current: 1, siblings: 1, boundaries: 1 },
    ],
    [
      { total: 10, current: null },
      { total: 10, current: 1, siblings: 1, boundaries: 1 },
    ],
    // No pages: nothing is current.
    [
      { total: 0, current: 3 },
      { total: 0, current: 0, siblings: 1, boundaries: 1 },
    ],
    [{ total: -4 }, { total: 0, current: 0, siblings: 1, boundaries: 1 }],
    [{ total: 'many' }, { total: 0, current: 0, siblings: 1, boundaries: 1 }],
    [{ total: Infinity }, { total: 0, current: 0, siblings: 1, boundaries: 1 }],
    [{}, { total: 0, current: 0, siblings: 1, boundaries: 1 }],
    [
      { total: 1e20, current: 1e20 },
      { total: Number.MAX_SAFE_INTEGER, current: Number.MAX_SAFE_INTEGER, siblings: 1, boundaries: 1 },
    ],
    // siblings and boundaries from 0 to the maximum.
    [
      { total: 5, siblings: -1, boundaries: 'x' },
      { total: 5, current: 1, siblings: 0, boundaries: 1 },
    ],
    [
      { total: 5, siblings: 1000, boundaries: 99 },
      { total: 5, current: 1, siblings: DS_PAGINATION_MAX_RANGE, boundaries: DS_PAGINATION_MAX_RANGE },
    ],
  ])('%j: %j', (props, state) => {
    expect(getPaginationState(props)).toEqual(state);
  });
});

describe('getPaginationItems', () => {
  it.each([
    // [total, current, siblings, boundaries, items]
    [0, 1, 1, 1, ''],
    [1, 1, 1, 1, '1'],
    [2, 2, 1, 1, '1 2'],
    [7, 4, 1, 1, '1 2 3 4 5 6 7'],
    [8, 1, 1, 1, '1 2 3 4 5 … 8'],
    [8, 4, 1, 1, '1 2 3 4 5 … 8'],
    [8, 5, 1, 1, '1 … 4 5 6 7 8'],
    [8, 8, 1, 1, '1 … 4 5 6 7 8'],
    [10, 1, 1, 1, '1 2 3 4 5 … 10'],
    [10, 5, 1, 1, '1 … 4 5 6 … 10'],
    [10, 6, 1, 1, '1 … 5 6 7 … 10'],
    [10, 7, 1, 1, '1 … 6 7 8 9 10'],
    [10, 10, 1, 1, '1 … 6 7 8 9 10'],
    [20, 10, 2, 1, '1 … 8 9 10 11 12 … 20'],
    [20, 10, 1, 2, '1 2 … 9 10 11 … 19 20'],
    [20, 3, 1, 2, '1 2 3 4 5 6 … 19 20'],
    [20, 10, 0, 1, '1 … 10 … 20'],
    [20, 2, 0, 1, '1 2 3 … 20'],
    [20, 10, 1, 0, '… 9 10 11 …'],
    [20, 1, 1, 0, '1 2 3 4 …'],
    [20, 20, 1, 0, '… 17 18 19 20'],
    [20, 10, 0, 0, '… 10 …'],
    [1000000, 500000, 1, 1, '1 … 499999 500000 500001 … 1000000'],
    [
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      1,
      1,
      `1 … ${Number.MAX_SAFE_INTEGER - 4} ${Number.MAX_SAFE_INTEGER - 3} ${Number.MAX_SAFE_INTEGER - 2} ${Number.MAX_SAFE_INTEGER - 1} ${Number.MAX_SAFE_INTEGER}`,
    ],
  ])('total %s, current %s, siblings %s, boundaries %s: %s', (total, current, siblings, boundaries, expected) => {
    expect(itemsOf(total, current, siblings, boundaries)).toBe(expected);
  });

  it('for every total up to 40, current page, siblings and boundaries up to 3: the same number of items, the pages around the current one and at the ends, an ellipsis for 2 pages at least', () => {
    let checked = 0;
    for (let total = 0; total <= 40; total++) {
      for (let siblings = 0; siblings <= 3; siblings++) {
        for (let boundaries = 0; boundaries <= 3; boundaries++) {
          const length = Math.min(total, 2 * boundaries + 2 * siblings + 3);
          for (let current = 1; current <= Math.max(total, 1); current++) {
            const state = getPaginationState({ total, current, siblings, boundaries });
            const items = getPaginationItems(state);
            const pages = items.filter(item => item.type === 'page').map(item => (item as { page: number }).page);
            const label = `total ${total}, current ${current}, siblings ${siblings}, boundaries ${boundaries}: ${text(items)}`;

            expect([label, items.length]).toEqual([label, length]);
            // In order, in range, once each.
            expect([label, pages.every((page, index) => page >= 1 && page <= total && (index === 0 || page > pages[index - 1]))]).toEqual([label, true]);
            if (total > 0) {
              // The current page, its siblings, and the boundaries.
              const expected = new Set<number>();
              for (let page = state.current - siblings; page <= state.current + siblings; page++) if (page >= 1 && page <= total) expected.add(page);
              for (let page = 1; page <= Math.min(boundaries, total); page++) expected.add(page).add(total - page + 1);
              expect([label, [...expected].filter(page => !pages.includes(page))]).toEqual([label, []]);
            }
            // Between two items, either the next page or an ellipsis for 2 pages at least; an ellipsis is never next to another.
            items.forEach((item, index) => {
              if (item.type === 'ellipsis') {
                const before = items[index - 1]?.type === 'page' ? (items[index - 1] as { page: number }).page : 0;
                const after = items[index + 1]?.type === 'page' ? (items[index + 1] as { page: number }).page : total + 1;
                expect([label, after - before - 1 >= 2, items[index + 1]?.type]).toEqual([label, true, index === items.length - 1 ? undefined : 'page']);
              } else if (items[index + 1]?.type === 'page') {
                expect([label, (items[index + 1] as { page: number }).page - item.page]).toEqual([label, 1]);
              }
            });
            // The pages at the ends: the first and last pages, or an ellipsis without boundaries.
            if (total > 0 && boundaries > 0) expect([label, pages[0], pages.at(-1)]).toEqual([label, 1, total]);
            checked++;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(10000);
  });

  it('a huge number of pages: as many items as for a few', () => {
    const state = getPaginationState({ total: 1e15, current: 123456789, siblings: 3, boundaries: 2 });

    expect(text(getPaginationItems(state))).toBe('1 2 … 123456786 123456787 123456788 123456789 123456790 123456791 123456792 … 999999999999999 1000000000000000');
  });

  it('siblings and boundaries above the maximum: as many items as with the maximum', () => {
    expect(getPaginationItems(getPaginationState({ total: 1e9, current: 5e8, siblings: 1e9, boundaries: 1e9 }))).toHaveLength(4 * DS_PAGINATION_MAX_RANGE + 3);
  });
});

describe('ds-pagination', () => {
  const render = async (html: string, width = 1000) => {
    const page = await renderPage('');
    const media = fakeMatchMedia(width);
    await page.setContent(html);
    const element = page.body.querySelector('ds-pagination') as Pagination;
    const controls = () => Array.from(element.querySelectorAll<HTMLElement>('.ds-pagination__control'));
    const control = (kind: string) => element.querySelector<HTMLElement>(`.ds-pagination__control.--${kind}`);
    const pageControl = (number: number) => controls().find(item => item.classList.contains('--page') && item.textContent === String(number));
    /** The list as text: the page numbers, `[n]` for the current page, `…` for an ellipsis. */
    const list = () =>
      Array.from(element.querySelectorAll('.ds-pagination__item'))
        .map(item => (item.classList.contains('--ellipsis') ? '…' : item.querySelector('[aria-current]') ? `[${item.textContent}]` : item.textContent))
        .join(' ');
    const events: DSPaginationChangeDetail[] = [];
    element?.addEventListener('pageChange', (event: CustomEvent<DSPaginationChangeDetail>) => events.push(event.detail));
    const resizeTo = async (newWidth: number) => {
      media.resize(newWidth);
      await page.waitForChanges();
    };
    return { page, element, controls, control, pageControl, list, events, resizeTo, media };
  };

  describe('landmark', () => {
    it('is a navigation landmark named "Pagination"; label names it; mods are classes', async () => {
      const { page, element } = await render('<ds-pagination total="5" mods="small"></ds-pagination>');

      expect(element).toEqualAttributes({ 'role': 'navigation', 'aria-label': 'Pagination' });
      expect(element).toHaveClasses(['ds-pagination', '--small', '--buttons']);
      element.label = 'Results pages';
      await page.waitForChanges();
      expect(element.getAttribute('aria-label')).toBe('Results pages');
    });

    it.each([
      ['in a nav element', '<nav aria-label="Results">%s</nav>'],
      ['in a navigation landmark', '<div role="navigation"><div>%s</div></div>'],
    ])('is not a landmark %s: no role, no name', async (_, wrapper) => {
      const { element } = await render(wrapper.replace('%s', '<ds-pagination total="5"></ds-pagination>'));

      expect([element.hasAttribute('role'), element.hasAttribute('aria-label')]).toEqual([false, false]);
    });

    it('keeps a role of its own', async () => {
      const { element } = await render('<ds-pagination total="5" role="region" label="Pages"></ds-pagination>');

      expect(element).toEqualAttributes({ 'role': 'region', 'aria-label': 'Pages' });
    });

    it.each(['0', '-1', 'none', ''])('total="%s": no pages, nothing rendered, not a landmark', async total => {
      const { element } = await render(`<ds-pagination total="${total}"></ds-pagination>`);

      expect(element.children).toHaveLength(0);
      expect(element.hasAttribute('role')).toBe(false);
      expect(element).toHaveClass('--empty');
    });

    it('one page: that page, current, between the unavailable previous and next controls', async () => {
      const { list, control } = await render('<ds-pagination total="1"></ds-pagination>');

      expect(list()).toBe('[1]');
      expect([control('previous').hasAttribute('disabled'), control('next').hasAttribute('disabled')]).toEqual([true, true]);
    });
  });

  describe('pages', () => {
    it('renders the controls in order: previous, the list of the pages, next; the ellipses hidden from assistive technologies', async () => {
      const { element, list } = await render('<ds-pagination total="20" current="10"></ds-pagination>');

      expect(Array.from(element.children).map(child => child.className)).toEqual(['ds-pagination__control --previous', 'ds-pagination__list', 'ds-pagination__control --next']);
      expect(list()).toBe('1 … 9 [10] 11 … 20');
      expect(Array.from(element.querySelectorAll('.--ellipsis')).map(item => [item.localName, item.getAttribute('aria-hidden'), item.textContent])).toEqual([
        ['li', 'true', ''],
        ['li', 'true', ''],
      ]);
    });

    it('names each page "Page n", shows its number; the current page has aria-current="page"', async () => {
      const { pageControl } = await render('<ds-pagination total="3" current="2"></ds-pagination>');

      expect([1, 2, 3].map(number => [pageControl(number).getAttribute('aria-label'), pageControl(number).textContent, pageControl(number).getAttribute('aria-current')])).toEqual([
        ['Page 1', '1', null],
        ['Page 2', '2', 'page'],
        ['Page 3', '3', null],
      ]);
    });

    it('siblings and boundaries set the pages around the current one and at the ends', async () => {
      const { list } = await render('<ds-pagination total="30" current="15" siblings="2" boundaries="2"></ds-pagination>');

      expect(list()).toBe('1 2 … 13 14 [15] 16 17 … 29 30');
    });

    it('a current page out of range is the closest page', async () => {
      const { page, element, list } = await render('<ds-pagination total="10" current="42"></ds-pagination>');
      expect(list()).toBe('1 … 6 7 8 9 [10]');

      element.current = -3;
      await page.waitForChanges();
      expect(list()).toBe('[1] 2 3 4 5 … 10');
    });

    it('follows total and current set by a script, without pageChange', async () => {
      const { page, element, list, events } = await render('<ds-pagination total="10" current="1"></ds-pagination>');

      element.total = 4;
      element.current = 3;
      await page.waitForChanges();

      expect(list()).toBe('1 2 [3] 4');
      expect(events).toEqual([]);
    });

    it('first-last renders the controls of the first and of the last page', async () => {
      const { element } = await render('<ds-pagination total="10" current="5" first-last></ds-pagination>');

      expect(Array.from(element.children).map(child => [child.className, child.getAttribute('aria-label')])).toEqual([
        ['ds-pagination__control --first', 'First page'],
        ['ds-pagination__control --previous', 'Previous page'],
        ['ds-pagination__list', null],
        ['ds-pagination__control --next', 'Next page'],
        ['ds-pagination__control --last', 'Last page'],
      ]);
    });
  });

  describe('links mode', () => {
    it('href-template: links to the pages, the current one too; previous and next with rel', async () => {
      const { element, controls, events } = await render('<ds-pagination total="10" current="5" href-template="/results?page={page}&amp;sort=price" first-last></ds-pagination>');

      expect(element).toHaveClass('--links');
      expect(controls().map(control => [control.localName, control.getAttribute('aria-label'), control.getAttribute('href'), control.getAttribute('rel')])).toEqual([
        ['a', 'First page', '/results?page=1&sort=price', null],
        ['a', 'Previous page', '/results?page=4&sort=price', 'prev'],
        ['a', 'Page 1', '/results?page=1&sort=price', null],
        ['a', 'Page 4', '/results?page=4&sort=price', null],
        ['a', 'Page 5', '/results?page=5&sort=price', null],
        ['a', 'Page 6', '/results?page=6&sort=price', null],
        ['a', 'Page 10', '/results?page=10&sort=price', null],
        ['a', 'Next page', '/results?page=6&sort=price', 'next'],
        ['a', 'Last page', '/results?page=10&sort=price', null],
      ]);
      expect(element.querySelector('[aria-current="page"]').getAttribute('href')).toBe('/results?page=5&sort=price');

      // A click is the browser's: no event, the current page stays until the next page loads.
      controls()[2].click();
      expect([events, element.current]).toEqual([[], '5']);
    });

    it('on the first page, previous and first are links without href (role="link", aria-disabled), out of the Tab order; next and last on the last page', async () => {
      const { page, element, control } = await render('<ds-pagination total="3" current="1" href-template="?page={page}" first-last></ds-pagination>');
      const state = () =>
        ['first', 'previous', 'next', 'last'].map(kind => [
          kind,
          control(kind).getAttribute('href'),
          control(kind).getAttribute('role'),
          control(kind).getAttribute('aria-disabled'),
        ]);

      expect(state()).toEqual([
        ['first', null, 'link', 'true'],
        ['previous', null, 'link', 'true'],
        ['next', '?page=2', null, null],
        ['last', '?page=3', null, null],
      ]);
      expect(control('previous')).toHaveClass('--disabled');

      element.current = 3;
      await page.waitForChanges();
      expect(state()).toEqual([
        ['first', '?page=1', null, null],
        ['previous', '?page=2', null, null],
        ['next', null, 'link', 'true'],
        ['last', null, 'link', 'true'],
      ]);
    });
  });

  describe('buttons mode', () => {
    it('renders buttons; a click on a page emits pageChange (cancelable), then makes it current', async () => {
      const { page, element, controls, pageControl, list } = await render('<ds-pagination total="10" current="1"></ds-pagination>');
      const events: [number, number, boolean][] = [];
      element.addEventListener('pageChange', (event: CustomEvent<DSPaginationChangeDetail>) => events.push([event.detail.page, event.detail.previous, event.cancelable]));

      expect(controls().every(control => control.localName === 'button' && control.getAttribute('type') === 'button')).toBe(true);
      pageControl(4).click();
      await page.waitForChanges();

      expect(events).toEqual([[4, 1, true]]);
      expect([element.current, element.getAttribute('current'), list()]).toEqual([4, '4', '1 2 3 [4] 5 … 10']);
    });

    it('previous, next, first and last ask for their page', async () => {
      const { page, control, events } = await render('<ds-pagination total="10" current="5" first-last></ds-pagination>');

      for (const kind of ['next', 'next', 'previous', 'last', 'first']) {
        control(kind).click();
        await page.waitForChanges();
      }

      expect(events).toEqual([
        { page: 6, previous: 5 },
        { page: 7, previous: 6 },
        { page: 6, previous: 7 },
        { page: 10, previous: 6 },
        { page: 1, previous: 10 },
      ]);
    });

    it('a cancelled pageChange keeps the current page', async () => {
      const { page, element, control, list } = await render('<ds-pagination total="10" current="5"></ds-pagination>');
      element.addEventListener('pageChange', event => event.preventDefault());

      control('next').click();
      await page.waitForChanges();

      expect([element.current, list()]).toEqual(['5', '1 … 4 [5] 6 … 10']);
    });

    it('the current page and the unavailable controls ask for nothing', async () => {
      const { page, control, pageControl, events } = await render('<ds-pagination total="3" current="1"></ds-pagination>');

      pageControl(1).click();
      control('previous').click();
      await page.waitForChanges();

      expect(events).toEqual([]);
      expect([control('previous').hasAttribute('disabled'), control('previous')]).toEqual([true, expect.objectContaining({ className: expect.stringContaining('--disabled') })]);
      expect(control('next').hasAttribute('disabled')).toBe(false);
    });
  });

  describe('focus after a page change', () => {
    it('stays on the next control while it is available, then goes to the current page', async () => {
      const focused = trackFocus();
      const { page, control, pageControl } = await render('<ds-pagination total="3" current="1"></ds-pagination>');
      control('next').focus();

      control('next').click();
      await page.waitForChanges();
      expect(focused()).toBe(control('next'));

      control('next').click();
      await page.waitForChanges();
      expect([control('next').hasAttribute('disabled'), focused()]).toEqual([true, pageControl(3)]);
    });

    it('previous on the second page, first: to the first page', async () => {
      const focused = trackFocus();
      const { page, control, pageControl } = await render('<ds-pagination total="10" current="2" first-last></ds-pagination>');
      control('previous').focus();
      control('previous').click();
      await page.waitForChanges();
      expect(focused()).toBe(pageControl(1));

      control('last').focus();
      control('last').click();
      await page.waitForChanges();
      expect(focused()).toBe(pageControl(10));
    });

    it('a page: on that page, now the current one, wherever it moved in the list', async () => {
      const focused = trackFocus();
      const { page, pageControl, list } = await render('<ds-pagination total="20" current="1"></ds-pagination>');
      pageControl(5).focus();

      pageControl(5).click();
      await page.waitForChanges();

      expect(list()).toBe('1 … 4 [5] 6 … 20');
      expect(focused()).toBe(pageControl(5));
    });

    it('compact: the next control on the last page gives it to the previous one', async () => {
      const focused = trackFocus();
      const { page, control } = await render('<ds-pagination total="2" current="1" compact></ds-pagination>');
      control('next').focus();

      control('next').click();
      await page.waitForChanges();

      expect(focused()).toBe(control('previous'));
    });

    it('a page control that goes away when a script changes the current page: to the current page', async () => {
      const focused = trackFocus();
      const { page, element, pageControl } = await render('<ds-pagination total="20" current="1"></ds-pagination>');
      pageControl(4).focus();

      element.current = 15;
      await page.waitForChanges();

      expect([pageControl(4), focused()]).toEqual([undefined, pageControl(15)]);
    });

    it('stays where a pageChange listener moved it', async () => {
      const focused = trackFocus();
      const { page, element, control } = await render('<h2 id="results" tabindex="-1">Results</h2><ds-pagination total="2" current="1"></ds-pagination>');
      const heading = page.body.querySelector<HTMLElement>('#results');
      element.addEventListener('pageChange', () => heading.focus());
      control('next').focus();

      control('next').click();
      await page.waitForChanges();

      expect(focused()).toBe(heading);
    });

    it('a render while the focus is elsewhere moves nothing', async () => {
      const focused = trackFocus();
      const { page, element } = await render('<button id="other">Other</button><ds-pagination total="3" current="1"></ds-pagination>');
      const other = page.body.querySelector<HTMLElement>('#other');
      other.focus();

      element.current = 3;
      await page.waitForChanges();

      expect(focused()).toBe(other);
    });
  });

  describe('compact', () => {
    it('below sm (768 px without the theme): the previous and next controls around "Page 3 of 10", with the same names', async () => {
      const { element, controls, resizeTo } = await render('<ds-pagination total="10" current="3" first-last></ds-pagination>', 767);
      const names = () => controls().map(control => control.getAttribute('aria-label'));

      expect(element).toHaveClass('--compact');
      expect(Array.from(element.children).map(child => child.className)).toEqual([
        'ds-pagination__control --first',
        'ds-pagination__control --previous',
        'ds-pagination__status',
        'ds-pagination__control --next',
        'ds-pagination__control --last',
      ]);
      expect(element.querySelector('.ds-pagination__status').textContent).toBe('Page 3 of 10');
      expect(names()).toEqual(['First page', 'Previous page', 'Next page', 'Last page']);

      await resizeTo(768);
      expect(element).not.toHaveClass('--compact');
      expect(element.querySelector('.ds-pagination__status')).toBeNull();
      expect(names()).toEqual(['First page', 'Previous page', 'Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5', 'Page 10', 'Next page', 'Last page']);

      await resizeTo(400);
      expect(element).toHaveClass('--compact');
    });

    it('compact-below another breakpoint, or none; compact: always', async () => {
      const { page, element, media } = await render('<ds-pagination total="10" compact-below="md"></ds-pagination>', 900);
      expect(element).toHaveClass('--compact');
      expect(media.watched()).toContain('(min-width: 992px)');

      element.compactBelow = 'none';
      await page.waitForChanges();
      expect(element).not.toHaveClass('--compact');
      expect(media.watched()).toEqual([]);

      element.compact = true;
      await page.waitForChanges();
      expect(element).toHaveClass('--compact');
    });

    it('stops watching the viewport when it leaves the document', async () => {
      const { page, element, media } = await render('<ds-pagination total="10"></ds-pagination>');
      expect(media.watched()).toEqual(['(min-width: 768px)']);

      element.remove();
      await page.waitForChanges();
      expect(media.watched()).toEqual([]);
    });
  });

  describe('texts', () => {
    it('labels translates the names and the compact text, with the plural of the number of pages in the language of the page', async () => {
      const labels = {
        first: 'Première page',
        previous: 'Page précédente',
        next: 'Page suivante',
        last: 'Dernière page',
        page: 'Page {page}',
        status: { one: 'Page {page} sur {total} (une seule)', other: 'Page {page} sur {total}' },
      };
      const { page, element, controls } = await render(`<div lang="fr"><ds-pagination total="1" first-last compact labels='${JSON.stringify(labels)}'></ds-pagination></div>`);
      const status = () => element.querySelector('.ds-pagination__status').textContent;

      expect(controls().map(control => control.getAttribute('aria-label'))).toEqual(['Première page', 'Page précédente', 'Page suivante', 'Dernière page']);
      expect(status()).toBe('Page 1 sur 1 (une seule)');
      element.total = 12;
      element.current = 4;
      await page.waitForChanges();
      expect(status()).toBe('Page 4 sur 12');
    });

    it('a page template with the number elsewhere', async () => {
      const { pageControl } = await render(`<ds-pagination total="2" labels='{"page": "{page}. oldal"}'></ds-pagination>`);

      expect(pageControl(2).getAttribute('aria-label')).toBe('2. oldal');
    });

    it('labels that are not valid JSON: the default texts, and an error', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { control } = await render('<ds-pagination total="2" labels="{next"></ds-pagination>');

      expect(control('next').getAttribute('aria-label')).toBe('Next page');
      expect(error).toHaveBeenCalledWith('[ds-pagination] labels is not valid JSON');
    });
  });
});
