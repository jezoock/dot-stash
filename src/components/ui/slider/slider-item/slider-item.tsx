import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-slider-item',
  styleUrl: 'slider-item.scss'
})
export class DSSliderItem {
  
  render() {
    return (
      <div class="ds-slider-item">
        <slot />
      </div>
    );
  }
}