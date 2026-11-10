import { describe, expect, it } from 'vitest';
import './grid';
import type { DSGridItem } from './grid-item/grid-item';
import './grid-item/grid-item';
import { renderPage } from '../../../test/helpers';

/** The custom properties the grid sets on its .ds-grid element (or an item on itself). */
const customProperties = (element: HTMLElement, names: string[]) => Object.fromEntries(names.map(name => [name, element.style.getPropertyValue(name)]));
const GRID_PROPERTIES = ['--ds-grid-cols', '--ds-grid-h-gap', '--ds-grid-v-gap', '--ds-grid-cell-ratio'];

describe('ds-grid', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    await page.waitForChanges();
    const grid = (index = 0) => page.body.querySelectorAll<HTMLElement>('.ds-grid')[index];
    const items = () => Array.from(page.body.querySelectorAll<HTMLElement>('ds-grid-item'));
    return { page, grid, items };
  };

  it('writes its defaults as custom properties and classes: one column, no gap, start alignments, fixed', async () => {
    const { grid } = await render('<ds-grid><ds-grid-item></ds-grid-item></ds-grid>');

    expect(customProperties(grid(), GRID_PROPERTIES)).toEqual({ '--ds-grid-cols': '1', '--ds-grid-h-gap': '0px', '--ds-grid-v-gap': '0px', '--ds-grid-cell-ratio': '' });
    expect(grid().className.split(' ').sort()).toEqual(['--align-start', '--fixed', '--v-align-start', 'ds-grid']);
    expect(grid().querySelector('.ds-grid__row > ds-grid-item')).not.toBeNull();
  });

  it.each([
    ['cols="4"', { '--ds-grid-cols': '4' }],
    ['cols="2.5"', { '--ds-grid-cols': '2' }],
    ['cols="0"', { '--ds-grid-cols': '1' }],
    ['cols="none"', { '--ds-grid-cols': '1' }],
    ['h-gap="20px" v-gap="1rem"', { '--ds-grid-h-gap': '20px', '--ds-grid-v-gap': '1rem' }],
    ['h-gap="5%" v-gap="calc(1rem + 2px)"', { '--ds-grid-h-gap': '5%', '--ds-grid-v-gap': 'calc(1rem + 2px)' }],
    ['h-gap="10" v-gap=" 0 "', { '--ds-grid-h-gap': '10px', '--ds-grid-v-gap': '0px' }],
    ['cell-ratio="0.75"', { '--ds-grid-cell-ratio': '0.75' }],
    ['cell-ratio="0"', { '--ds-grid-cell-ratio': '' }],
  ])('%s sets %j', async (attributes, expected) => {
    const { grid } = await render(`<ds-grid ${attributes}></ds-grid>`);

    expect(customProperties(grid(), Object.keys(expected))).toEqual(expected);
  });

  it.each([
    ['type="fluid"', ['--fluid']],
    ['align="center" v-align="end"', ['--align-center', '--v-align-end']],
    ['align="end" v-align="center"', ['--align-end', '--v-align-center']],
    ['cell-ratio="1"', ['--with-cell-ratio']],
    ['mods="cards,dark"', ['--cards', '--dark']],
  ])('%s sets the classes %j', async (attributes, classes) => {
    const { grid } = await render(`<ds-grid ${attributes}></ds-grid>`);

    expect(grid()).toHaveClasses(classes);
  });

  it('follows its props: the custom properties and classes change, the items are not touched', async () => {
    const { page, grid, items } = await render('<ds-grid cols="2"><ds-grid-item></ds-grid-item><ds-grid-item width="2"></ds-grid-item></ds-grid>');
    const host = page.body.querySelector('ds-grid');

    Object.assign(host, { cols: 4, hGap: '12px', vGap: 8, align: 'center', vAlign: 'end', cellRatio: '0.5', type: 'fluid' });
    await page.waitForChanges();

    expect(customProperties(grid(), GRID_PROPERTIES)).toEqual({ '--ds-grid-cols': '4', '--ds-grid-h-gap': '12px', '--ds-grid-v-gap': '8px', '--ds-grid-cell-ratio': '0.5' });
    expect(grid()).toHaveClasses(['--fluid', '--align-center', '--v-align-end', '--with-cell-ratio']);
    expect(grid()).not.toHaveClasses(['--fixed', '--align-start', '--v-align-start']);

    host.cellRatio = undefined;
    await page.waitForChanges();
    expect(grid().style.getPropertyValue('--ds-grid-cell-ratio')).toBe('');
    expect(grid()).not.toHaveClass('--with-cell-ratio');
    // No inline size on the items: the grid stylesheet lays them out.
    expect(items().map(item => item.getAttribute('style'))).toEqual(['--ds-grid-span: 1;', '--ds-grid-span: 2;']);
  });

  it('lets each nested grid lay out its own items', async () => {
    const { grid, items } = await render(`
      <ds-grid cols="2" h-gap="20px">
        <ds-grid-item width="2"><ds-grid cols="3" h-gap="10px"><ds-grid-item></ds-grid-item><ds-grid-item width="3"></ds-grid-item></ds-grid></ds-grid-item>
        <ds-grid-item></ds-grid-item>
      </ds-grid>`);

    expect(customProperties(grid(0), ['--ds-grid-cols', '--ds-grid-h-gap'])).toEqual({ '--ds-grid-cols': '2', '--ds-grid-h-gap': '20px' });
    expect(customProperties(grid(1), ['--ds-grid-cols', '--ds-grid-h-gap'])).toEqual({ '--ds-grid-cols': '3', '--ds-grid-h-gap': '10px' });
    expect(items().map(item => item.style.getPropertyValue('--ds-grid-span'))).toEqual(['2', '1', '3', '1']);
  });
});

