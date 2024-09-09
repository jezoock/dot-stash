import { Component, h, Host } from '@stencil/core/internal';


@Component({
  tag: 'ds-slider-item',
  styleUrl: 'slider-item.scss',
})
export class DSSliderItem {
  
  render() {
    return (
      <Host class="ds-slider-item">
        <slot />
      </Host>
    );
  }
}