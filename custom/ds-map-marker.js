import { proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const DSMapMarker = /*@__PURE__*/ proxyCustomElement(class DSMapMarker extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.name = undefined;
    this.lat = undefined;
    this.lng = undefined;
    this.icon = undefined;
    this.label = undefined;
    this.params = undefined;
  }
  componentWillLoad() {
    this.markerParams = _ds.props.fromJSON(this.params) || {};
  }
  componentDidLoad() {
    const { name: title, lat, lng, icon, label, } = this;
    const { anchorPoint, animation, clickable, crossOnDrag, cursor, draggable, opacity, optimized, shape, visible, } = this.markerParams;
    const marker = {
      title,
      position: { lat, lng },
      icon,
      label,
      anchorPoint,
      animation,
      clickable,
      crossOnDrag,
      cursor,
      draggable,
      opacity,
      optimized,
      shape,
      visible,
    };
    const parentMap = this.markerContainer.closest("ds-map");
    const infoWindow = this.markerContainer.querySelector("ds-info-window");
    if (infoWindow) {
      marker.infos = infoWindow;
    }
    parentMap.addMarkers([marker]);
  }
  render() {
    return h(Host, null);
  }
  get markerContainer() { return this; }
}, [0, "ds-map-marker", {
    "name": [1],
    "lat": [2],
    "lng": [2],
    "icon": [1],
    "label": [1],
    "params": [1]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-map-marker"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-map-marker":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSMapMarker);
      }
      break;
  } });
}

const DsMapMarker = DSMapMarker;
const defineCustomElement = defineCustomElement$1;

export { DsMapMarker, defineCustomElement };

//# sourceMappingURL=ds-map-marker.js.map