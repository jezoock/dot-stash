import { Component, h, Prop } from '@stencil/core';
import { Element, Method } from '@stencil/sass/dist/declarations';
import _ds from '../dot-stash';
import { defaultMapParams, GMapsParams, MapMarkerOptions } from './map.type';

declare global {
  let markerClusterer: any;
  let initMap: () => void;
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
  
  unregisteredMarkers: MapMarkerOptions[] = [];
  markers: google.maps.Marker[] = [];
  map: google.maps.Map;
  zoomStep = 1;
  ready = false;

  mapParams: GMapsParams;

  @Method()
  async getZoom(): Promise<number> {
    return this.map.getZoom();
  }
  
  @Method()
  async setZoom(zoomLevel: number) {
    this.map.setZoom(zoomLevel);
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
  async addInfoWindow(infoWindowComponent: HTMLDsInfoWindowElement, marker: google.maps.Marker) {
    const infoWindowParams = await infoWindowComponent.getParams();
    const infoWindow = new google.maps.InfoWindow(infoWindowParams);
    marker.addListener("click", () => {
      infoWindow.open({
        anchor: marker,
        map: this.map,
      });
    });
  }

  @Method()
  async addMarkers(markers: MapMarkerOptions[]) {
    const newMarkers = []
    if (markers && Array.isArray(markers)) {
      if (typeof google !== "undefined") {
        markers.map( marker => {
          const { infos, position: { lat, lng }, ...markerOptions } = marker;
          if (lat && lng) {
            const newMarker = new google.maps.Marker({
              map: this.map,
              ...markerOptions,
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
        this.unregisteredMarkers.push(...markers);
      }
    } else {
      console.log(`[ERROR] DSMaps addMarkers: invalid locations.`);
    }
    return newMarkers;
  }

  @Method()
  async fitMarkers() {
    const { markers } = this;
    const bounds = new google.maps.LatLngBounds();
    markers.map( marker => bounds.extend(marker.getPosition()) );
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

    this.addMarkers(this.unregisteredMarkers);
    if (this.mapParams.useCluster) {
      this.clusturize();
    }

    if (this.mapParams.fitLocations) {
      this.fitMarkers();
    }
  }

  componentDidLoad() {
    this.initialize();
  }
  
  render() {
    return (
      <div class="ds-map">
        <div class="ds-map__map" />
        <div class="ds-map__controls">
          <slot name="controls" />
        </div>
      </div>
    );
  }
}