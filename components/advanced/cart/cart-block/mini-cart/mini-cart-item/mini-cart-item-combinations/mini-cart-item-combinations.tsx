import { Component, h, Prop } from '@stencil/core';
import { Greenbox_formatPrice } from '../../../../../../../../utils';

@Component({
  tag: 'snk-mini-cart-item-combinations',
  styleUrl: 'mini-cart-item-combinations.scss'
})
export class SNKMiniCartItemCombinations {

  @Prop({ mutable: true }) combinations: any[] = [];
  
  render() {
    return (
      <ul class="snk-mini-cart-item-combinations">
        {this.combinations.map( choice => (
          <li class="snk-mini-cart-item-combinations__combination">
            <strong>{choice.name} x {choice.quantity}</strong>
            {Boolean(choice.totalPrice) && (
              <span> ({Greenbox_formatPrice({ price: choice.totalPrice, cents: true, isFrCurrency: false })})</span>
            )}
          </li>
        ))}
      </ul>
    );
  }
}