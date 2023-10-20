import { Component, h, Prop } from '@stencil/core';
import { translations } from "../translations";

/**
 * Display a shopping bag list
 */
@Component({
	tag: 'ds-shopping-bag-list',
	styleUrl: 'shopping-bag-list.scss'
})

export class DSShoppingBagList {

	/**
	 * Locale used for translations
	 */
	@Prop() locale = 'en';

	/**
	 * An array containing all shopping bags to display
	 */
	@Prop() shoppingBags: any[] = [];

	/**
	 * Method called to display shopping bag creation form
	 */
	@Prop() requestDisplayCreateForm: any;

	/**
	 * Method called to display shopping bag
	 */
	@Prop() requestDisplayShoppingBag: any;

	translations: any = translations[this.locale].ds_shoppingBag;

	constructor() {
		this.handleItemClick = this.handleItemClick.bind(this);
		this.handleButtonClick = this.handleButtonClick.bind(this);
	}

	/**
	 * Display selected shopping bag details
	 * @param {string} shoppingBagId Id of the shopping to display content of
	 */
	handleItemClick(shoppingBagId: string): void {
		this.requestDisplayShoppingBag(shoppingBagId);
	}

	/**
	 * Display shopping bag creation form
	 */
	handleButtonClick(): void {
		this.requestDisplayCreateForm();
	}

	render() {
		return (
			<div class="ds-shopping-bag-list">

				<div class={{
					"ds-shopping-bag-title": true,
					"--list": true
				}}>
					<strong>{this.translations.title}</strong>
				</div>

				{this.shoppingBags.length > 0 && (
					<ul>
						{this.shoppingBags.map(shoppingBag => {
							const products = shoppingBag.products || [];
							return (
								<li onClick={() => { this.handleItemClick(shoppingBag.id); }}>
									<strong>
										{shoppingBag.isEditable ? shoppingBag.name : this.translations.favorites}
									</strong>
									<div>
										<strong>{products.length}</strong>
										<span>{this.translations[products.length > 1 ? "products" : "product"]}</span>
									</div>
								</li>
							)
						})}
					</ul>
				)}

				{this.shoppingBags.length === 0 && (
					<p class="ds-shopping-bag__no-item">
						{this.translations.noList}
					</p>
				)}

				<button class="ds-shopping-bag-button --display-create-form"
					type="button"
					onClick={this.handleButtonClick}>
					{this.translations.buttons.create}
				</button>

			</div>
		);
	}
}