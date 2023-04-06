export interface MapMarkerOptions extends google.maps.MarkerOptions {
  infos?: HTMLDsInfoWindowElement;
  position: {
    lat: number;
    lng: number;
  }
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

export enum GMapsTypeId {
  ROADMAP = 'roadmap',
  HYBRID = 'hybrid',
  TERRAIN = 'terrain',
  SATELLITE = 'satellite',
}

export const defaultMapTypes = [
  GMapsTypeId.ROADMAP,
  GMapsTypeId.HYBRID,
  GMapsTypeId.TERRAIN,
  GMapsTypeId.SATELLITE,
]

export interface GMapsParams {
  zoomStep?: number;
  useCluster?: boolean;
  initializeCallbackName?: string;
  clusterImage?: string;
  fitLocations?: boolean;
  language?: string;
  region?: string;
  mapStyles?: {
    name: string;
    styles: google.maps.MapTypeStyle[];
    isDefault?: boolean;
  }[];
  settings?: google.maps.MapOptions;
}

export const defaultMapParams: GMapsParams = {
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
}

export type MarkerOptionsFromProps = Pick<
MapMarkerOptions,
'anchorPoint'
| 'animation'
| 'clickable'
| 'crossOnDrag'
| 'cursor'
| 'draggable'
| 'opacity'
| 'optimized'
| 'shape'
| 'visible'
>