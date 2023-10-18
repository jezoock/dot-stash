import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';

const sliderItemCss = "";

const DSSliderItem = /*@__PURE__*/ proxyCustomElement(class DSSliderItem extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
  }
  render() {
    return (h("div", { class: "ds-slider-item" }, h("slot", null)));
  }
  static get style() { return sliderItemCss; }
}, [4, "ds-slider-item"]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-slider-item"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-slider-item":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSSliderItem);
      }
      break;
  } });
}

const DsSliderItem = DSSliderItem;
const defineCustomElement = defineCustomElement$1;

export { DsSliderItem, defineCustomElement };

//# sourceMappingURL=ds-slider-item.js.map