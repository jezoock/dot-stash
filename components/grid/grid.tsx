import { Component, Element, Prop, Watch, h } from '@stencil/core/internal';
import _ds from '../dot-stash';

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
  cellRatio: number;
}

@Component({
  tag: 'ds-grid',
  styleUrl: 'grid.scss',
})
export class DSGrid {
  CSSClassList: Record<string, boolean>;
  options: DSGridParams;
  
  @Element() container: HTMLDivElement;
  
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  @Prop() params: DSGridParams | string;

  @Watch('mods')
  modsWatcher(newMods: string | string[]) {
    this.CSSClassList = _ds.props.toClassList('ds-grid', newMods);
    this.processChildren();
  }

  @Watch('params')
  paramsWatcher(newParams: string | DSGridParams) {
    if (typeof newParams !== "undefined") {
      this.options = { ...this.options, ..._ds.props.fromJSON<string | DSGridParams>(newParams)};
      this.processChildren();
    }
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-grid', this.mods);
    this.options = _ds.props.fromJSON<string | DSGridParams>(this.params);
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