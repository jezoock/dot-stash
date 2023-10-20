import { Component, h, Prop, Listen, State } from '@stencil/core';
import Fragment from "stencil-fragment";
import { translations } from "../translations";

/**
 * Display shopping bag details & products
 */
@Component({
  tag: 'ds-shopping-bag-details',
  styleUrl: 'shopping-bag-details.scss'
})

export class DSShoppingBagDetails {
  /**
   * Shopping bag to show details of
   */
  @Prop({ mutable: true }) shoppingBag: any = {};

  /**
   * Locale used for translations
   */
  @Prop() locale = 'en';

  /**
   * Method called to update shopping bag informations
   */
  @Prop() requestUpdateShoppingBag: any;

  /**
   * Method called to delete current shopping bag
   */
  @Prop() requestDeleteShoppingBagProducts: any;

  /**
   * Method called to navigate to shopping bag root page
   */
  @Prop() requestNavigationBack: any;

  /**
   * Variable to know if the user already answer to confirm-age's modal
   */
  @Prop() isAgeLegal = false;

  @State() isDeleteMessageShown = false;
  @State() cartId: string;
  @State() selectedProductIds: string[] = this.shoppingBag?.products?.map(({ id }) => id) || [];

  translations: any = translations[this.locale].ds_shoppingBag;

  private isAlcohol: any = false;
  private modal: any;

  private productInputQuantity_change_eventHandlerDebounced = /* debounce( */({ productId, quantity }) => {
    const products = [];
    this.shoppingBag.products.forEach(product => {
      const newProduct = { ...product };
      if (product.id === productId) {
        newProduct.quantity = quantity;
        newProduct.totalPrice = newProduct.unitPrice * newProduct.quantity / newProduct.quantityUnitNumber;
      }
      products.push(newProduct);
    });
    /* this.ShoppingBagUpdateProductsAction({ shoppingBagId: this.shoppingBag.id, products: products }); */
  }/* , 500, false); */

  @Listen("request_quantityUpdate_event")
  request_quantityUpdate_eventHandler({ detail }) {
    this.productInputQuantity_change_eventHandlerDebounced(detail);
  }

  constructor() {
    this.updateShoppingBag = this.updateShoppingBag.bind(this);
    this.toggleDeleteMessage = this.toggleDeleteMessage.bind(this);
    this.deleteProducts = this.deleteProducts.bind(this);
    this.addToCartButtonClickHandler = this.addToCartButtonClickHandler.bind(this);
    this.toggleProductSelection = this.toggleProductSelection.bind(this);
    this.deleteButtonClickHandler = this.deleteButtonClickHandler.bind(this);
    this.deleteProducts = this.deleteProducts.bind(this);
  }

  componentWillLoad() {
    /* this.store.mapStateToProps(this, state => {
      const {
        cart: { cart: { id } }
      } = state;
      return {
        cartId: id
      };
    });
    this.store.mapDispatchToProps(this, {
      ShoppingBagUpdateProductsAction,
      CartAddProductsFromShoppingBagAction,
      CartUpdateAction
    }); */

    this.initModal();
  }

  /**
   * Calculate shopping bag total
   * @returns {number} shopping bag total
   */
  private getTotal(): number {
    return this.shoppingBag.products.length
      ? this.shoppingBag.products.map((p) => {
        return p.isAvailableInStore !== false
          ? p.totalPrice
          : 0;
      }).reduce((a, c) => {
        return a + c;
      })
      : 0
  }

  /**
   * Call parent component method to update shopping bag informations
   * @param {string} shoppingBagName New shopping bag name
   */
  updateShoppingBag(updateData: { name: string, products: any[] }): void {
    this.requestUpdateShoppingBag(this.shoppingBag.id, updateData);
  }

  /**
   * Call parent component method to delete shopping bag
   */
  deleteProducts(): void {
    const newProductsCopy = this.shoppingBag.products.map(product => {
      if (this.selectedProductIds.includes(product.id)) {
        return {
          ...product,
          quantity: 0,
        };
      } else {
        return product;
      }
    });
    console.log(newProductsCopy);
    /* this.ShoppingBagUpdateProductsAction({ shoppingBagId: this.shoppingBag.id, products: newProductsCopy }); */
  }

  deleteButtonClickHandler(): void {
    this.requestDeleteShoppingBagProducts(this.shoppingBag.id);
  }

  toggleProductSelection(productId: string) {
		if (this.selectedProductIds.includes(productId)) {
			this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
		} else {
			this.selectedProductIds = [...this.selectedProductIds, productId];
		}
	}

  /**
   * Execute a request to add current shopping bag products to the cart and handle different cases (ok/partial/ko).
   * @returns {Promise<void>}
   */
  async addToCartButtonClickHandler() {
    if (!this.isAgeLegal && this.modal) {
      for (const product of this.shoppingBag.products) {
        if (product.isAlcohol) {
          this.isAlcohol = true;

          break;
        }
      }
    }

    if (this.isAlcohol && this.modal && !this.isAgeLegal) {
      this.modal.shown = true;
      return;
    }
    await this.addShoppingBagProductsToCart();
  }

