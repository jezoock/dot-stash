import { Component, h } from '@stencil/core';


@Component({
  tag: 'ds-login',
  styleUrl: 'login.scss'
})
export class DSLogin {
  
  render() {
    return (
      <div class="ds-login">
        <slot />
      </div>
    );
  }
}