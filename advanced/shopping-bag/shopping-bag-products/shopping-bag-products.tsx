import { Component, h, Listen, Prop } from '@stencil/core';

@Component({
	tag: 'ds-shopping-bag-products',
	styleUrl: 'shopping-bag-products.scss'
})

export class DSShoppingBagProducts {

	/**
	 * Array of products to display
	 */
	@Prop() products: any[] = [];
	@Prop() ShoppingBagUpdateProductsAction: any;
	@Prop() toggleProductSelection: (productId: string) => void;

	/**
	 * Shopping bag id associated to products
	 */
	@Prop({ reflect: true }) shoppingBagId: string;
	@Prop() selectedProductIds: string[];

	componentWillLoad() {
		/* this.store.mapDispatchToProps(this, ({
			ShoppingBagUpdateProductsAction,
		})); */
	}

	@Listen('request_shoppingBagProductUpdate_event')
	request_shoppingBagProductUpdate_eventHandler(event: { detail: { id, quantity }, stopPropagation: () => void }) {
		const { id, quantity } = event.detail;
		event.stopPropagation();
		const productsClone = [...this.products];
		const productToUpdate = productsClone.find(({ refProduct }) => refProduct === id);
		
		if (productToUpdate) {
			productToUpdate.quantity = quantity;
		}

		this.ShoppingBagUpdateProductsAction({
			shoppingBagId: this.shoppingBagId,
			products: productsClone.map(({ externalRefProduct, quantity }) =>
				({ externalRefProduct, quantity })),
		});
	}

	constructor() {
		this.toggleProductSelection = this.toggleProductSelection.bind(this);
	}

	render() {
		return (
			<div class="ds-shopping-bag-products">
				{this.products.map(product => (
					<ds-cart-item
						item={product}
						isSelected={this.selectedProductIds.includes(product.id)}
						toggleSelect={this.toggleProductSelection}
						itemImage={product.image ? product.image : 'unavailable'}
					/>
				))}
			</div>
		);
	}
}
