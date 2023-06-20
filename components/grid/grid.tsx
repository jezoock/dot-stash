import { Component, Element, Prop, Watch, h } from '@stencil/core/internal';
import _ds from '../../typescript/dot-stash';

export type DSGridAlignment = 'start' | 'center' | 'end';
export type DSGridType = 'fixed' | 'fluid';

export interface DSGridItemStyles {
  width?: string;
  paddingBlockStart?: string;
  paddingInlineEnd?: string;
  paddingBlockEnd?: string;
  paddingInlineStart?: string;
}

export interface DSGridParams {
  type: DSGridType;
  cols: number;
  hGap: string;
  vGap: string;
  align: DSGridAlignment;
  vAlign: DSGridAlignment;
  cellRatio?: number;
}

@Component({
  tag: 'ds-grid',
  styleUrl: 'grid.scss',
})
export class DSGrid {
  CSSClassList: Record<string, boolean>;
  options: DSGridParams;
  
  @Element() container: HTMLDivElement;
  
  @Prop() params: DSGridParams;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) type: DSGridType = 'fixed';
  @Prop({ mutable: true, reflect: true }) cols = 1;
  @Prop({ mutable: true, reflect: true }) hGap = '0';
  @Prop({ mutable: true, reflect: true }) vGap = '0';
  @Prop({ mutable: true, reflect: true }) align: DSGridAlignment = "start";
  @Prop({ mutable: true, reflect: true }) vAlign: DSGridAlignment = "start";
  @Prop({ mutable: true, reflect: true }) cellRatio: number;


  @Watch('mods')
  modsWatcher(newMods: string | string[]) {
    this.CSSClassList = _ds.props.toClassList('ds-grid', newMods);
    this.processChildren();
  }

  @Watch('type')
  typeWatcher(type: DSGridType) {
    this.options = { ...this.options, type};
    this.processChildren();
  }

  @Watch('cols')
  colsWatcher(cols: number) {
    this.options = { ...this.options, cols: _ds.props.toNumber(cols) };
    this.processChildren();
  }

  @Watch('hGap')
  hGapWatcher(hGap: string) {
    this.options = { ...this.options, hGap};
    this.processChildren();
  }

  @Watch('vGap')
  vGapWatcher(vGap: string) {
    this.options = { ...this.options, vGap};
    this.processChildren();
  }
  
  @Watch('align')
  alignWatcher(align: DSGridAlignment) {
    this.options = { ...this.options, align};
    this.processChildren();
  }
  
  @Watch('vAlign')
  vAlignWatcher(vAlign: DSGridAlignment) {
    this.options = { ...this.options, vAlign};
    this.processChildren();
  }

  @Watch('cellRatio')
  cellRatioWatcher(cellRatio: number) {
    this.options = { ...this.options, cellRatio: _ds.props.toNumber(cellRatio)};
    this.processChildren();
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-grid', this.mods);
    const { type, hGap, vGap, align, vAlign } = this;
    const cols = _ds.props.toNumber(this.cols);
    const options: DSGridParams = { type, hGap, vGap, align, vAlign, cols };
    if (this.cellRatio) {
      options.cellRatio = _ds.props.toNumber(this.cellRatio);
    }
    this.options = options;
  }

  componentDidLoad() {
    this.processChildren();
  }

  async processChildren(): Promise<void> {
    const children = this.container.querySelectorAll('ds-grid-item');
    const rowCount = Math.ceil(children.length/this.options.cols);
    children.forEach( async (child, index) => {
      const styles = await this.processStyles(rowCount, index);
      await child.setStyles( styles );
    });
  }

  async processStyles(rowCount: number, index: number): Promise<DSGridItemStyles> {
    const { type, hGap, vGap, cols } = this.options;
    const styles: DSGridItemStyles = {};

    if (type === 'fixed') {
      styles.width = `${(100 / cols).toFixed(4)}%`;

      if (hGap) {
        styles.paddingInlineStart = `calc((${hGap} / ${cols}) * ${index % cols})`;
        styles.paddingInlineEnd = `calc((${hGap} / ${cols}) * ${cols - ((index % cols) + 1)})`;
      }

      if (vGap) {
        const itemRow = Math.floor(index / cols);
        styles.paddingBlockStart = `calc((${vGap} / ${rowCount}) * ${itemRow % rowCount})`;
        styles.paddingBlockEnd = `calc((${vGap} / ${rowCount}) * ${rowCount - ((itemRow % rowCount) + 1)})`;
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

      styles.width = `calc(100% / ${cols} - ${gapWidth}`;

      /* if (cellRatio) {
        paddingBlockStart = `${(cellRatio * colWidth).toFixed(4)}%`;
      } */
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