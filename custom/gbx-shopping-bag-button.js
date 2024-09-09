import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';

const DSShoppingBagButton = /*@__PURE__*/ proxyCustomElement(class DSShoppingBagButton extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.label = "Shopping list";
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }
  /**
   * Request shopping maodal display
   */
  handleButtonClick() {
    /* DS_eventDispatch(
      ["ds-shopping-bag"],
      "request_shoppingbag_open"
    ); */
    console.log("here");
  }
  render() {
    return (h("button", { class: {
        "ds-button": true,
        "--color-1": true,
        "--medium": true,
        "--banner-act": true
      }, onClick: this.handleButtonClick }, this.label));
  }
}, [0, "ds-shopping-bag-button", {
    "label": [1]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-shopping-bag-button"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-shopping-bag-button":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSShoppingBagButton);
      }
      break;
  } });
}

const GbxShoppingBagButton = DSShoppingBagButton;
const defineCustomElement = defineCustomElement$1;

export { GbxShoppingBagButton, defineCustomElement };

//# sourceMappingURL=ds-shopping-bag-button.js.map