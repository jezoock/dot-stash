import { Component, h, Prop } from '@stencil/core';
import { Element, Method } from '@stencil/sass/dist/declarations';
import _ds from '../dot-stash';

declare global {
  let markerClusterer: any;
  let initMap: any;
}

export interface Zone {
  name: string;
  zoom: number;
  lat: number;
  lng: number;
}

/* export const EUROPE: Zone = {
  name: "Europe",
  zoom: 5,
  lat: 48.886483489234266, lng: 2.342630624771118,
}; */

export interface Location {
  name: string;
  lat: number;
  lng: number;
  infos?: string;
}

export interface GMapsParams {
  zoom: number;
  zoomStep: number;
  center: {
    lat: number;
    lng: number;
  },
  useCluster: boolean;
  initializeCallbackName: string;
  clusterImage: string;
  fitLocations: boolean;
  mapStyles?: {
    name: string;
    styles: google.maps.MapTypeStyle[];
    isDefault?: boolean;
  }[];
}

const defaultMapParams: GMapsParams = {
  zoom: 9,
  zoomStep: 1,
  center: {
    lat: -34.397,
    lng: 150.644
  },
  useCluster: false,
  initializeCallbackName: 'initMap',
  clusterImage: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  fitLocations: true,
}

@Component({
  tag: 'ds-map',
  styleUrl: 'map.scss'
})
export class DSMap {

  @Element() mapContainer: HTMLDivElement;

  @Prop() locations: Location[] | string;
  @Prop() apiKey: string;
  @Prop() params: string | Record<string, unknown>;
  
  markers: Location[] = [];
  map: any;
  zoomLevel = 9; /* 0 to 22 */
  zoomStep = 1;
  ready = false;

  mapParams: GMapsParams;

  @Method()
  async setZoom(zoomLevel: number) {
    this.zoomLevel = zoomLevel;
    this.map.setZoom(this.zoomLevel);
  }
  
  @Method()
  async zoomIn(scale = this.map.getZoom() + this.zoomStep) {
    this.setZoom(scale);
  }
  
  @Method()
  async zoomOut(scale = this.map.getZoom() - this.zoomStep) {
    this.setZoom(scale);
  }

  @Method()
  async initialize(apiKey?: string, initializeCallbackName?: string) {

    if (!this.ready) {

      if (apiKey || this.apiKey) {

        if (typeof initMap === "undefined") {
          window['initMap'] = () => console.log("[LOG] DSMap initialize: GMaps intialize callback called");
        }

        try {
          await _ds.tools.loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey ?? this.apiKey }&callback=${initializeCallbackName ?? this.mapParams.initializeCallbackName}`, "gMaps")
          console.log("[LOG] DSMap initialize: GMaps script succesfully loaded.");
        } catch (err) {
          console.log(err);
        }

        if (this.mapParams.useCluster) {
          try {
            await _ds.tools.loadScript('https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js', 'gMapsClusterer');
            console.log("[LOG] DSMap initialize: GMaps clusterer script succesfully loaded.");
          } catch (err) {
            console.log(err);
          }
        }

        this.initializeMap();

      } else {
        console.log("[ERROR] DSMap initialize: No api key provided.");
      }
    }
  }

  @Method()
  async addMapStyle(name: string, styles: google.maps.MapTypeStyle[]) {
    const styledMapType = new google.maps.StyledMapType( styles, { name });
    this.map.mapTypes.set(name, styledMapType);
  }
  
  @Method()
  async setMapStyles(name: string) {
    this.map.setMapTypeId(name);
  }

  @Method()
  async addInfoWindow(content: string, marker) {
    console.log(content, marker);
    const infowindow = new google.maps.InfoWindow({
      content,
      ariaLabel: "Uluru",
    });
    marker.addListener("click", () => {
      infowindow.open({
        anchor: marker,
        map: this.map,
      });
    });
  }

  @Method()
  async addMarkers(markers: Location[]) {
    const newMarkers = []
    if (markers && Array.isArray(markers)) {
      if (typeof google !== "undefined") {
        markers.map( marker => {
          const { name: title, lat, lng, infos } = marker;
          if (lat && lng) {
            const newMarker = new google.maps.Marker({
              position: { lat, lng },
              map: this.map,
              title,
            });
            if (infos) {
              this.addInfoWindow(infos, newMarker);
            }
            newMarkers.push(marker);
          } else {
            console.log(`[ERROR] DSMaps addMarkers: ${lat ? '' : ' latitude'}${lng ? '' : ' longitude'} not provided.`);
          }
        });
        const { markers: currentMarkers } = this;
        this.markers = [ ...currentMarkers, ...newMarkers ];
      } else {
        console.log(`[LOG] DSMaps addMarkers: GMaps not ready, store location.`);
        this.markers.push(...markers);
      }
    } else {
      console.log(`[ERROR] DSMaps addMarkers: invalid locations.`);
    }
    return newMarkers;
  }

  @Method()
  async fitLocations() {
    const { markers } = this;
    const bounds = new google.maps.LatLngBounds();
    for (const location of markers) {
      bounds.extend(location);
    }
    this.map.fitBounds(bounds);
  }

  @Method()
  async clusturize() {
    new markerClusterer.MarkerClusterer(
      this.map,
      this.markers,
      { imagePath: this.mapParams.clusterImage }
    );
  }

  componentWillLoad() {
    this.mapParams = {
      ...defaultMapParams,
      ..._ds.props.fromJSON(this.params)
    };
  }

  initializeMap() {
    this.map = new google.maps.Map(this.mapContainer.querySelector('.ds-map__map'), this.mapParams);
    this.ready = true;

    let defaultMapStylesName = 'roadmap';
    (this.mapParams.mapStyles || []).map( ({ name, styles, isDefault }) => {
      this.addMapStyle(name, styles);
      if (isDefault || this.mapParams.mapStyles.length === 1) {
        defaultMapStylesName = name;
      }
    });
    this.setMapStyles(defaultMapStylesName);

    this.addMarkers(this.markers);
    if (this.mapParams.useCluster) {
      this.clusturize();
    }

    if (this.mapParams.fitLocations) {
      this.fitLocations();
    }
  }

  componentDidLoad() {
    this.initialize();
  }
  
  render() {
    return (
      <div class="ds-map">
        <div class="ds-map__map">
        </div>
        <div class="ds-map__controls">
          <button type="button" onClick={() => this.setZoom(2)}>zoom min</button>
          <button type="button" onClick={() => this.setZoom(22)}>zoom max</button>
          <button type="button" onClick={() => this.zoomIn()}>zoomin</button>
          <button type="button" onClick={() => this.zoomOut()}>zoomOut</button>
          <button type="button" onClick={() => this.fitLocations()}>fit</button>
          <ds-map-rc action="zoomIn">test</ds-map-rc>
        </div>
      </div>
    );
  }
}