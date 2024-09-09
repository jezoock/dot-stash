import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { t as translations } from './translations.js';

const shoppingBagListCss = ".ds-shopping-bag-list{overflow:hidden;}";

const DSShoppingBagList = /*@__PURE__*/ proxyCustomElement(class DSShoppingBagList extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.translations = translations[this.locale].gbx_shoppingBag;
    this.locale = 'en';
    this.shoppingBags = [];
    this.requestDisplayCreateForm = undefined;
    this.requestDisplayShoppingBag = undefined;
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }
  /**
   * Display selected shopping bag details
   * @param {string} shoppingBagId Id of the shopping to display content of
   */
  handleItemClick(shoppingBagId) {
    this.requestDisplayShoppingBag(shoppingBagId);
  }
  /**
   * Display shopping bag creation form
   */
  handleButtonClick() {
    this.requestDisplayCreateForm();
  }
  render() {
    return (h("div", { class: "ds-shopping-bag-list" }, h("div", { class: {
        "ds-shopping-bag-title": true,
        "--list": true
      } }, h("strong", null, this.translations.title)), this.shoppingBags.length > 0 && (h("ul", null, this.shoppingBags.map(shoppingBag => {
      const products = shoppingBag.products || [];
      return (h("li", { onClick: () => { this.handleItemClick(shoppingBag.id); } }, h("strong", null, shoppingBag.isEditable ? shoppingBag.name : this.translations.favorites), h("div", null, h("strong", null, products.length), h("span", null, this.translations[products.length > 1 ? "products" : "product"]))));
    }))), this.shoppingBags.length === 0 && (h("p", { class: "ds-shopping-bag__no-item" }, this.translations.noList)), h("button", { class: "ds-shopping-bag-button --display-create-form", type: "button", onClick: this.handleButtonClick }, this.translations.buttons.create)));
  }
  static get style() { return shoppingBagListCss; }
}, [0, "ds-shopping-bag-list", {
    "locale": [1],
    "shoppingBags": [16],
    "requestDisplayCreateForm": [8, "request-display-create-form"],
    "requestDisplayShoppingBag": [8, "request-display-shopping-bag"]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-shopping-bag-list"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-shopping-bag-list":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSShoppingBagList);
      }
      break;
  } });
}

export { DSShoppingBagList as G, defineCustomElement as d };

//# sourceMappingURL=shopping-bag-list.js.map