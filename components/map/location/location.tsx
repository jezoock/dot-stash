import { Component, h, Host, Prop, Element } from '@stencil/core';
import { AnyHTMLElement } from '@stencil/sass/dist/declarations';

@Component({
  tag: 'ds-location',
})
export class DSLocation {

  @Element() locationContainer: AnyHTMLElement;

  @Prop() name: string;
  @Prop() lat: number;
  @Prop() lng: number;

  componentDidLoad() {
    const { name, lat, lng} = this;
    this.locationContainer.closest("ds-map").addMarkers([{name, lat, lng}]);
  }
  
  render() {
    return <Host />;
  }
}