describe('ds-grid-item', () => {
  const render = async (html: string) => {
    const page = await renderPage(html);
    await page.waitForChanges();
    return { page, items: Array.from(page.body.querySelectorAll<HTMLElement & { width: number; setStyles: DSGridItem['setStyles'] }>('ds-grid-item')) };
  };

  it.each([
    ['', '1'],
    ['width="3"', '3'],
    ['width="1.5"', '2'],
    ['width="0"', '1'],
    ['width="wide"', '1'],
  ])('spans the columns of its width: %s gives --ds-grid-span: %s', async (attribute, span) => {
    const { items } = await render(`<ds-grid cols="4"><ds-grid-item ${attribute}></ds-grid-item></ds-grid>`);

    expect(items[0].style.getPropertyValue('--ds-grid-span')).toBe(span);
  });

  it('follows its width property (ds-rsp sets it per breakpoint)', async () => {
    const { page, items } = await render('<ds-grid cols="4"><ds-grid-item></ds-grid-item></ds-grid>');

    items[0].width = 3;
    await page.waitForChanges();

    expect(items[0].style.getPropertyValue('--ds-grid-span')).toBe('3');
    expect(items[0]).toEqualAttribute('width', '3');
  });

  it('with a ratio, is as high as that ratio of its width: --ds-grid-item-ratio and --with-ratio, no padding', async () => {
    const { page, items } = await render(
      '<ds-grid><ds-grid-item ratio="0.5625"></ds-grid-item><ds-grid-item ratio="1"></ds-grid-item><ds-grid-item ratio="0"></ds-grid-item></ds-grid>',
    );

    expect(items.map(item => [item.style.getPropertyValue('--ds-grid-item-ratio'), item.classList.contains('--with-ratio')])).toEqual([
      ['0.5625', true],
      ['1', true],
      ['', false],
    ]);
    expect(items.map(item => item.style.getPropertyValue('padding-block-start'))).toEqual(['', '', '']);

    items[2].setAttribute('ratio', '2');
    await page.waitForChanges();
    expect(items[2]).toHaveClass('--with-ratio');
    expect(items[2].style.getPropertyValue('--ds-grid-item-ratio')).toBe('2');
  });

  it('keeps the deprecated setStyles(): it writes the given inline styles', async () => {
    const { items } = await render('<ds-grid><ds-grid-item width="2"></ds-grid-item></ds-grid>');

    await items[0].setStyles({ width: '50%', paddingInlineStart: '4px' });

    expect(items[0].style.width).toBe('50%');
    expect(items[0].style.paddingInlineStart).toBe('4px');
    expect(items[0].style.getPropertyValue('--ds-grid-span')).toBe('2');
  });
});
