import { Component, h, Prop } from '@stencil/core';
import { CreditCard } from "../../../../../../../interfaces";

@Component({
	tag: 'ds-credit-card',
	styleUrl: 'credit-card.scss'
})
export class DSCreditCard {

	@Prop({ attribute: "card" }) card: CreditCard;

	render() {
		return (
			<div class="ds-credit-card">
				{this.card.paymentMethod && this.card.image && (
					<div class="ds-credit-card__image">
						<img
							src={`/buildsGrocery/img/assetsGrocery/image/icons/cards/${this.card.image}`}
							alt={`Logo ${this.card.paymentMethod}`}
						/>
					</div>
				)}

				<span class={{
					"ds-credit-card__number": true,
					"--with-card-img": !!this.card.paymentMethod
				}}>
					<span>****</span>
					<span>****</span>
					<span>****</span>
					<strong>{this.card.last4}</strong>
				</span>

				<span class="ds-credit-card__expire-date">
					{`${this.card.expiryMonth} / ${this.card.expiryYear}`}
				</span>

			</div>
		);
	}
}