  async addShoppingBagProductsToCart(): Promise<void> {
    try {
      /* const response = await this.CartAddProductsFromShoppingBagAction({
        cartId: this.cartId,
        products: this.shoppingBag.products.filter(({ id }) => this.selectedProductIds.includes(id)),
        isAgeLegal: this.isAgeLegal
      });

      if (response.type === "CART_ADD_PRODUCTS_FROM_SHOPPING_BAG_SUCCESS") {
        if (response.areAllProductsAdded) {
          this.showToast(this.translations.messages.shoppingBagDetails.success, 'valid');
        } else {
          this.showToast(this.translations.messages.shoppingBagDetails.partial, 'warning');
        }
      } else if (response.type === "CART_ADD_PRODUCTS_FROM_SHOPPING_BAG_FAILURE") {
        this.showToast(this.translations.messages.shoppingBagDetails.error, 'error');
      } */
      // no else
    } catch (e) {
      this.showToast(this.translations.messages.shoppingBagDetails.error, 'error');
    }
  }

  private showToast(message: string, type: string): void {
    /* DS_eventDispatch(
      ['body'],
      'toaster_show_event',
      {
        message,
        type,
        closingDelay: 5000
      }
    ); */
    console.log(message, type);
  }

  /**
   * Show/hide shopping bag delete confirmation message
   */
  toggleDeleteMessage(): void {
    const { isDeleteMessageShown } = this;
    this.isDeleteMessageShown = !isDeleteMessageShown;
  }

  initModal() {
    this.modal = document.getElementById('modal-confirm-age') || null;
    if (this.modal) {
      this.modal.handleConfirmClick = async () => {
        this.isAgeLegal = true;
        /* await this.CartUpdateAction({
          cartId: this.cartId,
          isAgeLegal: this.isAgeLegal
        });
 */
        this.addShoppingBagProductsToCart();
      }
    }
  }

  render() {
    const { id, isEditable, name, products } = this.shoppingBag;
    const shoppingBagName = isEditable ? name : this.translations.favorites;
    const productCount = products ? products.length : 0;
    const total = this.getTotal();

    return (
      <div class={{
        "ds-shopping-bag-details": true,
        "--favorite": !isEditable
      }}>

        <ds-shopping-bag-name
          name={shoppingBagName}
          isDisabled={!isEditable}
          toggleDeleteMessage={this.toggleDeleteMessage}
          requestUpdateShoppingBag={this.updateShoppingBag}
        />
        <menu class={{
          "display-block": /* DS_isMobile() && */ this.isDeleteMessageShown,
        }}>
          {this.isDeleteMessageShown ? (
            <Fragment>
              <div>
                {this.translations.deleteMessage}
              </div>
              <button
                type="button"
                class={{
                  "ds-shopping-bag-button": true,
                  "--cancel": true
                }}
                onClick={this.toggleDeleteMessage}
              >
                {this.translations.buttons.cancel}
              </button>
              <button
                type="button"
                class={{
                  "ds-shopping-bag-button": true,
                  "--ok": true
                }}
                onClick={this.deleteButtonClickHandler}
              >
                {this.translations.buttons.ok}
              </button>
            </Fragment>
          ) : (
              <Fragment>
                <button
                  type="button"
                  class={{
                    "ds-shopping-bag-button": true,
                    "--back": true
                  }}
                  onClick={this.requestNavigationBack}
                >
                  {this.translations.buttons.back}
                </button>
                <div class="ds-shopping-bag-details__item-count">
                  {this.translations[productCount > 1 ? "productsCount" : "productCount"].replace('%products%', productCount)}
                </div>
              </Fragment>
            )}
        </menu>

        {productCount > 0 && (
          <ds-shopping-bag-products
            products={products}
            selectedProductIds={this.selectedProductIds}
            toggleProductSelection={this.toggleProductSelection}
            shoppingBagId={id}
          />
        )}

        {/* DS_isMobile() &&  */(
          <button
            type="button"
            class={{
              "ds-shopping-bag-button": true,
              "--delete-alt": true
            }}
            onClick={this.deleteProducts}
          >
            {this.translations.buttons.delete}
          </button>
        )}

        {productCount > 0 && (
          <footer>
            {isEditable && /* !DS_isMobile() && */ (
              <button
                type="button"
                class={{
                  "ds-shopping-bag-button": true,
                  "--delete-alt": true
                }}
                onClick={this.deleteProducts}
              >
                {this.translations.buttons.delete}
              </button>
            )}
            <div class="ds-shopping-bag-details__total">
              <div class="ds-shopping-bag-details__price">
                <span>
                  {productCount} {this.translations[productCount > 1 ? "products" : "product"]}
                </span>
                <strong>
                  {total}
                </strong>
              </div>
              <button
                class={{
                  "ds-shopping-bag-button": true,
                  "--add-to-cart": true
                }}
                onClick={this.addToCartButtonClickHandler}
                disabled={productCount === 0}
              >
                {this.translations.buttons.addToCart}
              </button>
            </div>
          </footer>
        )}
      </div>
    );
  }
}
