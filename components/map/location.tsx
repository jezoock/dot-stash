import { Component, h, Prop, Element } from '@stencil/core';
import { AnyHTMLElement  } from '@stencil/sass/dist/declarations';
import { Location } from './map';

@Component({
  tag: 'ds-map-location',
  styleUrl: './location.scss',
})
export class DSMapLocation {


  @Element() locationContainer: AnyHTMLElement;

  @Prop() title: string;
  @Prop() lat: number;
  @Prop() lng: number;

  componentDidLoad() {
    const mapComponent = this.locationContainer.closest("ds-map");
    const { title, lat, lng} = this;
    const marker: Location = {
      title,
      position: {
        lat,
        lng,
      }
    }

    const template = this.locationContainer.querySelector("ds-info-window");
    if (template) {
      console.log(template);
      marker.infos = template;
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