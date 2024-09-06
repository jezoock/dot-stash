import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-register',
  styleUrl: 'register.scss'
})
export class DSRegister {
  
  render() {
    return (
      <div class="ds-register">
        <slot />
      </div>
    );
  }
}