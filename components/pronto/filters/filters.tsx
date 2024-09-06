import { Component, h, Host } from '@stencil/core';


@Component({
  tag: 'ds-filters',
})
export class DSFilters {
  
  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}