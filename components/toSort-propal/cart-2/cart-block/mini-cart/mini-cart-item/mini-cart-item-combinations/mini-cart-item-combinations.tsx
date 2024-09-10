import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'ds-mini-cart-item-combinations',
  styleUrl: 'mini-cart-item-combinations.scss'
})
export class DSMiniCartItemCombinations {

  @Prop({ mutable: true }) combinations: any[] = [];
  
  render() {
    return (
      <ul class="ds-mini-cart-item-combinations">
        {this.combinations.map( choice => (
          <li class="ds-mini-cart-item-combinations__combination">
            <strong>{choice.name} x {choice.quantity}</strong>
            {Boolean(choice.totalPrice) && (
              <span> ({choice.totalPrice})</span>
            )}
          </li>
        ))}
      </ul>
    );
  }
}