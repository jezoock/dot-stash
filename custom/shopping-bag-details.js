import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { F as Fragment } from './index2.js';
import { t as translations } from './translations.js';
import { d as defineCustomElement$2 } from './shopping-bag-name.js';
import { d as defineCustomElement$1 } from './shopping-bag-products.js';

const shoppingBagDetailsCss = ".gbx-shopping-bag-details{}";

const GreenboxShoppingBagDetails = /*@__PURE__*/ proxyCustomElement(class GreenboxShoppingBagDetails extends HTMLElement {
  request_quantityUpdate_eventHandler({ detail }) {
    this.productInputQuantity_change_eventHandlerDebounced(detail);
  }
  constructor() {
    super();
    this.__registerHost();
    var _a, _b;
    this.translations = translations[this.locale].gbx_shoppingBag;
    this.isAlcohol = false;
    this.productInputQuantity_change_eventHandlerDebounced = ({ productId, quantity }) => {
      this.shoppingBag.products.forEach(product => {
        const newProduct = Object.assign({}, product);
        if (product.id === productId) {
          newProduct.quantity = quantity;
          newProduct.totalPrice = newProduct.unitPrice * newProduct.quantity / newProduct.quantityUnitNumber;
        }
      });
      /* this.ShoppingBagUpdateProductsAction({ shoppingBagId: this.shoppingBag.id, products: products }); */
    }; /* , 500, false); */
    this.shoppingBag = {};
    this.locale = 'en';
    this.requestUpdateShoppingBag = undefined;
    this.requestDeleteShoppingBagProducts = undefined;
    this.requestNavigationBack = undefined;
    this.isAgeLegal = false;
    this.isDeleteMessageShown = false;
    this.cartId = undefined;
    this.selectedProductIds = ((_b = (_a = this.shoppingBag) === null || _a === void 0 ? void 0 : _a.products) === null || _b === void 0 ? void 0 : _b.map(({ id }) => id)) || [];
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
  getTotal() {
    return this.shoppingBag.products.length
      ? this.shoppingBag.products.map((p) => {
        return p.isAvailableInStore !== false
          ? p.totalPrice
          : 0;
      }).reduce((a, c) => {
        return a + c;
      })
      : 0;
  }
  /**
   * Call parent component method to update shopping bag informations
   * @param {string} shoppingBagName New shopping bag name
   */
  updateShoppingBag(updateData) {
    this.requestUpdateShoppingBag(this.shoppingBag.id, updateData);
  }
  /**
   * Call parent component method to delete shopping bag
   */
  deleteProducts() {
    const newProductsCopy = this.shoppingBag.products.map(product => {
      if (this.selectedProductIds.includes(product.id)) {
        return Object.assign(Object.assign({}, product), { quantity: 0 });
      }
      else {
        return product;
      }
    });
    console.log(newProductsCopy);
    /* this.ShoppingBagUpdateProductsAction({ shoppingBagId: this.shoppingBag.id, products: newProductsCopy }); */
  }
  deleteButtonClickHandler() {
    this.requestDeleteShoppingBagProducts(this.shoppingBag.id);
  }
  toggleProductSelection(productId) {
    if (this.selectedProductIds.includes(productId)) {
      this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
    }
    else {
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
  async addShoppingBagProductsToCart() {
  }
  showToast(message, type) {
    /* Greenbox_eventDispatch(
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
  toggleDeleteMessage() {
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
      };
    }
  }
  render() {
    const { id, isEditable, name, products } = this.shoppingBag;
    const shoppingBagName = isEditable ? name : this.translations.favorites;
    const productCount = products ? products.length : 0;
    const total = this.getTotal();
    return (h("div", { class: {
        "gbx-shopping-bag-details": true,
        "--favorite": !isEditable
      } }, h("gbx-shopping-bag-name", { name: shoppingBagName, isDisabled: !isEditable, toggleDeleteMessage: this.toggleDeleteMessage, requestUpdateShoppingBag: this.updateShoppingBag }), h("menu", { class: {
        "display-block": /* Greenbox_isMobile() && */ this.isDeleteMessageShown,
      } }, this.isDeleteMessageShown ? (h(Fragment, null, h("div", null, this.translations.deleteMessage), h("button", { type: "button", class: {
        "gbx-shopping-bag-button": true,
        "--cancel": true
      }, onClick: this.toggleDeleteMessage }, this.translations.buttons.cancel), h("button", { type: "button", class: {
        "gbx-shopping-bag-button": true,
        "--ok": true
      }, onClick: this.deleteButtonClickHandler }, this.translations.buttons.ok))) : (h(Fragment, null, h("button", { type: "button", class: {
        "gbx-shopping-bag-button": true,
        "--back": true
      }, onClick: this.requestNavigationBack }, this.translations.buttons.back), h("div", { class: "gbx-shopping-bag-details__item-count" }, this.translations[productCount > 1 ? "productsCount" : "productCount"].replace('%products%', productCount))))), productCount > 0 && (h("gbx-shopping-bag-products", { products: products, selectedProductIds: this.selectedProductIds, toggleProductSelection: this.toggleProductSelection, shoppingBagId: id })), (h("button", { type: "button", class: {
        "gbx-shopping-bag-button": true,
        "--delete-alt": true
      }, onClick: this.deleteProducts }, this.translations.buttons.delete)), productCount > 0 && (h("footer", null, isEditable && /* !Greenbox_isMobile() && */ (h("button", { type: "button", class: {
        "gbx-shopping-bag-button": true,
        "--delete-alt": true
      }, onClick: this.deleteProducts }, this.translations.buttons.delete)), h("div", { class: "gbx-shopping-bag-details__total" }, h("div", { class: "gbx-shopping-bag-details__price" }, h("span", null, productCount, " ", this.translations[productCount > 1 ? "products" : "product"]), h("strong", null, total)), h("button", { class: {
        "gbx-shopping-bag-button": true,
        "--add-to-cart": true
      }, onClick: this.addToCartButtonClickHandler, disabled: productCount === 0 }, this.translations.buttons.addToCart))))));
  }
  static get style() { return shoppingBagDetailsCss; }
}, [0, "gbx-shopping-bag-details", {
    "shoppingBag": [1032, "shopping-bag"],
    "locale": [1],
    "requestUpdateShoppingBag": [8, "request-update-shopping-bag"],
    "requestDeleteShoppingBagProducts": [8, "request-delete-shopping-bag-products"],
    "requestNavigationBack": [8, "request-navigation-back"],
    "isAgeLegal": [4, "is-age-legal"],
    "isDeleteMessageShown": [32],
    "cartId": [32],
    "selectedProductIds": [32]
  }, [[0, "request_quantityUpdate_event", "request_quantityUpdate_eventHandler"]]]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["gbx-shopping-bag-details", "gbx-shopping-bag-name", "gbx-shopping-bag-products"];
  components.forEach(tagName => { switch (tagName) {
    case "gbx-shopping-bag-details":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, GreenboxShoppingBagDetails);
      }
      break;
    case "gbx-shopping-bag-name":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
    case "gbx-shopping-bag-products":
      if (!customElements.get(tagName)) {
        defineCustomElement$1();
      }
      break;
  } });
}

export { GreenboxShoppingBagDetails as G, defineCustomElement as d };

//# sourceMappingURL=shopping-bag-details.js.map