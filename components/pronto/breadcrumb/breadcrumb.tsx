import { Component, h } from '@stencil/core';

@Component({
  tag: 'ds-breadcrumb',
  styleUrl: 'breadcrumb.scss'
})
export class DSBreadcrumb {
  
  render() {
    return (
      <div class="ds-breadcrumb">
        <slot />
      </div>
    );
  }
}