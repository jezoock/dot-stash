import { Component, Element, Prop, Watch, h, Listen } from '@stencil/core';
import { toClassList, toNumber } from '../../utils/props';
import CssClassList from '../../utils/interfaces/css-class-list';
import { DSGridAlignment, DSGridItemStyles, DSGridParams, DSGridType } from './grid.types';

@Component({
  tag: 'ds-grid',
  styleUrl: 'grid.scss',
})
export class DSGrid {
  CSSClassList: CssClassList;
  options: DSGridParams;

  @Element() container: HTMLDivElement;

  @Prop({ reflect: true }) dataUseRsp = true;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) type: string | DSGridType = 'fixed';
  @Prop({ mutable: true, reflect: true }) cols: string | number = 1;
  @Prop({ mutable: true, reflect: true }) hGap = '0';
  @Prop({ mutable: true, reflect: true }) vGap = '0';
  @Prop({ mutable: true, reflect: true }) align: string | DSGridAlignment = 'start';
  @Prop({ mutable: true, reflect: true }) vAlign: string | DSGridAlignment = 'start';
  @Prop({ mutable: true, reflect: true }) cellRatio: string | number;

  @Listen('breakpointChange')
  onBreakpointChange() {
    this.processChildren();
  }

  @Watch('mods')
  modsChangeHandler(newMods: string | string[]) {
    this.CSSClassList = toClassList('ds-grid', newMods);
    this.processChildren();
  }

  @Watch('type')
  typeWatcher(type: DSGridType) {
    this.options = { ...this.options, type };
    this.processChildren();
  }

  @Watch('cols')
  colsWatcher(cols: string | number) {
    this.options = { ...this.options, cols: toNumber(cols) };
    this.processChildren();
  }

  @Watch('hGap')
  hGapWatcher(hGap: string) {
    this.options = { ...this.options, hGap };
    this.processChildren();
  }

  @Watch('vGap')
  vGapWatcher(vGap: string) {
    this.options = { ...this.options, vGap };
    this.processChildren();
  }

  @Watch('align')
  alignWatcher(align: DSGridAlignment) {
    this.options = { ...this.options, align };
    this.processChildren();
  }

  @Watch('vAlign')
  vAlignWatcher(vAlign: DSGridAlignment) {
    this.options = { ...this.options, vAlign };
    this.processChildren();
  }

  @Watch('cellRatio')
  cellRatioWatcher(cellRatio: string | number) {
    this.options = { ...this.options, cellRatio: toNumber(cellRatio) };
    this.processChildren();
  }

  componentWillLoad() {
    this.CSSClassList = toClassList('ds-grid', this.mods);
    const { type: typeFromProps, hGap, vGap, align: alignFromProps, vAlign: vAlignFromProps, cols: colsFromProps } = this;
    const cols = toNumber(colsFromProps);
    const type = typeFromProps as DSGridType;
    const align = alignFromProps as DSGridAlignment;
    const vAlign = vAlignFromProps as DSGridAlignment;
    const options: DSGridParams = { type, hGap, vGap, align, vAlign, cols };
    if (this.cellRatio) {
      options.cellRatio = toNumber(this.cellRatio);
    }
    this.options = options;
  }

  componentDidLoad() {
    this.processChildren();
  }

  async processChildren(): Promise<void> {
    const children = Array.from(this.container.querySelectorAll('ds-grid-item'));
    let offset = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const styles = await this.processCols(offset, child);
      offset = offset + child.width;
      await child.setStyles(styles);
    }
  }

  async processCols(index: number, gridItem: HTMLDsGridItemElement): Promise<DSGridItemStyles> {
    const { type, hGap, vGap, cols } = this.options;
    const styles: DSGridItemStyles = {};
    const colWidth = gridItem.width;

    if (type === 'fixed') {
      styles.width = `${((100 * colWidth) / cols).toFixed(4)}%`;

      if (hGap) {
        styles.paddingInlineStart = `calc((${hGap} / ${cols}) * ${index % cols})`;
        styles.paddingInlineEnd = `calc((${hGap} / ${cols}) * ${cols - (((index + colWidth - 1) % cols) + 1)})`;
      }

      if (vGap) {
        styles.paddingBlockEnd = `calc(${vGap})`;
      }
    } else if (type === 'fluid') {
      const width = `100% / ${cols / gridItem.width}`;

      // A unitless or zero gap ('0', the default) would make the calc() invalid: no gap then.
      if (hGap && parseFloat(hGap) !== 0) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.columnGap = `${hGap}`;

        styles.width = `calc(${width} - calc((${cols - 1} * ${hGap}) / ${cols}))`;
      } else {
        styles.width = `calc(${width})`;
      }
    }

    return styles;
  }

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          [`--${this.options.type}`]: true,
          [`--align-${this.options.align}`]: true,
          [`--v-align-${this.options.vAlign}`]: true,
        }}
      >
        <div class="ds-grid__row">
          <slot />
        </div>
      </div>
    );
  }
}
