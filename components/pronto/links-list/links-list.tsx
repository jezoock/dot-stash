import { Component, h } from '@stencil/core';

@Component({
  tag: 'ds-links-list',
  styleUrl: 'links-list.scss'
})
export class DSLinksList {
  
  render() {
    return (
      <div class="ds-links-list">
        <slot />
      </div>
    );
  }
}