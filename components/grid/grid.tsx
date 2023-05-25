import { Component, Element, Prop, Watch, h } from '@stencil/core/internal';
import _ds from '../dot-stash';

export type DSGridAlignment = 'start' | 'center' | 'end';
export type DSGridType = 'fixed' | 'fluid';

export interface DSGridParams {
  type: DSGridType;
  cols: number;
  hGap: string;
  vGap: string;
  align: DSGridAlignment;
  vAlign: DSGridAlignment;
  cellRatio: number;
}

@Component({
  tag: 'ds-grid',
  styleUrl: 'grid.scss',
})
export class DSGrid {
  @Element() container: HTMLDivElement;

  CSSClassList: Record<string, boolean>;
  params: DSGridParams;

  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) cols: string | number = 1;
  @Prop({ mutable: true, reflect: true }) hGap = '0';
  @Prop({ mutable: true, reflect: true }) vGap = '0';
  @Prop({ mutable: true, reflect: true }) align: DSGridAlignment;
  @Prop({ mutable: true, reflect: true }) vAlign: DSGridAlignment;
  @Prop({ mutable: true, reflect: true }) type: DSGridType;
  @Prop({ mutable: true, reflect: true }) cellRatio: string | number = 1;

  @Watch('mods')
  modsWatcher(newMods: string | string[]) {
    this.CSSClassList = _ds.props.toClassList('ds-grid', newMods);
    this.processChildren();
  }

  @Watch('cols')
  colsWatcher(newCols: string | number) {
    const cols = _ds.props.toNumber(newCols);
    this.params = {
      ...this.params,
      cols
    }
    this.processChildren();
  }

  @Watch('hGap')
  hGapWatcher(hGap: string) {
    this.params = {
      ...this.params,
      hGap
    }
    this.processChildren();
  }

  @Watch('vGap')
  vGapWatcher(vGap: string) {
    this.params = {
      ...this.params,
      vGap
    }
    this.processChildren();
  }

  @Watch('align')
  alignWatcher(align: DSGridAlignment) {
    this.params = {
      ...this.params,
      align
    }
    this.processChildren();
  }

  @Watch('vAlign')
  vAlignWatcher(vAlign: DSGridAlignment) {
    this.params = {
      ...this.params,
      vAlign
    }
    this.processChildren();
  }

  @Watch('type')
  typeWatcher() {
    this.processChildren();
  }

  @Watch('cellRatio')
  cellRatioWatcher(newRatio: string | number) {
    const cellRatio = _ds.props.toFloat(newRatio);
    this.params = {
      ...this.params,
      cellRatio
    }
    this.processChildren();
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-grid', this.mods);
    const cols = _ds.props.toNumber(this.cols);
    const cellRatio = _ds.props.toFloat(this.cellRatio);
    this.params = {
      align: this.align,
      cellRatio,
      cols,
      hGap: this.hGap,
      type: this.type,
      vAlign: this.vAlign,
      vGap: this.vGap,
    }
  }

  componentDidLoad() {
    this.processChildren();
  }

  processChildren() {
    const children = this.container.querySelectorAll('ds-grid-item');
    children.forEach((child, index) => this.processStyles(child, Math.ceil(children.length/this.params.cols), index));
  }

  processStyles(element: HTMLDsGridItemElement, rowCount: number, index: number) {
    const { type, hGap, vGap, cols } = this.params;

    let width = `100%`;
    let paddingInlineStart = '0';
    let paddingInlineEnd = '0';
    let paddingBlockStart = '0';
    let paddingBlockEnd = '0';

    if (type === 'fixed') {
      width = `${(100 / cols).toFixed(4)}%`;

      if (hGap) {
        paddingInlineStart = `calc((${hGap} / ${cols}) * ${index % cols})`;
        paddingInlineEnd = `calc((${hGap} / ${cols}) * ${cols - ((index % cols) + 1)})`;
      }

      if (vGap) {
        const itemRow = Math.floor(index / cols);
        paddingBlockStart = `calc((${vGap} / ${rowCount}) * ${itemRow % rowCount})`;
        paddingBlockEnd = `calc((${vGap} / ${rowCount}) * ${rowCount - ((itemRow % rowCount) + 1)})`;
      }
      
    } else if (type === 'fluid') {
      let gapWidth = '0';

      if (hGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.columnGap = `${hGap}`;

        gapWidth = `calc((${cols - 1} * ${hGap}) / ${cols})`;
      }

      if (vGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.rowGap = `${vGap}`;
      }

      width = `calc(100% / ${cols} - ${gapWidth}`;

      /* if (cellRatio) {
        paddingBlockStart = `${(cellRatio * colWidth).toFixed(4)}%`;
      } */
    }
    element.setStyles( width, paddingBlockStart, paddingInlineEnd, paddingBlockEnd, paddingInlineStart);
  }

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          [`--${this.params.type}`]: true,
        }}
      >
        <div class="ds-grid__row">
          <slot />
        </div>
      </div>
    );
  }
}