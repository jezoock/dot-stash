import { Component, h } from '@stencil/core';

@Component({
  tag: 'ds-footer',
  styleUrl: 'footer.scss'
})
export class DSFooter {
  
  render() {
    return (
      <div class="ds-footer">
        <slot />
      </div>
    );
  }
}