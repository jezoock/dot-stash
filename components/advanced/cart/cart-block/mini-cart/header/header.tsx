import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'snk-mini-cart-header',
  styleUrl: 'header.scss'
})
export class SNKMiniCartHeader {

  @Prop() store: any = {};
  
  render() {
    return (
      <div class="snk-mini-cart-header">
        <snk-mini-cart-store
          class="snk-mini-cart-header__store"
          store={this.store}
        />
        <div class="snk-mini-cart-header__actions">
          <slot name="actions" />
        </div>
      </div>
    );
  }
}