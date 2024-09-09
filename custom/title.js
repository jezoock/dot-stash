import { proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const titleCss = ".ds-title.--default{font-size:inherit}.ds-title.--main{font-size:40px}";

const DSTitle = /*@__PURE__*/ proxyCustomElement(class DSTitle extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.mods = [];
    this.page = undefined;
    this.section = undefined;
    this.block = undefined;
    this.sub = undefined;
  }
  modsChangeHandler(mods) {
    this.CSSClassList = _ds.props.toClassList("ds-title", _ds.props.toArray(mods));
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-title", _ds.props.toArray(this.mods));
  }
  render() {
    return (h(Host, { class: this.CSSClassList }, h("slot", null)));
  }
  get container() { return this; }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
  static get style() { return titleCss; }
}, [4, "ds-title", {
    "mods": [513],
    "page": [1540],
    "section": [1540],
    "block": [1540],
    "sub": [1540]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-title"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-title":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSTitle);
      }
      break;
  } });
}

export { DSTitle as D, defineCustomElement as d };

//# sourceMappingURL=title.js.map