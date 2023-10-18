import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { d as defineCustomElement$2 } from './toggler-item.js';

const togglerCss = ".ds-toggler ds-toggler-item .ds-toggler-item{margin:5px 15px;border-bottom:1px solid color(gray, light)}.ds-toggler ds-toggler-item:last-child .ds-toggler-item{border-bottom:none}.ds-toggler.--product .ds-toggler-item{margin:0 0 0.25rem 0;padding:0;border-bottom:none}.ds-toggler.--product .ds-toggler-item__title{padding:0;height:2.5rem;line-height:2.5rem;margin:0}.ds-toggler.--product .ds-toggler-item__title h1,.ds-toggler.--product .ds-toggler-item__title h2,.ds-toggler.--product .ds-toggler-item__title h3,.ds-toggler.--product .ds-toggler-item__title h4,.ds-toggler.--product .ds-toggler-item__title h5,.ds-toggler.--product .ds-toggler-item__title h6{color:color(gray, darker);line-height:inherit;font-size:1rem;margin:0}.ds-toggler.--product .ds-toggler-item__title:after{color:color(color-1, base);font-size:2rem;width:2rem;text-align:center}.ds-toggler.--product .ds-toggler-item__content{color:ds-color(gray, dark)}.ds-toggler.--product .ds-toggler-item--active .ds-toggler-item__content{margin-bottom:0}.ds-toggler.--product .ds-toggler-item--active .ds-toggler-item__title:after{}";

const DSToggler = /*@__PURE__*/ proxyCustomElement(class DSToggler extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.items = [];
    this.isActive = true;
    this.togglerMods = "";
  }
  componentDidLoad() {
    if (!this.isActive) {
      const items = this.container.querySelectorAll("ds-toggler-item");
      const contents = this.container.querySelectorAll(".ds-toggler-item__content");
      if ((items === null || items === void 0 ? void 0 : items.length) > 0) {
        items.forEach((item, index) => {
          item.expanded = true;
          if (contents[index]) {
            contents[index].style.height = "auto";
          }
        });
      }
    }
  }
  render() {
    var _a;
    return (h("div", { class: {
        "ds-toggler": true,
        [`--${this.togglerMods}`]: this.togglerMods && this.togglerMods !== ''
      } }, ((_a = this.items) === null || _a === void 0 ? void 0 : _a.length) > 0 && (this.items.map(item => {
      return (h("ds-toggler-item", { titleContent: item.title }, item.content));
    })), h("slot", null)));
  }
  get container() { return this; }
  static get style() { return togglerCss; }
}, [4, "ds-toggler", {
    "items": [1040],
    "isActive": [516, "active"],
    "togglerMods": [513, "toggler-mods"]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-toggler", "ds-toggler-item"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-toggler":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSToggler);
      }
      break;
    case "ds-toggler-item":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
  } });
}

const DsToggler = DSToggler;
const defineCustomElement = defineCustomElement$1;

export { DsToggler, defineCustomElement };

//# sourceMappingURL=ds-toggler.js.map