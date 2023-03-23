import { Component, h, Host, Prop, Element } from '@stencil/core';
import { AnyHTMLElement } from '@stencil/sass/dist/declarations';
import { MapMarkerOptions } from './map.type';

@Component({
  tag: 'ds-map-marker',
})
export class DSMapMarker {

  @Element() markerContainer: AnyHTMLElement;

  @Prop() name: string;
  @Prop() lat: number;
  @Prop() lng: number;
  @Prop() icon: string | google.maps.Icon | google.maps.Symbol;
  @Prop() label: string | google.maps.MarkerLabel;

  @Prop() anchorPoint?: google.maps.Point|null;
  @Prop() animation?: google.maps.Animation|null;
  @Prop() clickable?: boolean|null;
  @Prop() crossOnDrag?: boolean|null;
  @Prop() cursor?: string|null;
  @Prop() isDraggable?: boolean|null;
  @Prop() opacity?: number|null;
  @Prop() optimized?: boolean|null;
  @Prop() shape?: google.maps.MarkerShape|null;
  @Prop() visible?: boolean|null;

  componentDidLoad() {
    const { name: title, lat, lng, icon, label, anchorPoint,
      animation,
      clickable,
      crossOnDrag,
      cursor,
      isDraggable: draggable,
      opacity,
      optimized,
      shape,
      visible
    } = this;
    const marker: MapMarkerOptions = {
      title,
      position: new google.maps.LatLng(lat, lng),
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
    }

    const parentMap = this.markerContainer.closest("ds-map");
    const infoWindow = this.markerContainer.querySelector("ds-info-window");
    if (infoWindow) {
      marker.infos = infoWindow;
    }
    parentMap.addMarkers([marker]);
  }
  
  render() {
    return <Host />;
  }
}