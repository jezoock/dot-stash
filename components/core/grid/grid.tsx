import { Component, Element, Prop, h } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { DSGridAlignment, DSGridType } from './grid.types';
import { toColumnCount, toGap, toRatio } from './grid.values';

/**
 * A grid of columns: its children, `ds-grid-item` elements, are laid out in `cols` columns by CSS Grid, each one spanning
 * the number of columns of its `width`. The props set custom properties on the `.ds-grid` element (`--ds-grid-cols`,
 * `--ds-grid-h-gap`, `--ds-grid-v-gap`, `--ds-grid-cell-ratio`) and classes, which the component stylesheet reads: the
 * component computes no size. They can change per breakpoint with `ds-rsp` (`data-rsp`, the grid is a subscriber).
 *
 * @slot - The items: `ds-grid-item` elements (any child takes a cell, one column unless it sets `--ds-grid-span`).
 */
@Component({
  tag: 'ds-grid',
  styleUrl: 'grid.scss',
})
export class DSGrid {
  @Element() container: HTMLDivElement;

  /** A subscriber of `ds-rsp`: its `data-rsp` attribute can change its props per breakpoint. */
  @Prop({ reflect: true }) dataUseRsp = true;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /** `fixed`: `v-gap` separates the rows, and is kept below the last one; `fluid`: the rows have no gap (`v-gap` is not used). */
  @Prop({ mutable: true, reflect: true }) type: string | DSGridType = 'fixed';
  /** The number of columns (a whole number). */
  @Prop({ mutable: true, reflect: true }) cols: string | number = 1;
  /** The space between the columns: a CSS length (`20px`, `1rem`, `5%`); a unitless number is in px. */
  @Prop({ mutable: true, reflect: true }) hGap = '0';
  /** The space between the rows of a `fixed` grid, and below its last row: a CSS length; a unitless number is in px. */
  @Prop({ mutable: true, reflect: true }) vGap = '0';
  /** Where the items of a row that does not fill the grid go: `start`, `center` or `end`. */
  @Prop({ mutable: true, reflect: true }) align: string | DSGridAlignment = 'start';
  /** The alignment of the items in the height of their row: `start`, `center` or `end`. */
  @Prop({ mutable: true, reflect: true }) vAlign: string | DSGridAlignment = 'start';
  /** The height of the items as a ratio of their width (`0.75`: 4:3), their content filling it; an item's own `ratio` wins. */
  @Prop({ mutable: true, reflect: true }) cellRatio: string | number;

  render() {
    const cellRatio = toRatio(this.cellRatio);
    const style: Record<string, string> = {
      '--ds-grid-cols': String(toColumnCount(this.cols)),
      '--ds-grid-h-gap': toGap(this.hGap),
      '--ds-grid-v-gap': toGap(this.vGap),
    };
    if (cellRatio !== undefined) {
      style['--ds-grid-cell-ratio'] = String(cellRatio);
    }

    return (
      <div
        class={{
          ...toClassList('ds-grid', this.mods),
          [`--${this.type}`]: true,
          [`--align-${this.align}`]: true,
          [`--v-align-${this.vAlign}`]: true,
          '--with-cell-ratio': cellRatio !== undefined,
        }}
        style={style}
      >
        <div class="ds-grid__row">
          <slot />
        </div>
      </div>
    );
  }
}
