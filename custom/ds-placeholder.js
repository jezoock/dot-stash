import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const placeholderCss = "";

const DSPlaceholder = /*@__PURE__*/ proxyCustomElement(class DSPlaceholder extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.dsMods = [];
  }
  dsmodsChangeHandler(newMods) {
    this.CSSClassList = _ds.props.toClassList("ds-button", newMods);
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-button", this.dsMods);
  }
  render() {
    return (h("div", { class: this.CSSClassList }, h("slot", null)));
  }
  static get watchers() { return {
    "dsMods": ["dsmodsChangeHandler"]
  }; }
  static get style() { return placeholderCss; }
}, [4, "ds-placeholder", {
    "dsMods": [1, "ds-mods"]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-placeholder"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-placeholder":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSPlaceholder);
      }
      break;
  } });
}

const DsPlaceholder = DSPlaceholder;
const defineCustomElement = defineCustomElement$1;

export { DsPlaceholder, defineCustomElement };

//# sourceMappingURL=ds-placeholder.js.map