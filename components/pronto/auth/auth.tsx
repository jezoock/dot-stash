import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-auth',
  styleUrl: 'auth.scss'
})
export class DSAuth {
  
  render() {
    return (
      <div class="ds-auth">
        <slot />
      </div>
    );
  }
}