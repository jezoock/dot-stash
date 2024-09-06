import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-faq',
  styleUrl: 'faq.scss'
})
export class DSFaq {
  
  render() {
    return (
      <div class="ds-faq">
        <slot />
      </div>
    );
  }
}