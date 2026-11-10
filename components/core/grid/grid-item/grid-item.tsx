import { Component, Element, h, Host, Prop, Method } from '@stencil/core';
import { DSGridItemStyles } from '../grid.types';
import { toRatio, toSpan } from '../grid.values';

/**
 * A cell of a `ds-grid`: it spans the number of columns of its `width` (`--ds-grid-span`, which the grid stylesheet reads),
 * and, with a `ratio`, it is as high as that ratio of its width (`--ds-grid-item-ratio`, `aspect-ratio`). The component
 * writes these custom properties on itself and computes no size: `width` can change per breakpoint with `ds-rsp`.
 *
 * @slot - The content of the cell.
 */
@Component({
  tag: 'ds-grid-item',
  styleUrl: 'grid-item.scss',
})
export class DSGridItem {
  @Element() container: HTMLDivElement;
  /** The height of the item as a ratio of its width (`0.5625`: 16:9), its content filling it. */
  @Prop({ reflect: true, attribute: 'ratio' }) ratioFromProps: number | string;
  /** The number of columns the item spans: a whole number (a fractional one is rounded), at most the `cols` of the grid. */
  @Prop({ reflect: true, mutable: true }) width = 1;

  @Method()
  async getWidth() {
    return this.width;
  }

  /**
   * Writes inline styles on the item.
   * @deprecated ds-grid no longer calls it: the grid lays its items out with CSS Grid, from the `width` of each item.
   * It still writes the given styles, which apply over the layout of the grid.
   */
  @Method()
  async setStyles(styles: DSGridItemStyles): Promise<void> {
    for (const prop in styles) {
      this.container.style[prop] = styles[prop];
    }
  }

  render() {
    const ratio = toRatio(this.ratioFromProps);
    const style: Record<string, string> = { '--ds-grid-span': String(toSpan(this.width)) };
    if (ratio !== undefined) {
      style['--ds-grid-item-ratio'] = String(ratio);
    }

    return (
      <Host
        class={{
          'ds-grid-item': true,
          '--with-ratio': ratio !== undefined,
        }}
        style={style}
      >
        <div class="ds-grid-item__content">
          <slot />
        </div>
      </Host>
    );
  }
}
