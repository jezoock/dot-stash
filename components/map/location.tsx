import { Component, h, Prop, Element } from '@stencil/core';
import { AnyHTMLElement  } from '@stencil/sass/dist/declarations';
import { MapMarkerOptions } from './map.type';

@Component({
  tag: 'ds-map-location',
  styleUrl: './location.scss',
})
export class DSMapLocation {


  @Element() locationContainer: AnyHTMLElement;

  @Prop() name: string;
  @Prop() lat: number;
  @Prop() lng: number;

  componentDidLoad() {
    const mapComponent = this.locationContainer.closest("ds-map");
    const { name: title, lat, lng} = this;
    const marker: MapMarkerOptions = {
      title,
      position: {lat, lng},
    }

    const infoWindow = this.locationContainer.querySelector("ds-info-window");
    if (infoWindow) {
      marker.infos = infoWindow;
    }

    mapComponent.addMarkers([marker]);
  }
  
  render() {
    return (
      <div class="ds-location">
        <slot />
        <div class="ds-location__description">
          <slot name="description" />
        </div>
      </div>
    );
  }
}