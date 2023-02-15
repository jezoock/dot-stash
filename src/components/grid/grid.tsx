import { Component, Element, h, Prop, Watch } from '@stencil/core';
import _ds from '../../dot-stash';

export type DSGridAlignment = 'start' | 'center' | 'end';
export type DSGridType = 'fixed' | 'fluid';

@Component({
  tag: 'ds-grid',
  styleUrl: 'grid.scss',
})
export class DSGrid {
  @Element() container: HTMLDivElement;

  CSSClassList: Record<string, boolean>;
  cols: number;
  hGap: number;
  vGap: number;
  align: string;
  vAlign: string;
  cellRatio: number;

  @Prop({ mutable: true, reflect: true }) dsParams: Record<string, unknown> = {};
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) dsCols: string | number = 1;
  @Prop({ mutable: true, reflect: true }) dsHGap: string | number = 0;
  @Prop({ mutable: true, reflect: true }) dsVGap: string | number = 0;
  @Prop({ mutable: true, reflect: true }) dsAlign: DSGridAlignment;
  @Prop({ mutable: true, reflect: true }) dsVAlign: DSGridAlignment;
  @Prop({ mutable: true, reflect: true }) dsType: DSGridType;
  @Prop({ mutable: true, reflect: true }) dsCellRatio: string | number;

  @Watch('mods')
  modsWatcher(newMods: string | string[]) {
    this.CSSClassList = _ds.props.toClassList('ds-grid', newMods);
    this.processChildren();
  }

  @Watch('dsCols')
  colsWatcher(newCols: string | number) {
    this.cols = _ds.props.toNumber(newCols);
    this.processChildren();
  }

  @Watch('dsHGap')
  hGapWatcher(newGap: string | number) {
    this.hGap = _ds.props.toNumber(newGap);
    this.processChildren();
  }

  @Watch('dsVGap')
  vGapWatcher(newGap: string | number) {
    this.vGap = _ds.props.toNumber(newGap);
    this.processChildren();
  }

  @Watch('dsType')
  typeWatcher() {
    this.processChildren();
  }

  @Watch('dsCellRatio')
  cellRatioWatcher(newRatio: string | number) {
    this.cellRatio = _ds.props.toFloat(newRatio);
    this.processChildren();
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-grid', this.mods);
    this.cols = _ds.props.toNumber(this.dsCols);
    this.hGap = _ds.props.toNumber(this.dsHGap);
    this.vGap = _ds.props.toNumber(this.dsVGap);
    this.cellRatio = _ds.props.toNumber(this.dsCellRatio);
  }

  componentDidLoad() {
    this.processChildren();
  }

  processChildren() {
    const children = this.container.querySelectorAll('ds-grid-item');
    children.forEach((child, index) => this.processStyles(child, children.length, index));
  }

  processStyles(element: HTMLDsGridItemElement, rowCount: number, index: number) {
    if (this.dsType === 'fixed') {
      const width = `${(100 / this.cols).toFixed(6)}%`;
      element.style.width = width;

      if (this.dsHGap) {
        const paddingInlineStart = `${(this.hGap / this.cols) * (index % this.cols)}rem`;
        const paddingInlineEnd = `${(this.hGap / this.cols) * (this.cols - ((index % this.cols) + 1))}rem`;

        element.style.paddingInlineStart = paddingInlineStart;
        element.style.paddingInlineEnd = paddingInlineEnd;
      }

      if (this.dsVGap) {
        const itemRow = Math.floor(index / this.cols);
        const paddingBlockStart = `${(this.vGap / rowCount) * (itemRow % rowCount)}rem`;
        const paddingBlockEnd = `${(this.vGap / rowCount) * (rowCount - ((itemRow % rowCount) + 1))}rem`;

        element.style.paddingBlockStart = paddingBlockStart;
        element.style.paddingBlockEnd = paddingBlockEnd;
      }
    } else if (this.dsType === 'fluid') {
      let gap = 0;
      if (this.dsHGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.columnGap = `${this.hGap}rem`;

        const gapWidth = ((this.cols - 1) * this.hGap * 16) / this.cols;
        gap = (gapWidth / this.container.offsetWidth) * 100;
      }

      if (this.dsVGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.rowGap = `${this.vGap}rem`;
      }

      const width = 100 / this.cols - gap;
      element.style.width = `${width.toFixed(4)}%`;

      if (this.dsCellRatio) {
        element.style.paddingBlockStart = `${(this.cellRatio * width).toFixed(4)}%`;
      }
    }
  }

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          [`--${this.dsType}`]: true,
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
