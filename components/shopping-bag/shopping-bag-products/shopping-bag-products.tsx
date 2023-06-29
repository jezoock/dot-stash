import { Component, h, Listen, Prop } from '@stencil/core';
import { Store } from '@stencil/redux';
import { Greenbox_getImage } from '../../../../utils';
import { ShoppingBagUpdateProductsAction } from '../../../../_redux/actions/shoppingBag';

@Component({
	tag: 'gbx-shopping-bag-products',
	styleUrl: 'shopping-bag-products.scss'
})

export class GreenboxShoppingBagProducts {

	/**
	 * Array of products to display
	 */
	@Prop() products: any[] = [];
	@Prop({ context: "store" }) store: Store;
	@Prop() ShoppingBagUpdateProductsAction: any;
	@Prop() toggleProductSelection: (productId: string) => void;

	/**
	 * Shopping bag id associated to products
	 */
	@Prop({ reflect: true }) shoppingBagId: string;
	@Prop() selectedProductIds: string[];

	componentWillLoad() {
		this.store.mapDispatchToProps(this, ({
			ShoppingBagUpdateProductsAction,
		}));
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
			<div class="gbx-shopping-bag-products">
				{this.products.map(product => (
					<gbx-cart-item
						item={product}
						isSelected={this.selectedProductIds.includes(product.id)}
						toggleSelect={this.toggleProductSelection}
						itemImage={Greenbox_getImage(product.image ? product.image : 'unavailable', 120)}
					/>
				))}
			</div>
		);
	}
}
