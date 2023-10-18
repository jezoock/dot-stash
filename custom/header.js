import { proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';
import { d as defineCustomElement$1 } from './title.js';

const headerCss = ".ds-header{display:flex;justify-content:space-between;align-items:center}.ds-header__before:not(:has([slot=before])){display:none}.ds-header__content{flex-grow:1}.ds-header__after:not(:has([slot=after])){display:none}";

const DSTitle = /*@__PURE__*/ proxyCustomElement(class DSTitle extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.titleProps = {};
    this.mods = [];
  }
  modsChangeHandler(mods) {
    this.CSSClassList = _ds.props.toClassList("ds-header", _ds.props.toArray(mods));
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-header", _ds.props.toArray(this.mods));
    const parentSlot = this.container.slot;
    if (parentSlot) {
      const [context] = parentSlot.split('-');
      if (context) {
        this.titleProps[context] = true;
      }
    }
  }
  render() {
    return (h(Host, { class: Object.assign({}, this.CSSClassList) }, h("div", { class: "ds-header__before" }, h("slot", { name: "before" })), h("div", { class: "ds-header__content" }, h("hlgroup", null, h("ds-title", Object.assign({}, this.titleProps), h("slot", { name: "title" })), h("slot", { name: "sub-title" })), h("slot", null)), h("div", { class: "ds-header__after" }, h("slot", { name: "after" }))));
  }
  get container() { return this; }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
  static get style() { return headerCss; }
}, [4, "ds-header", {
    "mods": [513]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-header", "ds-title"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-header":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSTitle);
      }
      break;
    case "ds-title":
      if (!customElements.get(tagName)) {
        defineCustomElement$1();
      }
      break;
  } });
}

export { DSTitle as D, defineCustomElement as d };

//# sourceMappingURL=header.js.map