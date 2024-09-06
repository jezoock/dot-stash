import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-address',
  styleUrl: 'address.scss'
})
export class DSAddress {
  
  render() {
    return (
      <div class="ds-address-container">
        <slot />
      </div>
    );
  }
}