import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

var GMapsTypeId;
(function (GMapsTypeId) {
  GMapsTypeId["ROADMAP"] = "roadmap";
  GMapsTypeId["HYBRID"] = "hybrid";
  GMapsTypeId["TERRAIN"] = "terrain";
  GMapsTypeId["SATELLITE"] = "satellite";
})(GMapsTypeId || (GMapsTypeId = {}));
const defaultMapParams = {
  zoomStep: 1,
  useCluster: false,
  initializeCallbackName: 'initMap',
  clusterImage: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  fitLocations: true,
  settings: {
    zoom: 9,
    center: {
      lat: -34.397,
      lng: 150.644
    },
  }
};

const mapCss = ".ds-map{background:red;height:500px}.ds-map__map{background:green;height:500px}";

var __rest = (undefined && undefined.__rest) || function (s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
const DSMap = /*@__PURE__*/ proxyCustomElement(class DSMap extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.unregisteredMarkers = [];
    this.markers = [];
    this.ready = false;
    this.locations = undefined;
    this.apiKey = undefined;
    this.params = undefined;
  }
  async getTilt() {
    return this.map.getTilt();
  }
  async setTilt(tilt = this.map.getTilt()) {
    this.map.setTilt(tilt);
  }
  async getZoom() {
    return this.map.getZoom();
  }
  async setZoom(zoomLevel) {
    this.map.setZoom(zoomLevel);
  }
  async zoomIn(scale = this.map.getZoom() + this.mapParams.zoomStep) {
    this.setZoom(scale);
  }
  async zoomOut(scale = this.map.getZoom() - this.mapParams.zoomStep) {
    this.setZoom(scale);
  }
  async initialize(apiKey, initializeCallbackName) {
    if (!this.ready) {
      if (apiKey || this.apiKey) {
        if (typeof window.initMap === "undefined") {
          window.initMap = () => console.log("[LOG] DSMap initialize: GMaps intialize callback called");
        }
        try {
          const key = `key=${apiKey !== null && apiKey !== void 0 ? apiKey : this.apiKey}`;
          const callback = `&callback=${initializeCallbackName !== null && initializeCallbackName !== void 0 ? initializeCallbackName : this.mapParams.initializeCallbackName}`;
          let language = '';
          let region = '';
          if (this.mapParams.language) {
            language = `&language=${language}`;
          }
          if (this.mapParams.region) {
            region = `&language=${region}`;
          }
          await _ds.tools.loadScript(`https://maps.googleapis.com/maps/api/js?${key}${callback}${language}${region}`, "gMaps");
          console.log("[LOG] DSMap initialize: GMaps script succesfully loaded.");
        }
        catch (err) {
          console.log(err);
        }
        if (this.mapParams.useCluster) {
          try {
            await _ds.tools.loadScript('https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js', 'gMapsClusterer');
            console.log("[LOG] DSMap initialize: GMaps clusterer script succesfully loaded.");
          }
          catch (err) {
            console.log(err);
          }
        }
        this.initializeMap();
      }
      else {
        console.log("[ERROR] DSMap initialize: No api key provided.");
      }
    }
  }
  async addMapStyle(name, styles) {
    const styledMapType = new google.maps.StyledMapType(styles, { name });
    this.map.mapTypes.set(name, styledMapType);
  }
  async setMapStyles(name) {
    this.map.setMapTypeId(name);
  }
  async addInfoWindow(infoWindowComponent, marker) {
    const infoWindowParams = await infoWindowComponent.getParams();
    const infoWindow = new google.maps.InfoWindow(infoWindowParams);
    marker.addListener("click", () => {
      infoWindow.open({
        anchor: marker,
        map: this.map,
      });
    });
  }
  async addMarkers(markers) {
    const newMarkers = [];
    if (markers && Array.isArray(markers)) {
      if (typeof google !== "undefined") {
        markers.map(marker => {
          const { infos, position: { lat, lng } } = marker, markerOptions = __rest(marker, ["infos", "position"]);
          if (lat && lng) {
            const newMarker = new google.maps.Marker(Object.assign({ map: this.map, position: new google.maps.LatLng({ lat, lng }) }, markerOptions));
            if (infos) {
              this.addInfoWindow(infos, newMarker);
            }
            newMarkers.push(newMarker);
          }
          else {
            console.log(`[ERROR] DSMaps addMarkers:${lat ? '' : ' latitude'}${lng ? '' : ' longitude'} not provided.`);
          }
        });
        const { markers: currentMarkers } = this;
        this.markers = [...currentMarkers, ...newMarkers];
      }
      else {
        console.log(`[LOG] DSMaps addMarkers: GMaps not ready, store location.`);
        this.unregisteredMarkers.push(...markers);
      }
    }
    else {
      console.log(`[ERROR] DSMaps addMarkers: invalid locations.`);
    }
    return newMarkers;
  }
  async fitMarkers() {
    const { markers } = this;
    const bounds = new google.maps.LatLngBounds();
    markers.map(marker => bounds.extend(marker.getPosition()));
    this.map.fitBounds(bounds);
  }
  async clusturize() {
    new window.markerClusterer.MarkerClusterer(this.map, this.markers, { imagePath: this.mapParams.clusterImage });
  }
  componentWillLoad() {
    this.mapParams = Object.assign(Object.assign({}, defaultMapParams), _ds.props.fromJSON(this.params));
  }
  componentDidLoad() {
    this.initialize();
  }
  initializeMap() {
    this.map = new google.maps.Map(this.mapContainer.querySelector('.ds-map__map'), this.mapParams.settings);
    this.ready = true;
    let defaultMapStylesName = GMapsTypeId.ROADMAP;
    (this.mapParams.mapStyles || []).map(({ name, styles, isDefault }) => {
      this.addMapStyle(name, styles);
      if (isDefault || this.mapParams.mapStyles.length === 1) {
        defaultMapStylesName = name;
      }
    });
    this.setMapStyles(defaultMapStylesName);
    this.addMarkers(this.unregisteredMarkers);
    if (this.mapParams.useCluster) {
      this.clusturize();
    }
    if (this.mapParams.fitLocations) {
      this.fitMarkers();
    }
  }
  render() {
    return (h("div", { class: "ds-map" }, h("div", { class: "ds-map__map" }), h("div", { class: "ds-map__controls" }, h("slot", { name: "controls" }))));
  }
  get mapContainer() { return this; }
  static get style() { return mapCss; }
}, [4, "ds-map", {
    "locations": [16],
    "apiKey": [1, "api-key"],
    "params": [16],
    "getTilt": [64],
    "setTilt": [64],
    "getZoom": [64],
    "setZoom": [64],
    "zoomIn": [64],
    "zoomOut": [64],
    "initialize": [64],
    "addMapStyle": [64],
    "setMapStyles": [64],
    "addInfoWindow": [64],
    "addMarkers": [64],
    "fitMarkers": [64],
    "clusturize": [64]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-map"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-map":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSMap);
      }
      break;
  } });
}

const DsMap = DSMap;
const defineCustomElement = defineCustomElement$1;

export { DsMap, defineCustomElement };

//# sourceMappingURL=ds-map.js.map