import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const gridCss = ".ds-grid__row{display:flex;flex-wrap:wrap}.ds-grid.--align-start .ds-grid__row{justify-content:flex-start}.ds-grid.--align-center .ds-grid__row{justify-content:center}.ds-grid.--align-end .ds-grid__row{justify-content:flex-end}.ds-grid.--v-align-start .ds-grid__row{align-items:flex-start}.ds-grid.--v-align-center .ds-grid__row{align-items:center}.ds-grid.--v-align-end .ds-grid__row{align-items:flex-end}";

const DSGrid = /*@__PURE__*/ proxyCustomElement(class DSGrid extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.params = undefined;
    this.mods = [];
    this.type = 'fixed';
    this.cols = 1;
    this.hGap = '0';
    this.vGap = '0';
    this.align = "start";
    this.vAlign = "start";
    this.cellRatio = undefined;
  }
  modsChangeHandler(newMods) {
    this.CSSClassList = _ds.props.toClassList('ds-grid', newMods);
    this.processChildren();
  }
  typeWatcher(type) {
    this.options = Object.assign(Object.assign({}, this.options), { type });
    this.processChildren();
  }
  colsWatcher(cols) {
    this.options = Object.assign(Object.assign({}, this.options), { cols: _ds.props.toNumber(cols) });
    this.processChildren();
  }
  hGapWatcher(hGap) {
    this.options = Object.assign(Object.assign({}, this.options), { hGap });
    this.processChildren();
  }
  vGapWatcher(vGap) {
    this.options = Object.assign(Object.assign({}, this.options), { vGap });
    this.processChildren();
  }
  alignWatcher(align) {
    this.options = Object.assign(Object.assign({}, this.options), { align });
    this.processChildren();
  }
  vAlignWatcher(vAlign) {
    this.options = Object.assign(Object.assign({}, this.options), { vAlign });
    this.processChildren();
  }
  cellRatioWatcher(cellRatio) {
    this.options = Object.assign(Object.assign({}, this.options), { cellRatio: _ds.props.toNumber(cellRatio) });
    this.processChildren();
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-grid', this.mods);
    const { type: typeFromProps, hGap, vGap, align: alignFromProps, vAlign: vAlignFromProps, cols: colsFromProps } = this;
    const cols = _ds.props.toNumber(colsFromProps);
    const type = typeFromProps;
    const align = alignFromProps;
    const vAlign = vAlignFromProps;
    const options = { type, hGap, vGap, align, vAlign, cols };
    if (this.cellRatio) {
      options.cellRatio = _ds.props.toNumber(this.cellRatio);
    }
    this.options = options;
  }
  componentDidLoad() {
    this.processChildren();
  }
  async processChildren() {
    const children = this.container.querySelectorAll('ds-grid-item');
    const rowCount = Math.ceil(children.length / this.options.cols);
    children.forEach(async (child, index) => {
      const styles = await this.processStyles(rowCount, index, child);
      await child.setStyles(styles);
    });
  }
  async processStyles(rowCount, index, gridItem) {
    const { type, hGap, vGap, cols } = this.options;
    const styles = {};
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
    }
    else if (type === 'fluid') {
      let gapWidth = '0';
      if (hGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row');
        rowContainer.style.columnGap = `${hGap}`;
        gapWidth = `calc((${cols - 1} * ${hGap}) / ${cols})`;
      }
      /* if (vGap) {
        const rowContainer = this.container.querySelector('.ds-grid__row') as HTMLDivElement;
        rowContainer.style.rowGap = `${vGap}`;
      } */
      styles.width = `calc(100% / ${cols / gridItem.width} - ${gapWidth}`;
      /* if (cellRatio) {
        paddingBlockStart = `${(cellRatio * colWidth).toFixed(4)}%`;
      } */
    }
    return styles;
  }
  render() {
    return (h("div", { class: Object.assign(Object.assign({}, this.CSSClassList), { [`--${this.options.type}`]: true, [`--align-${this.options.align}`]: true, [`--v-align-${this.options.vAlign}`]: true }) }, h("div", { class: "ds-grid__row" }, h("slot", null))));
  }
  get container() { return this; }
  static get watchers() { return {
    "mods": ["modsChangeHandler"],
    "type": ["typeWatcher"],
    "cols": ["colsWatcher"],
    "hGap": ["hGapWatcher"],
    "vGap": ["vGapWatcher"],
    "align": ["alignWatcher"],
    "vAlign": ["vAlignWatcher"],
    "cellRatio": ["cellRatioWatcher"]
  }; }
  static get style() { return gridCss; }
}, [4, "ds-grid", {
    "params": [1],
    "mods": [1537],
    "type": [1537],
    "cols": [1544],
    "hGap": [1537, "h-gap"],
    "vGap": [1537, "v-gap"],
    "align": [1537],
    "vAlign": [1537, "v-align"],
    "cellRatio": [1544, "cell-ratio"]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-grid"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-grid":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSGrid);
      }
      break;
  } });
}

export { DSGrid as D, defineCustomElement as d };

//# sourceMappingURL=grid.js.map