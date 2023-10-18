import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';

const GreenboxShoppingBagButton = /*@__PURE__*/ proxyCustomElement(class GreenboxShoppingBagButton extends HTMLElement {
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
    /* Greenbox_eventDispatch(
      ["gbx-shopping-bag"],
      "request_shoppingbag_open"
    ); */
    console.log("here");
  }
  render() {
    return (h("button", { class: {
        "gbx-button": true,
        "--color-1": true,
        "--medium": true,
        "--banner-act": true
      }, onClick: this.handleButtonClick }, this.label));
  }
}, [0, "gbx-shopping-bag-button", {
    "label": [1]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["gbx-shopping-bag-button"];
  components.forEach(tagName => { switch (tagName) {
    case "gbx-shopping-bag-button":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, GreenboxShoppingBagButton);
      }
      break;
  } });
}

const GbxShoppingBagButton = GreenboxShoppingBagButton;
const defineCustomElement = defineCustomElement$1;

export { GbxShoppingBagButton, defineCustomElement };

//# sourceMappingURL=gbx-shopping-bag-button.js.map