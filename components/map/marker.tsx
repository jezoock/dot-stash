import { Component, h, Host, Prop, Element } from '@stencil/core';
import { AnyHTMLElement } from '@stencil/sass/dist/declarations';

@Component({
  tag: 'ds-marker',
})
export class DSMarker {

  @Element() markerContainer: AnyHTMLElement;

  @Prop() name: string;
  @Prop() lat: number;
  @Prop() lng: number;

  componentDidLoad() {
    const { name, lat, lng } = this;
    this.markerContainer.closest("ds-map").addMarkers([{name, lat, lng}]);
  }
  
  render() {
    return <Host />;
  }
}