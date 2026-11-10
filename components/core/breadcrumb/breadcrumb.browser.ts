import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { accessibleNode, focused, mount, nextFrame, setForcedColors } from '../../../test/helpers/browser';

/** A trail of `count` levels, links to `#1`, `#2`… named Level 1, Level 2…, each item with an id (`#item-1`…). */
const trail = (count: number, attributes = '') =>
  `<ds-breadcrumb ${attributes}><ol>${Array.from({ length: count }, (_, index) => `<li id="item-${index + 1}"><a href="#${index + 1}">Level ${index + 1}</a></li>`).join('')}</ol></ds-breadcrumb>`;

const link = (level: number) => document.querySelector<HTMLAnchorElement>(`a[href="#${level}"]`);
const item = (level: number) => document.querySelector<HTMLElement>(`#item-${level}`);
const expandButton = () => document.querySelector<HTMLButtonElement>('.ds-breadcrumb__expand');

describe('ds-breadcrumb in a browser', () => {
  it('a navigation landmark named "Breadcrumb", a list of its levels, the current page marked', async () => {
    await mount('<ds-breadcrumb><ol><li><a href="#home">Home</a></li><li><a href="#women">Women</a></li><li id="last">Shoes</li></ol></ds-breadcrumb>');

    expect(await accessibleNode('ds-breadcrumb')).toMatchObject({ role: 'navigation', name: 'Breadcrumb' });
    expect(await accessibleNode('ol')).toMatchObject({ role: 'list' });
    expect(await accessibleNode('li:first-child')).toMatchObject({ role: 'listitem' });
    expect(await accessibleNode('a[href="#women"]')).toMatchObject({ role: 'link', name: 'Women', properties: { focusable: true } });
    // The protocol does not give aria-current: the attribute that Chromium reads.
    expect(document.querySelector('#last').getAttribute('aria-current')).toBe('page');
    // The landmark the page finds by its role and name.
    await expect.element(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  });

  it('in a nav element of the page: one landmark, the nav', async () => {
    await mount(`<nav aria-label="You are here">${trail(2)}</nav>`);

    expect(await accessibleNode('nav')).toMatchObject({ role: 'navigation', name: 'You are here' });
    expect((await accessibleNode('ds-breadcrumb'))?.role).not.toBe('navigation');
    expect(page.getByRole('navigation').elements()).toHaveLength(1);
  });

  it('draws a chevron between the items, which is not read, nor part of the name of an item', async () => {
    await mount(`${trail(3)}<span id="probe" role="img" aria-labelledby="item-2"></span>`);
    const separator = (level: number) => getComputedStyle(item(level), '::before');

    // The text of the second item, as an aria-labelledby reads it (with the generated content of its ::before): its link only.
    expect(await accessibleNode('#probe')).toMatchObject({ name: 'Level 2' });
    expect(separator(1).content).toBe('none');
    for (const level of [2, 3]) {
      expect([separator(level).content, separator(level).maskImage, separator(level).width, separator(level).transform]).toEqual([
        '"" / ""',
        expect.stringMatching(/^url\("data:image\/svg\+xml,/),
        '14px',
        'none',
      ]);
    }
    // Between the links, on their line.
    const [first, chevron, second] = [link(1).getBoundingClientRect(), item(2).getBoundingClientRect(), link(2).getBoundingClientRect()];
    expect(chevron.left).toBeGreaterThanOrEqual(first.right);
    expect(second.left - chevron.left).toBeGreaterThan(14);
    expect(Math.abs(chevron.top - first.top)).toBeLessThan(2);
  });

  it('Tab goes from link to link; a collapsed trail: Tab skips the hidden items, Enter on the button shows them and focuses the first one', async () => {
    await mount(`<button id="before">Before</button>${trail(6, 'collapse="2"')}<button id="after">After</button>`);
    document.querySelector<HTMLElement>('#before').focus();
    const order: string[] = [];
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      order.push(focused().getAttribute('href') ?? focused().className ?? '');
    }

    expect(order).toEqual(['#1', 'ds-breadcrumb__expand', '#5', '#6', '']);
    expect(focused().id).toBe('after');
    expect(await accessibleNode('.ds-breadcrumb__expand')).toMatchObject({ role: 'button', name: 'Show full path', properties: { expanded: false, focusable: true } });
    expect(await accessibleNode('#item-3')).toBeNull();
    expect([2, 3, 4].map(level => getComputedStyle(item(level)).display)).toEqual(['none', 'none', 'none']);

    expandButton().focus();
    await userEvent.keyboard('{Enter}');

    expect([focused(), expandButton()]).toEqual([link(2), null]);
    await userEvent.tab();
    expect(focused()).toBe(link(3));
    expect(await accessibleNode('#item-3')).toMatchObject({ role: 'listitem' });
  });

  it('Space and a click on the button show the hidden items too', async () => {
    await mount(`${trail(5, 'collapse="1" id="a"')}${trail(5, 'collapse="1" id="b"').replace(/#(\d)/g, '#b$1').replace(/item-/g, 'b-item-')}`);
    const [a, b] = Array.from(document.querySelectorAll<HTMLElement>('.ds-breadcrumb__expand'));

    a.focus();
    await userEvent.keyboard(' ');
    expect(focused()).toBe(link(2));

    await userEvent.click(b);
    expect(focused()).toBe(document.querySelector('a[href="#b2"]'));
    expect(document.querySelectorAll('.ds-breadcrumb__expand')).toHaveLength(0);
  });

  it('wraps on a small screen, without a horizontal scroll', async () => {
    await page.viewport(320, 640);
    await mount(
      '<ds-breadcrumb><ol><li><a href="#1">Home</a></li><li><a href="#2">Women’s collection</a></li><li><a href="#3">Shoes and boots for the winter</a></li><li><a href="#4">Waterproofhikingbootswithaverylongname</a></li></ol></ds-breadcrumb>',
    );
    const element = document.querySelector('ds-breadcrumb');
    const tops = new Set(Array.from(element.querySelectorAll('li'), li => Math.round(li.getBoundingClientRect().top)));

    expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth);
    expect(element.scrollWidth).toBe(element.clientWidth);
    expect(tops.size).toBeGreaterThan(1);
    for (const li of Array.from(element.querySelectorAll('li'))) expect(li.getBoundingClientRect().right).toBeLessThanOrEqual(320);
  });

  it('collapsed below md only, with ds-rsp: across the breakpoint', async () => {
    await mount(`<ds-rsp></ds-rsp>${trail(5, 'collapse="1" data-use-rsp data-rsp=\'{"md": {"collapse": 0}}\'')}`);
    const element = document.querySelector('ds-breadcrumb');
    expect([element.classList.contains('--collapsed'), expandButton()]).toEqual([false, null]);

    await page.viewport(800, 800);
    await expect.poll(() => element.classList.contains('--collapsed')).toBe(true);
    expect(getComputedStyle(item(3)).display).toBe('none');

    await page.viewport(1280, 800);
    await expect.poll(() => element.classList.contains('--collapsed')).toBe(false);
  });

  it('right to left: the items from the right, the chevrons mirrored', async () => {
    document.documentElement.dir = 'rtl';
    await mount(trail(3));

    expect(link(1).getBoundingClientRect().left).toBeGreaterThan(link(2).getBoundingClientRect().right);
    expect(getComputedStyle(item(2), '::before').transform).toBe('matrix(-1, 0, 0, 1, 0, 0)');
    const chevron = item(2).getBoundingClientRect();
    expect(chevron.right).toBeLessThanOrEqual(link(1).getBoundingClientRect().left + 1);
  });

  it('forced colors: the separators in the color of the text, the current page bold and not underlined, the outline of the button', async () => {
    await mount(trail(5, 'collapse="1"'));
    await setForcedColors(true);
    await nextFrame();
    const separator = getComputedStyle(item(5), '::before');
    const current = getComputedStyle(link(5));
    const other = getComputedStyle(link(1));
    const button = getComputedStyle(expandButton());
    const dots = getComputedStyle(expandButton(), '::before');

    expect([separator.forcedColorAdjust, separator.backgroundColor]).toEqual(['preserve-parent-color', getComputedStyle(item(5)).color]);
    expect([current.fontWeight, current.textDecorationLine, other.fontWeight, other.textDecorationLine]).toEqual(['700', 'none', '400', 'underline']);
    expect([button.borderTopStyle, button.borderTopColor]).toEqual(['solid', button.color]);
    expect(dots.backgroundColor).toBe(button.color);

    // The focus indicator shows.
    expandButton().focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect([focused(), getComputedStyle(link(1)).outlineStyle]).toEqual([link(1), 'solid']);
  });
});
