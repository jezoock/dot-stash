import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { d as defineCustomElement$6 } from './shopping-bag-create-form.js';
import { d as defineCustomElement$5 } from './shopping-bag-details.js';
import { d as defineCustomElement$4 } from './shopping-bag-list.js';
import { d as defineCustomElement$3 } from './shopping-bag-name.js';
import { d as defineCustomElement$2 } from './shopping-bag-products.js';

const shoppingBagCss = ".ds-shopping-bag-button{font-weight:600;border-radius:0.35rem;transition:opacity ease 0.4s;}.ds-shopping-bag-title{font-weight:700;display:flex;align-items:center;line-height:2rem;}.ds-shopping-bag{display:none;}";

const DSShoppingBag = /*@__PURE__*/ proxyCustomElement(class DSShoppingBag extends HTMLElement {
  isModalShownWatchHandler(newValue) {
    if (newValue === false) {
      // reset value:
      this.handleNavButtonClick();
    }
  }
  LoadingAddToCartHandler(newValue) {
  }
  cartCreatedHandler(newValue) {
    if (newValue === true) {
      this.isModalShown = false;
      // open cart
      /* DS_eventDispatch(
        ["ds-cart-block"],
        "request_cartBlockShow_event"
      ); */
    }
  }
  request_shoppingbag_openHandler() {
    this.toggleModal();
  }
  constructor() {
    super();
    this.__registerHost();
    this.mode = "default";
    this.pageName = "Grocery";
    this.isAgeLegal = false;
    this.list = [];
    this.cart = undefined;
    this.openCart = undefined;
    this.settings = undefined;
    this.shoppingBags = undefined;
    this.nameNewList = undefined;
    this.editShoppingBag = undefined;
    this.isModalShown = false;
    this.isLogged = false;
    this.isLoading = false;
    this.loadingAddToCart = false;
    this.state = "list";
    this.handleNavButtonClick = this.handleNavButtonClick.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }
  componentWillLoad() {
    /* this.store.mapStateToProps(this, state => {
      const {
        app: { settings },
        cart: { cart, openCart,
          loadingAddToCart },
        user: { logged },
        shoppingBag: {
          shoppingBags,
          loading,
          shoppingBag
        }
      } = state;
      return {
        cart: cart,
        openCart: openCart,
        settings: settings,
        shoppingBags: shoppingBags,
        isLogged: logged,
        isLoading: loading,
        loadingAddToCart: loadingAddToCart,
        editShoppingBag: shoppingBag
      };
    });

    this.store.mapDispatchToProps(this, {
      ShoppingBagCreateAction,
      ShoppingBagDeleteAction,
      ShoppingBagGetAction,
      ShoppingBagListAction,
      ShoppingBagUpdateAction
    }); */
  }
  /**
    * Update shopping bag informations
    * @param {any} data shopping bag informations to update
    */
  updateShoppingBag(data) {
    /* this.ShoppingBagUpdateAction({ ...data }); */
    console.log(data);
  }
  /**
   * Delete current shopping bag
   * @param {string} shoppingBagId Shopping bag id to delete
   * @returns {Promise<void>}
   */
  async deleteShoppingBag(shoppingBagId, products) {
    /* await this.ShoppingBagDeleteAction({ shoppingBagId: shoppingBagId, products }); */
    this.setState("list");
    console.log(shoppingBagId, products);
  }
  /**
   * Display selected shopping bag content
   * @param {string} shoppingBagId: Shopping bag id to display content of
   * @returns {Promise<void>}
  */
  async displayShoppingBag(shoppingBagId) {
    /* await this.ShoppingBagGetAction({ store: this.settings.storeId, shoppingBagId: shoppingBagId }); */
    this.setState("details");
    console.log(shoppingBagId);
  }
  /**
   * Create shopping bag
   * @param {string} name: Name of the shopping bag
   * @returns {Promise<void>}
   */
  async createShoppingBag(name) {
    /* await this.ShoppingBagCreateAction({ name: name }); */
    console.log(name);
    this.setState("list");
  }
  /**
   * Handle navigation in shopping bag modal
   */
  handleNavButtonClick() {
    const { state: currentState } = this;
    if (currentState === "list") {
      this.isModalShown = false;
    }
    else {
      this.setState("list");
    }
  }
  /**
   * Display/hide shopping bag modal
   */
  toggleModal() {
    if (this.isLogged) {
      const { isModalShown } = this;
      this.isModalShown = !isModalShown;
    }
  }
  /**
   * Change component display state
   * @param {string} state Component state to display
   */
  setState(state) {
    this.state = state;
  }
  /**
   * Render current modal state loading/details/list
   * @returns {AnyHTMLElement} JSX markup
   */
  renderState() {
    switch (this.state) {
      case "details":
        return this.editShoppingBag && (h("ds-shopping-bag-details", { locale: this.settings.locale, shoppingBag: this.editShoppingBag, isAgeLegal: Boolean(this.cart.isAgeLegal), requestDeleteShoppingBagProducts: (shoppingBagId, products) => {
            this.deleteShoppingBag(shoppingBagId, products);
          }, requestUpdateShoppingBag: (shoppingBagId, updateData) => {
            this.updateShoppingBag(Object.assign({ shoppingBagId }, updateData));
          }, requestNavigationBack: () => {
            this.setState("list");
          } }));
      case "list":
        return (h("ds-shopping-bag-list", { locale: this.settings.locale, shoppingBags: this.shoppingBags, requestDisplayCreateForm: () => {
            this.setState("create");
          }, requestDisplayShoppingBag: shoppongBagId => {
            this.displayShoppingBag(shoppongBagId);
          } }));
      case "create":
        return (h("ds-shopping-bag-create-form", { locale: this.settings.locale, requestHideCreateForm: () => {
            this.setState("list");
          }, requestCreateShoppingBag: shoppingBagName => {
            this.createShoppingBag(shoppingBagName);
          } }));
    }
  }
  render() {
    return (h("div", { class: {
        "ds-shopping-bag": true,
        "--logged": this.isLogged,
        [`--${this.mode}`]: true
      } }, h("button", { type: "button", class: "ds-shopping-bag__icon", onClick: this.toggleModal, "data-cy": this.pageName + "_Button_ShoppingBag" }, h("slot", null)), this.isModalShown && (h("ds-modal", { shown: this.isModalShown, onGbxModalClose: () => {
        this.isModalShown = false;
      }, isLayoutDisabled: true, overlay: true, lightboxClass: {
        "--page": this.settings.isMobile,
        "--dialog": window.innerWidth > 767
      } }, h("div", { slot: "content" }, this.isLoading && (h("ds-loader", null)), h("button", { type: "button", class: "ds-shopping-bag__nav-button", onClick: this.handleNavButtonClick }), h("div", { class: `ds-shopping-bag__content --${this.state}` }, this.renderState()))))));
  }
  static get watchers() { return {
    "isModalShown": ["isModalShownWatchHandler"],
    "loadingAddToCart": ["LoadingAddToCartHandler"],
    "openCart": ["cartCreatedHandler"]
  }; }
  static get style() { return shoppingBagCss; }
}, [4, "ds-shopping-bag", {
    "mode": [513],
    "pageName": [1, "page-name"],
    "isAgeLegal": [4, "is-age-legal"],
    "list": [32],
    "cart": [32],
    "openCart": [32],
    "settings": [32],
    "shoppingBags": [32],
    "nameNewList": [32],
    "editShoppingBag": [32],
    "isModalShown": [32],
    "isLogged": [32],
    "isLoading": [32],
    "loadingAddToCart": [32],
    "state": [32]
  }, [[0, "request_shoppingbag_open", "request_shoppingbag_openHandler"]]]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-shopping-bag", "ds-shopping-bag-create-form", "ds-shopping-bag-details", "ds-shopping-bag-list", "ds-shopping-bag-name", "ds-shopping-bag-products"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-shopping-bag":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSShoppingBag);
      }
      break;
    case "ds-shopping-bag-create-form":
      if (!customElements.get(tagName)) {
        defineCustomElement$6();
      }
      break;
    case "ds-shopping-bag-details":
      if (!customElements.get(tagName)) {
        defineCustomElement$5();
      }
      break;
    case "ds-shopping-bag-list":
      if (!customElements.get(tagName)) {
        defineCustomElement$4();
      }
      break;
    case "ds-shopping-bag-name":
      if (!customElements.get(tagName)) {
        defineCustomElement$3();
      }
      break;
    case "ds-shopping-bag-products":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
  } });
}

const GbxShoppingBag = DSShoppingBag;
const defineCustomElement = defineCustomElement$1;

export { GbxShoppingBag, defineCustomElement };

//# sourceMappingURL=ds-shopping-bag.js.map