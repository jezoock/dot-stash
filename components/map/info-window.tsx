import { Host, Prop, Component, h, Element, Method } from '@stencil/core';


@Component({
  tag: 'ds-info-window',
})
export class DSInfoWindow {

  @Element() container;

  @Prop() ariaLabel: string;
  @Prop() disableAutoPan = false;
  @Prop() maxWidth: number;
  @Prop() minWidth: number;
  @Prop() pixelOffset: google.maps.Size;
  @Prop() position: google.maps.LatLng|google.maps.LatLngLiteral;
  @Prop() zIndex: number;

  @Method()
  async getParams(): Promise<google.maps.InfoWindowOptions> {
    const {
      ariaLabel,
      container: content,
      disableAutoPan,
      maxWidth,
      minWidth,
      pixelOffset,
      position,
      zIndex,
    } = this;

    return {
      ariaLabel,
      content,
      disableAutoPan,
      maxWidth,
      minWidth,
      pixelOffset,
      position,
      zIndex,
    }
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}