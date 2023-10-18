import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';

const shoppingBagProductsCss = ".gbx-shopping-bag-products{padding:2rem 0}";

const GreenboxShoppingBagProducts = /*@__PURE__*/ proxyCustomElement(class GreenboxShoppingBagProducts extends HTMLElement {
  componentWillLoad() {
    /* this.store.mapDispatchToProps(this, ({
      ShoppingBagUpdateProductsAction,
    })); */
  }
  request_shoppingBagProductUpdate_eventHandler(event) {
    const { id, quantity } = event.detail;
    event.stopPropagation();
    const productsClone = [...this.products];
    const productToUpdate = productsClone.find(({ refProduct }) => refProduct === id);
    if (productToUpdate) {
      productToUpdate.quantity = quantity;
    }
    this.ShoppingBagUpdateProductsAction({
      shoppingBagId: this.shoppingBagId,
      products: productsClone.map(({ externalRefProduct, quantity }) => ({ externalRefProduct, quantity })),
    });
  }
  constructor() {
    super();
    this.__registerHost();
    this.products = [];
    this.ShoppingBagUpdateProductsAction = undefined;
    this.toggleProductSelection = undefined;
    this.shoppingBagId = undefined;
    this.selectedProductIds = undefined;
    this.toggleProductSelection = this.toggleProductSelection.bind(this);
  }
  render() {
    return (h("div", { class: "gbx-shopping-bag-products" }, this.products.map(product => (h("gbx-cart-item", { item: product, isSelected: this.selectedProductIds.includes(product.id), toggleSelect: this.toggleProductSelection, itemImage: product.image ? product.image : 'unavailable' })))));
  }
  static get style() { return shoppingBagProductsCss; }
}, [0, "gbx-shopping-bag-products", {
    "products": [16],
    "ShoppingBagUpdateProductsAction": [8, "shopping-bag-update-products-action"],
    "toggleProductSelection": [16],
    "shoppingBagId": [513, "shopping-bag-id"],
    "selectedProductIds": [16]
  }, [[0, "request_shoppingBagProductUpdate_event", "request_shoppingBagProductUpdate_eventHandler"]]]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["gbx-shopping-bag-products"];
  components.forEach(tagName => { switch (tagName) {
    case "gbx-shopping-bag-products":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, GreenboxShoppingBagProducts);
      }
      break;
  } });
}

export { GreenboxShoppingBagProducts as G, defineCustomElement as d };

//# sourceMappingURL=shopping-bag-products.js.map