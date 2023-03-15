import { Component, h, Prop, Element } from '@stencil/core';
import { AnyHTMLElement } from '@stencil/sass/dist/declarations';
import { Location } from './map';

@Component({
  tag: 'ds-location',
  styleUrl: './location.scss'
})
export class DSLocation {

  @Element() locationContainer: AnyHTMLElement;

  @Prop() name: string;
  @Prop() lat: number;
  @Prop() lng: number;

  componentDidLoad() {
    const mapComponent = this.locationContainer.closest("ds-map");
    const { name, lat, lng} = this;
    const marker: Location = {
      name,
      lat,
      lng,
    }

    const template = this.locationContainer.querySelector(".ds-location__info-window");
    if (template) {
      marker.infos = template.textContent;
    }

    mapComponent.addMarkers([marker]);
  }
  
  render() {
    return (
      <div class="ds-location">
        <div class="ds-location__info-window">
          <slot/>
        </div>
        <div class="ds-location__content">
        </div>
      </div>
    );
  }
}