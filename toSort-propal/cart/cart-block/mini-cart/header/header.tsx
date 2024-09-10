import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'ds-mini-cart-header',
  styleUrl: 'header.scss'
})
export class DSMiniCartHeader {

  @Prop() store: any = {};
  
  render() {
    return (
      <div class="ds-mini-cart-header">
        <ds-mini-cart-store
          class="ds-mini-cart-header__store"
          store={this.store}
        />
        <div class="ds-mini-cart-header__actions">
          <slot name="actions" />
        </div>
      </div>
    );
  }
}