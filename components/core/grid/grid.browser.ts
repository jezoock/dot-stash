import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { mount } from '../../../test/helpers/browser';

/** The boxes of the items of the first grid, relative to its row: [x, y, width, height], rounded. */
const boxes = () => {
  const row = document.querySelector('.ds-grid__row').getBoundingClientRect();
  return Array.from(document.querySelectorAll('ds-grid-item')).map(item => {
    const box = item.getBoundingClientRect();
    return [box.left - row.left, box.top - row.top, box.width, box.height].map(Math.round);
  });
};

/** `count` items, each 50 px high (its content), `width` columns wide for the first one. */
const items = (count: number, firstWidth = 1) =>
  Array.from({ length: count }, (_, index) => `<ds-grid-item width="${index ? 1 : firstWidth}"><div style="height: 50px"></div></ds-grid-item>`).join('');

describe('ds-grid in a browser: the boxes of its items (CSS Grid, the default theme)', () => {
  it('4 columns 20 px apart in 860 px: 200 px wide cells, and a fixed grid separates its rows by its v-gap', async () => {
    await mount(`<div style="width: 860px"><ds-grid cols="4" h-gap="20px" v-gap="10px">${items(6)}</ds-grid></div>`);

    expect(boxes()).toEqual([
      [0, 0, 200, 50],
      [220, 0, 200, 50],
      [440, 0, 200, 50],
      [660, 0, 200, 50],
      [0, 60, 200, 50],
      [220, 60, 200, 50],
    ]);
  });

  it('an item of several columns spans them and the gaps between them; a fluid grid has no vertical gap', async () => {
    await mount(`<div style="width: 860px"><ds-grid type="fluid" cols="4" h-gap="20px" v-gap="10px">${items(4, 2)}</ds-grid></div>`);

    expect(boxes()).toEqual([
      [0, 0, 420, 50],
      [440, 0, 200, 50],
      [660, 0, 200, 50],
      [0, 50, 200, 50],
    ]);
  });

  it('align="center" centers an incomplete row exactly; cell-ratio makes the items as high as that ratio of their width', async () => {
    await mount(`<div style="width: 860px"><ds-grid cols="4" h-gap="20px" align="center" cell-ratio="0.5">${items(3)}</ds-grid></div>`);

    // (860 - 3 × 200 - 2 × 20) / 2 = 110 px on each side.
    expect(boxes()).toEqual([
      [110, 0, 200, 100],
      [330, 0, 200, 100],
      [550, 0, 200, 100],
    ]);
  });

  it('with ds-rsp, its columns follow the breakpoint at once when the viewport crosses md', async () => {
    await page.viewport(900, 800);
    await mount(`<ds-rsp></ds-rsp><div style="width: 840px"><ds-grid cols="2" h-gap="40px" data-use-rsp data-rsp='{"md": {"cols": 4}}'>${items(4)}</ds-grid></div>`);
    await expect.poll(() => boxes()[1]).toEqual([440, 0, 400, 50]);

    await page.viewport(1000, 800);

    await expect.poll(() => boxes()[1]).toEqual([220, 0, 180, 50]);
    expect(boxes()[3]).toEqual([660, 0, 180, 50]);
  });
});
