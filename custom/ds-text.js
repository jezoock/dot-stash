import { proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const DSText = /*@__PURE__*/ proxyCustomElement(class DSText extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.mods = "default";
    this.type = "p";
    this.italic = undefined;
    this.bold = undefined;
    this.highlight = undefined;
    this.size = undefined;
    this.color = undefined;
  }
  modsChangeHandler(newMods) {
    this.CSSClassList = _ds.props.toClassList("ds-text", newMods);
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-text", this.mods);
  }
  render() {
    return (h(Host, { class: Object.assign({}, this.CSSClassList) }, h("slot", null)));
  }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
}, [4, "ds-text", {
    "mods": [1],
    "type": [1],
    "italic": [4],
    "bold": [4],
    "highlight": [4],
    "size": [8],
    "color": [1]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-text"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-text":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSText);
      }
      break;
  } });
}

const DsText = DSText;
const defineCustomElement = defineCustomElement$1;

export { DsText, defineCustomElement };

//# sourceMappingURL=ds-text.js.map