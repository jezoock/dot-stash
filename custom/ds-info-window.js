import { proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';

const DSInfoWindow = /*@__PURE__*/ proxyCustomElement(class DSInfoWindow extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.ariaLabel = undefined;
    this.disableAutoPan = false;
    this.maxWidth = undefined;
    this.minWidth = undefined;
    this.pixelOffset = undefined;
    this.position = undefined;
    this.zIndex = undefined;
  }
  async getParams() {
    const { ariaLabel, hostContainer: content, disableAutoPan, maxWidth, minWidth, pixelOffset, position, zIndex, } = this;
    return {
      ariaLabel,
      content,
      disableAutoPan,
      maxWidth,
      minWidth,
      pixelOffset,
      position,
      zIndex,
    };
  }
  render() {
    return (h(Host, null, h("slot", null)));
  }
  get hostContainer() { return this; }
}, [4, "ds-info-window", {
    "ariaLabel": [1, "aria-label"],
    "disableAutoPan": [4, "disable-auto-pan"],
    "maxWidth": [2, "max-width"],
    "minWidth": [2, "min-width"],
    "pixelOffset": [16],
    "position": [16],
    "zIndex": [2, "z-index"],
    "getParams": [64]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-info-window"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-info-window":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSInfoWindow);
      }
      break;
  } });
}

const DsInfoWindow = DSInfoWindow;
const defineCustomElement = defineCustomElement$1;

export { DsInfoWindow, defineCustomElement };

//# sourceMappingURL=ds-info-window.js.map