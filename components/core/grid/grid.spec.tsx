import { newSpecPage } from '@stencil/core/testing';
import { DSGrid } from './grid';
import { DSGridItem } from './grid-item/grid-item';

const isBalanced = (value: string) => value.split('(').length === value.split(')').length;

describe('ds-grid', () => {
  const render = async (html: string) => {
    const page = await newSpecPage({ components: [DSGrid, DSGridItem], html });
    await page.waitForChanges();
    return { page, items: Array.from(page.body.querySelectorAll('ds-grid-item')) };
  };

  it('gives fluid items a valid calc() width, minus their share of the gap', async () => {
    const { page, items } = await render('<ds-grid type="fluid" cols="4" h-gap="10px"><ds-grid-item></ds-grid-item><ds-grid-item width="2"></ds-grid-item></ds-grid>');

    expect(items.map(item => item.style.width)).toEqual(['calc(100% / 4 - calc((3 * 10px) / 4))', 'calc(100% / 2 - calc((3 * 10px) / 4))']);
    items.forEach(item => expect(isBalanced(item.style.width)).toBe(true));
    expect(page.root.querySelector<HTMLElement>('.ds-grid__row').style.columnGap).toBe('10px');
  });

  it('gives fluid items a valid calc() width without gap', async () => {
    const { items } = await render('<ds-grid type="fluid" cols="3"><ds-grid-item></ds-grid-item></ds-grid>');

    expect(items[0].style.width).toBe('calc(100% / 3)');
  });

  it('keeps the fixed widths and paddings', async () => {
    const { items } = await render('<ds-grid cols="2" h-gap="20px" v-gap="1rem"><ds-grid-item></ds-grid-item><ds-grid-item></ds-grid-item></ds-grid>');

    expect(items.map(item => item.style.width)).toEqual(['50.0000%', '50.0000%']);
    expect(items[0].style.paddingInlineEnd).toBe('calc((20px / 2) * 1)');
    expect(items[1].style.paddingInlineStart).toBe('calc((20px / 2) * 1)');
    expect(items[0].style.paddingBlockEnd).toBe('calc(1rem)');
  });
});
