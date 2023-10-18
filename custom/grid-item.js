import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const gridItemCss = "ds-grid-item{display:inline-block;box-sizing:border-box;position:relative;flex-shrink:0;flex:0 0 auto}.ds-grid-item.--with-ratio{padding:100% 0 0 0;position:relative}.ds-grid-item.--with-ratio .ds-grid-item__content{position:absolute;top:0;left:0;right:0;bottom:0}";

const DSGridItem = /*@__PURE__*/ proxyCustomElement(class DSGridItem extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.useRatio = false;
    this.ratioFromProps = undefined;
    this.width = 1;
  }
  ratioPropsWatcher(ratio) {
    this.useRatio = true;
    this.ratio = _ds.props.toNumber(ratio);
  }
  async getWidth() {
    return this.width;
  }
  async setStyles(styles) {
    for (const prop in styles) {
      this.container.style[prop] = styles[prop];
    }
  }
  componentWillLoad() {
    if (this.ratioFromProps) {
      const ratio = _ds.props.toNumber(this.ratioFromProps);
      if (ratio > 0) {
        this.useRatio = true;
        this.ratio = ratio * 100;
      }
    }
  }
  componentDidLoad() {
    if (this.useRatio) {
      const paddingBlockStart = `${this.ratio}% 0 0 0`;
      this.container.style.paddingBlockStart = paddingBlockStart;
    }
  }
  render() {
    return (h("div", { class: {
        'ds-grid-item': true,
        '--with-ratio': this.useRatio,
      } }, h("div", { class: "ds-grid-item__content" }, h("slot", null))));
  }
  get container() { return this; }
  static get watchers() { return {
    "ratioFromProps": ["ratioPropsWatcher"]
  }; }
  static get style() { return gridItemCss; }
}, [4, "ds-grid-item", {
    "ratioFromProps": [520, "ratio"],
    "width": [2],
    "getWidth": [64],
    "setStyles": [64]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-grid-item"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-grid-item":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSGridItem);
      }
      break;
  } });
}

export { DSGridItem as D, defineCustomElement as d };

//# sourceMappingURL=grid-item.js.map