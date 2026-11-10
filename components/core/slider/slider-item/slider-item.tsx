import { Component, h } from '@stencil/core';

/**
 * A slide of `ds-slider`, which makes it a `group` named by its place ("2 of 5").
 *
 * @slot - The content of the slide: an image, a link, a card.
 */
@Component({
  tag: 'ds-slider-item',
  styleUrl: 'slider-item.scss',
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
