export interface MapMarkerOptions extends google.maps.MarkerOptions {
  infos?: HTMLDsInfoWindowElement;
}

export interface Location {
  title: string;
  position: {
    lat: number;
    lng: number;
  },
  label?: string | google.maps.MarkerLabel;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  infos?: HTMLDsInfoWindowElement;
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

export const defaultMapParams: GMapsParams = {
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