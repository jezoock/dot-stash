import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';

const locationCss = ".ds-location__info-window{display:none}";

const DSMapLocation = /*@__PURE__*/ proxyCustomElement(class DSMapLocation extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.name = undefined;
    this.lat = undefined;
    this.lng = undefined;
  }
  componentDidLoad() {
    const mapComponent = this.locationContainer.closest("ds-map");
    const { name: title, lat, lng } = this;
    const marker = {
      title,
      position: { lat, lng },
    };
    const infoWindow = this.locationContainer.querySelector("ds-info-window");
    if (infoWindow) {
      marker.infos = infoWindow;
    }
    mapComponent.addMarkers([marker]);
  }
  render() {
    return (h("div", { class: "ds-location" }, h("slot", null), h("div", { class: "ds-location__description" }, h("slot", { name: "description" }))));
  }
  get locationContainer() { return this; }
  static get style() { return locationCss; }
}, [4, "ds-map-location", {
    "name": [1],
    "lat": [2],
    "lng": [2]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-map-location"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-map-location":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSMapLocation);
      }
      break;
  } });
}

const DsMapLocation = DSMapLocation;
const defineCustomElement = defineCustomElement$1;

export { DsMapLocation, defineCustomElement };

//# sourceMappingURL=ds-map-location.js.map