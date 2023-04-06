import { Host, Prop, Component, h, Element, Method } from '@stencil/core';


@Component({
  tag: 'ds-info-window',
})
export class DSInfoWindow {

  @Element() hostContainer: HTMLDsInfoWindowElement;

  /**
   * AriaLabel to assign to the InfoWindow.
   */
  @Prop() ariaLabel: string;
  
  /**
   * Disable panning the map to make the InfoWindow fully visible when it
   * opens.
   */
  @Prop() disableAutoPan = false;

  /**
   * Maximum width of the InfoWindow, regardless of content&#39;s width. This
   */
  @Prop() maxWidth: number;

  /**
   * Minimum width of the InfoWindow, regardless of the content&#39;s width.
   */
  @Prop() minWidth: number;

  /**
   * The offset, in pixels, of the tip of the info window from the point on
   * the map at whose geographical coordinates the info window is anchored.
   */
  @Prop() pixelOffset: google.maps.Size;

  /**
   * The LatLng at which to display this InfoWindow.
   */
  @Prop() position: google.maps.LatLng|google.maps.LatLngLiteral;

  /**
   * All InfoWindows are displayed on the map in order of their zIndex, with
   * higher values displaying in front of InfoWindows with lower values.
   */
  @Prop() zIndex: number;

  @Method()
  async getParams(): Promise<google.maps.InfoWindowOptions> {
    const {
      ariaLabel,
      hostContainer: content,
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