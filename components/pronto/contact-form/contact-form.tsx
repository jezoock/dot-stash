import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-contact-form',
  styleUrl: 'contact-form.scss'
})
export class DSContactForm {
  
  render() {
    return (
      <div class="ds-contact-form">
        <slot />
      </div>
    );
  }
}