import { Component, h, Host, Prop, Element } from '@stencil/core/internal';
import { AnyHTMLElement } from '@stencil/sass/dist/declarations';
import _ds from '../../../../typescript/dot-stash';
import { MapMarkerOptions, MarkerOptionsFromProps } from '../map.type';



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
  @Prop() params: string | MarkerOptionsFromProps;

  markerParams: MarkerOptionsFromProps;

  componentWillLoad() {
    this.markerParams = _ds.props.fromJSON(this.params) || {};
  }

  componentDidLoad() {
    const {
      name: title,
      lat, 
      lng,
      icon, 
      label, 
    } = this;
    const {
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
    } = this.markerParams;
    const marker: MapMarkerOptions = {
      title,
      position: { lat, lng },
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