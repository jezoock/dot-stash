import { Component, h, State, Prop, Watch, Listen } from "@stencil/core";
import { AnyHTMLElement } from "@stencil/core/internal/stencil-private";

@Component({
  tag: "ds-shopping-bag",
  styleUrls: [
    "shopping-bag.scss",
    "./scss/title.scss",
    "./scss/button.scss"
  ]
})

export class DSShoppingBag {

  @Prop({ reflect: true }) mode = "default";
  @Prop() pageName = "Grocery";
  @Prop() isAgeLegal = false;

  @State() list: any[] = [];
  @State() cart: any;
  @State() openCart: any;
  @State() settings: any;
  @State() shoppingBags: any[];
  @State() nameNewList: string;
  @State() editShoppingBag: any;
  @State() isModalShown = false;
  @State() isLogged = false;
  @State() isLoading = false;
  @State() loadingAddToCart = false;
  @State() state = "list";

  @Watch("isModalShown")
  isModalShownWatchHandler(newValue: any) {
    if (newValue === false) {
      // reset value:
      this.handleNavButtonClick();
    }
  }

  @Watch("loadingAddToCart")
  LoadingAddToCartHandler(newValue: any) {
    if (newValue === false) {
      /* DS_eventDispatch(
        ["ds-page-loader"],
        "close_page_loader_event"
      ); */
    } else if (newValue === true) {
      /* DS_eventDispatch(
        ["ds-page-loader"],
        "open_page_loader_event"
      ); */
    }
  }

  @Watch("openCart")
  cartCreatedHandler(newValue: any) {

    if (newValue === true) {
      this.isModalShown = false;
      // open cart
      /* DS_eventDispatch(
        ["ds-cart-block"],
        "request_cartBlockShow_event"
      ); */
    }
  }

  @Listen("request_shoppingbag_open")
  request_shoppingbag_openHandler() {
    this.toggleModal();
  }

  constructor() {
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
  updateShoppingBag(data: any): void {
    /* this.ShoppingBagUpdateAction({ ...data }); */
    console.log(data)
  }

  /**
   * Delete current shopping bag
   * @param {string} shoppingBagId Shopping bag id to delete
   * @returns {Promise<void>}
   */
  async deleteShoppingBag(shoppingBagId: string, products: any[]): Promise<void> {
    /* await this.ShoppingBagDeleteAction({ shoppingBagId: shoppingBagId, products }); */
    this.setState("list");
    console.log(shoppingBagId, products);
  }
  
  /**
   * Display selected shopping bag content
   * @param {string} shoppingBagId: Shopping bag id to display content of
   * @returns {Promise<void>}
  */
 async displayShoppingBag(shoppingBagId: string): Promise<void> {
   /* await this.ShoppingBagGetAction({ store: this.settings.storeId, shoppingBagId: shoppingBagId }); */
   this.setState("details")
   console.log(shoppingBagId);
  }

  /**
   * Create shopping bag
   * @param {string} name: Name of the shopping bag
   * @returns {Promise<void>}
   */
  async createShoppingBag(name: string): Promise<void> {
    /* await this.ShoppingBagCreateAction({ name: name }); */
    console.log(name);
    this.setState("list");
  }

  /**
   * Handle navigation in shopping bag modal
   */
  handleNavButtonClick(): void {
    const { state: currentState } = this;
    if (currentState === "list") {
      this.isModalShown = false;
    } else {
      this.setState("list");
    }
  }

  /**
   * Display/hide shopping bag modal
   */
  toggleModal(): void {
    if (this.isLogged) {
      const { isModalShown } = this;
      this.isModalShown = !isModalShown;
    } else {
      if (this.settings.isMobile) {
        /* DS_eventDispatch(["greenbox-header"], "request_sidebarToggle_event");
        DS_eventDispatch(["greenbox-menu"], "change_currentTab_event", 1); */
      }
      if (!this.settings.isMobile) {
        /* DS_eventDispatch(
          ["ds-account-block"],
          "open_connection_event"
        ); */
      }
    }
  }

  /**
   * Change component display state
   * @param {string} state Component state to display
   */
  setState(state: string): void {
    this.state = state;
  }

  /**
   * Render current modal state loading/details/list
   * @returns {AnyHTMLElement} JSX markup
   */
  renderState(): AnyHTMLElement {
    switch (this.state) {
      case "details":
        return this.editShoppingBag && (
          <ds-shopping-bag-details
            locale={this.settings.locale}
            shoppingBag={this.editShoppingBag}
            isAgeLegal={Boolean(this.cart.isAgeLegal)}
            requestDeleteShoppingBagProducts={(shoppingBagId: string, products: any[]) => {
              this.deleteShoppingBag(shoppingBagId, products);
            }}
            requestUpdateShoppingBag={(shoppingBagId, updateData) => {
              this.updateShoppingBag({ shoppingBagId, ...updateData });
            }}
            requestNavigationBack={() => {
              this.setState("list");
            }}
          />
        );
      case "list":
        return (
          <ds-shopping-bag-list
            locale={this.settings.locale}
            shoppingBags={this.shoppingBags}
            requestDisplayCreateForm={() => {
              this.setState("create");
            }}
            requestDisplayShoppingBag={shoppongBagId => {
              this.displayShoppingBag(shoppongBagId);
            }}
          />
        );
      case "create":
        return (
          <ds-shopping-bag-create-form
            locale={this.settings.locale}
            requestHideCreateForm={() => {
              this.setState("list");
            }}
            requestCreateShoppingBag={shoppingBagName => {
              this.createShoppingBag(shoppingBagName);
            }}
          />
        );
    }
  }

  render() {
    return (
      <div class={{
        "ds-shopping-bag": true,
        "--logged": this.isLogged,
        [`--${this.mode}`]: true
      }}>
        <button
          type="button"
          class="ds-shopping-bag__icon"
          onClick={this.toggleModal}
          data-cy={this.pageName + "_Button_ShoppingBag"}
        >
          <slot />
        </button>
        {this.isModalShown && (
          <ds-modal
            shown={this.isModalShown}
            onGbxModalClose={() => {
              this.isModalShown = false;
            }}
            isLayoutDisabled={true}
            overlay={true}
            lightboxClass={{
              "--page": this.settings.isMobile,
              "--dialog": window.innerWidth > 767
            }}
          >
            <div slot="content">
              {this.isLoading && (
                <ds-loader />
              )}
              <button type="button"
                class="ds-shopping-bag__nav-button"
                onClick={this.handleNavButtonClick}
              />
              <div class={`ds-shopping-bag__content --${this.state}`}>
                {this.renderState()}
              </div>
            </div>
          </ds-modal>
        )}
      </div>
    )
  }
}
