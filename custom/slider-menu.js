import { proxyCustomElement, HTMLElement, createEvent, h } from '@stencil/core/internal/client';

const sliderMenuCss = ".ds-slider-menu{display:flex;justify-content:center;align-items:center;margin:-4rem 0 0 0;position:relative;z-index:1000}.ds-slider-menu__item{margin:0 0.5rem;width:1.125rem;height:1.125rem;border-radius:50%;background-color:#283583;cursor:pointer;transition:background-color ease 0.4s}.ds-slider-menu__item.--active{background-color:#e1388c}.ds-slider-menu__label{display:none}";

const DSSliderMenu = /*@__PURE__*/ proxyCustomElement(class DSSliderMenu extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.request_displaySliderItem_event = createEvent(this, "request_displaySliderItem_event", 7);
    this.dsItemCount = 0;
    this.dsCurrentItemIndex = 0;
    this.itemClickHandler = this.itemClickHandler.bind(this);
  }
  itemClickHandler(index) {
    this.request_displaySliderItem_event.emit({ index });
  }
  render() {
    return (h("ul", { class: "ds-slider-menu" }, [...Array(this.dsItemCount)].map((_, index) => (h("li", { class: {
        "ds-slider-menu__item": true,
        "--active": index === this.dsCurrentItemIndex
      }, onClick: () => this.itemClickHandler(index) }, h("span", { class: "ds-slider-menu__label" }, index))))));
  }
  static get style() { return sliderMenuCss; }
}, [0, "ds-slider-menu", {
    "dsItemCount": [1538, "itemcount"],
    "dsCurrentItemIndex": [1538, "currentitemindex"]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-slider-menu"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-slider-menu":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSSliderMenu);
      }
      break;
  } });
}

export { DSSliderMenu as D, defineCustomElement as d };

//# sourceMappingURL=slider-menu.js.map