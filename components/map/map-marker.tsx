import { Component, h, Host, Prop, Element } from '@stencil/core';
import { AnyHTMLElement } from '@stencil/sass/dist/declarations';
import { Location } from './map';

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

  anchorPoint?: google.maps.Point|null;
  animation?: google.maps.Animation|null;
  clickable?: boolean|null;
  crossOnDrag?: boolean|null;
  cursor?: string|null;
  draggable?: boolean|null;
  opacity?: number|null;
  optimized?: boolean|null;
  shape?: google.maps.MarkerShape|null;
  visible?: boolean|null;

  componentDidLoad() {
    const { name: title, lat, lng, icon, label } = this;
    const marker: Location = {
      title,
      position: {
        lat,
        lng,
      },
      icon,
      label,
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