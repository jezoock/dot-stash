import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-giftcard',
  styleUrl: 'giftcard.scss'
})
export class DSGiftcard {
  
  render() {
    return (
      <div class="ds-giftcard">
        <slot />
      </div>
    );
  }
}