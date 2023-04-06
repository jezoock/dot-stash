import { Component, Element, h, Prop, Watch } from '@stencil/core';
import _ds from '../dot-stash';

export type DSGridAlignment = 'start' | 'center' | 'end';
export type DSGridType = 'fixed' | 'fluid';

export interface DSGridParams {
  type: DSGridType;
  cols: number;
  hGap: number;
  vGap: number;
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
  @Prop({ mutable: true, reflect: true }) hGap: string | number = 0;
  @Prop({ mutable: true, reflect: true }) vGap: string | number = 0;
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
  hGapWatcher(newGap: string | number) {
    const hGap = _ds.props.toNumber(newGap);
    this.params = {
      ...this.params,
      hGap
    }
    this.processChildren();
  }

  @Watch('vGap')
  vGapWatcher(newGap: string | number) {
    const vGap = _ds.props.toNumber(newGap);
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
    const hGap = _ds.props.toNumber(this.hGap);
    const vGap = _ds.props.toNumber(this.vGap);
    const cellRatio = _ds.props.toFloat(this.cellRatio);
    this.params = {
      align: this.align,
      cellRatio,
      cols,
      hGap,
      type: this.type,
      vAlign: this.vAlign,
      vGap,
    }
  }

  componentDidLoad() {
    this.processChildren();
  }

  processChildren() {
    const children = this.container.querySelectorAll('ds-grid-item');
    children.forEach((child, index) => this.processStyles(child, children.length, index));
  }

  processStyles(element: HTMLDsGridItemElement, rowCount: number, index: number) {
    const { type, hGap, vGap, cols, cellRatio } = this.params;

    if (type === 'fixed') {
      const width = `${(100 / cols).toFixed(6)}%`;
      element.style.width = width;

      if (hGap) {
        const paddingInlineStart = `${(hGap / cols) * (index % cols)}rem`;
        const paddingInlineEnd = `${(hGap / cols) * (cols - ((index % cols) + 1))}rem`;

        element.style.paddingInlineStart = paddingInlineStart;
        element.style.paddingInlineEnd = paddingInlineEnd;
      }

      if (vGap) {
        const itemRow = Math.floor(index / cols);
        const paddingBlockStart = `${(vGap / rowCount) * (itemRow % rowCount)}rem`;
        const paddingBlockEnd = `${(vGap / rowCount) * (rowCount - ((itemRow % rowCount) + 1))}rem`;

        element.style.paddingBlockStart = paddingBlockStart;
        element.style.paddingBlockEnd = paddingBlockEnd;
      }
    } else if (type === 'fluid') {
      let gap = 0;
      if (hGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.columnGap = `${this.hGap}rem`;

        const gapWidth = ((cols - 1) * hGap * 16) / cols;
        gap = (gapWidth / this.container.offsetWidth) * 100;
      }

      if (vGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.rowGap = `${vGap}rem`;
      }

      const width = 100 / cols - gap;
      element.style.width = `${width.toFixed(4)}%`;

      if (cellRatio) {
        element.style.paddingBlockStart = `${(cellRatio * width).toFixed(4)}%`;
      }
    }
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

/*


    if (this.cols === 2) {
      if (index % 3 === 0) {
        paddingEnd = `${(this.hGap/2)}rem`;
      }
      if (index % 3 === 1) {
        paddingStart = `${(this.hGap/2)}rem`;
      }
    }

    if (this.cols === 3) {
      if (index % 3 === 0) {
        paddingEnd = `${(this.hGap/3)*2}rem`;
      }
      if (index % 3 === 1) {
        paddingStart = `${this.hGap/3}rem`;
        paddingEnd = `${this.hGap/3}rem`;
      }
      if (index % 3 === 2) {
        paddingStart = `${(this.hGap/3)*2}rem`;
      }
    }

    if (this.cols === 4) {
      if (index % 4 === 0) {
        paddingEnd = `${(this.hGap/4)*3}rem`;
      }
      if (index % 4 === 1) {
        paddingStart = `${this.hGap/4}rem`;
        paddingEnd = `${this.hGap/4*2}rem`;
      }
      if (index % 4 === 2) {
        paddingStart = `${this.hGap/4*2}rem`;
        paddingEnd = `${this.hGap/4}rem`;
      }
      if (index % 4 === 3) {
        paddingStart = `${(this.hGap/4)*3}rem`;
      }
    }

    if (this.cols === 5) {
      if (index % 5 === 0) {
        paddingEnd = `${(this.hGap/5)*4}rem`;
      }
      if (index % 5 === 1) {
        paddingStart = `${this.hGap/5}rem`;
        paddingEnd = `${this.hGap/5*3}rem`;
      }
      if (index % 5 === 2) {
        paddingStart = `${this.hGap/5*2}rem`;
        paddingEnd = `${this.hGap/5*2}rem`;
      }
      if (index % 5 === 3) {
        paddingStart = `${this.hGap/5*3}rem`;
        paddingEnd = `${this.hGap/5}rem`;
      }
      if (index % 5 === 4) {
        paddingStart = `${(this.hGap/5)*4}rem`;
      }
    }

    if (this.cols === 6) {
      if (index % 6 === 0) {
        paddingEnd = `${(this.hGap/6)*5}rem`;

        // paddingStart = (this.hGap / this.cols)*(index % 6) // index = 0 || 6
        // paddingEnd = (this.hGap / this.cols)*(this.cols-((index % 6)+1))) // index = 0 || 6
      }
      if (index % 6 === 1) {
        paddingStart = `${this.hGap/6}rem`;
        paddingEnd = `${this.hGap/6*4}rem`;
      }
      if (index % 6 === 2) {
        paddingStart = `${this.hGap/6*2}rem`;
        paddingEnd = `${this.hGap/6*3}rem`;
      }
      if (index % 6 === 3) {
        paddingStart = `${this.hGap/6*3}rem`;
        paddingEnd = `${this.hGap/6*2}rem`;
      }
      if (index % 6 === 4) {
        paddingStart = `${this.hGap/6*4}rem`;
        paddingEnd = `${this.hGap/6}rem`;
      }
      if (index % 6 === 5) {
        paddingStart = `${(this.hGap/6)*5}rem`;
        // paddingEnd = (this.hGap / this.cols)*(this.cols-(index+1))
      }
    }*/
