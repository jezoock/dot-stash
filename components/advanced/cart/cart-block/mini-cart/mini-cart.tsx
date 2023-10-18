/* code reviewer ignore */

import {
  Component,
  h,
  Prop,
  Listen,
  Event,
  EventEmitter,
  State,
  Watch,
  Element,
} from "@stencil/core";
import Fragment from "stencil-fragment";
import { translations } from "./translations";
import {
  Greenbox_setTranslations,
  Greenbox_redirect,
  Greenbox_getAppSettings,
  Greenbox_sortCart,
  Greenbox_getAppTheme,
  Greenbox_formatPrice,
  Greenbox_eventDispatch,
  debounce,
} from "../../../../../../utils";
import { Translations } from "../../../../../interfaces";
import { ButtonLevel } from "../../../../../ui/button/button-level.enum";
import { PageName } from "../../../../../../enums/page-name.enum";
import { Cart } from "../../../../../../../api-types";
import { CartUpdateProperty } from "./cart-update-property";
import { AnyHTMLElement } from "@stencil/core/internal";
import { TooltipPosition } from "../../../../../ui/tooltip/tooltip-position.enum";
import { TitleType } from "../../../../../ui/title/title-type.enum";
import GreenboxAPI from '../../../../../../_redux/services';

@Component({
  tag: "gbx-mini-cart",
  styleUrls: ["./mini-cart.scss"],
})
export class GreenboxMiniCart {
  //#region PROPS

  @Element() cartContainer: HTMLDivElement;

  @Prop() isActive: boolean;
  @Prop({ mutable: true }) isLoggedIn: boolean = false;
  @Prop({ mutable: true, reflect: true }) cart: any;
  @Prop({ mutable: true, reflect: true }) maxDisplayedProductCount: number = 3;
  @Prop() isUserLoggedIn: boolean;
  @Prop() locale: string;

  @State() loadingCartItems: any = {};
  @State() isMovModalShown: boolean = false;
  @State() isModalErrorShown: boolean = false;
  @State() error: { isBlocking: boolean, label: string } = { isBlocking: false, label: '' };
  @State() askForConfirmation: boolean = false;
  @State() contentLayerHeight: number = 0;
  @State() isCollapsed: boolean = true;

  actionToConfirm: string = "productDelete";
  confirmData: any;
  minAmountOrder: any;
  user: any;

  translations: Translations = Greenbox_setTranslations( translations, "gbx_miniCart" );
  appTheme: string = Greenbox_getAppTheme();

  displayedContentHeight: number = 0;
  visibleRowsHeight: number = 0;
  contentHeight: number = 0;
  isCollapsible: boolean = false;
  addedProductToogle: boolean = true;

  @Watch("cart")
  cartWatcher(newCart, oldCart) {
    if (newCart && oldCart && newCart.updatedAt !== oldCart.updatedAt || (newCart && !oldCart) ) {
      this.setExpansionState(newCart.products.length);
      this.stateChangeHandler(newCart);
    }
  }

  //#endregion

  //#region EVENTS

  @Event() request_cartRemove_event: EventEmitter;
  @Event() request_cartItemQuantityUpdate_event: EventEmitter;
  @Event() request_cartUpdate_event: EventEmitter<CartUpdateProperty<'noteToStore' | 'id' | 'deliveryMode'>>;
  @Event() request_cartProductEditModalDisplay_event: EventEmitter;
  @Event() request_authModalOpen_event: EventEmitter;
  @Event() request_snackbarOpen_event: EventEmitter;

  @Listen("request_contentCheck_event")
  request_contentCheck_eventHandler() {
    this.cartContentChangeHandler();
  }

  @Listen("request_cartContentDisplayToggle_event")
  request_cartContentDisplayToggle_eventHandler({ detail: { mustShow }}) {
    this.toggleContentDisplay(mustShow);
  }

  @Listen("request_productEditModalDisplay_event")
  request_productEditModalDisplay_eventHandler(event) {
    event.stopPropagation();
    event.preventDefault();

    const {
      detail: { product },
    } = event;
    this.request_cartProductEditModalDisplay_event.emit({
      product,
      cart: this.cart,
    });
  }

  @Listen("request_quantityUpdate_event")
  request_quantityUpdate_eventHandler({ detail }) {
    this.handleOnUpdateQuantity(detail);
  }

  @Listen("request_noteUpdate_event")
  request_cart_update_eventHandler({
    detail: { noteToStore },
  }: {
    detail: Pick<Cart, "noteToStore" | "id">;
  }) {
    this.request_cartUpdate_event.emit({ noteToStore, id: this.cart.id });
  }

  @Listen("request_switchToClickAndCollect_event")
  request_switchToClickAndCollect_eventHandler() {
    if (this.cart.type === "grocery") {
      this.request_cartUpdate_event.emit({
        deliveryMode: "takeaway",
        id: this.cart.id,
      });
    }
  }

  @Listen("request_pendingRequestStatusUpdate_event")
  request_pendingRequestStatusUpdate_eventHandler({ detail: { id } }) {
    this.updatePendingRequests(id, false);
  }

  @Listen("notify_cartRequestResolved_event")
  notify_cartRequestResolved_eventHandler({ detail: { success, message, payload, displayMessage } }) {
    const { productId } = payload;
    this.updatePendingRequests(productId, false);
    this.cartContentChangeHandler();

    if (success && displayMessage) {
      const eventDetails = {
        type: message,
      }

      if(this.addedProductToogle){
        this.request_snackbarOpen_event.emit( eventDetails );
      }
      this.addedProductToogle = true;
    }
  }

  @Listen("notify_cartRequestStalled_event")
  notify_cartRequestStalled_eventHandler({detail: stalledRequestPayload}) {
    const { type } = stalledRequestPayload;
    const eventDetails = {
      type,
      undoHandler: () => {
        this.undoQuantityUpdate( stalledRequestPayload.product.id, stalledRequestPayload.product.previousQuantity );
        if (type === "item-removed") {
          this.undoQuantityUpdate(stalledRequestPayload.product.id, 1);
          this.toggleProductDisplay( stalledRequestPayload.product.id, true );
          this.removeLoadersfromProducts();
          this.addedProductToogle = false;
        }
      },
      closeHandler: () => {
        this.request_cartItemQuantityUpdate_event.emit(stalledRequestPayload);
        // Wait for the toaster to close before to remove the loaders from products
        setTimeout(() =>  this.removeLoadersfromProducts(), 500);
      }
    }
    this.request_snackbarOpen_event.emit( eventDetails );
    this.addedProductToogle = true;
  }

  //#endregion

  //#region LIFECYCLE

  constructor() {
    this.checkoutButtonClickHandler = this.checkoutButtonClickHandler.bind(this);
    this.addItemsButtonClickHandler = this.addItemsButtonClickHandler.bind(this);
    this.addMoreItemsButtonClickHandler = this.addMoreItemsButtonClickHandler.bind(this);
    this.deleteCartButtonClickHandler = this.deleteCartButtonClickHandler.bind(this);
    this.keepCartButtonClickHandler = this.keepCartButtonClickHandler.bind(this);
    this.inactiveCartClickHandler = this.inactiveCartClickHandler.bind(this);
    this.confirmProductDeleteHandler = this.confirmProductDeleteHandler.bind(this);
    this.cancelProductDeleteHandler = this.cancelProductDeleteHandler.bind(this);
    this.confirmCartDeleteHandler = this.confirmCartDeleteHandler.bind(this);
    this.cancelCartDeleteHandler = this.cancelCartDeleteHandler.bind(this);
    this.expandButtonClickHandler = this.expandButtonClickHandler.bind(this);
    this.okModalErrorClickHandler = this.okModalErrorClickHandler.bind(this);
    this.windowResizeHandler = this.windowResizeHandler.bind(this);
    this.redirectToStore = this.redirectToStore.bind(this);

    this.stateChangeHandler(this.cart);
  }

  componentWillLoad() {
    this.setExpansionState((this.cart?.products || []).length);
  }

  componentDidLoad() {
    window.addEventListener("resize", this.windowResizeHandler, false);
  }

  componentDidRender() {
    this.cartContentChangeHandler();
  }

  //#endregion

  handleOnUpdateQuantity({
    id,
    ref,
    quantity,
    quantityUpdate,
    combinationChoices,
  }) {
    const { id: cartId, store: storeId } = this.cart;
    const productData = {
      cartId,
      storeId,
      product: {
        id,
        ref,
        quantity,
        quantityUpdate,
        combinationChoices,
        previousQuantity: quantity - quantityUpdate,
      },
    };

    this.confirmData = productData;
    if (quantity === 0) {
      this.actionToConfirm = "productDelete";
      this.askForConfirmation = true;
      //Prevents the user from clicking on the cart while the article is being deleted
      if(this.cart.products.length){
        this.cart.products.forEach(product => {
          this.updatePendingRequests(product.id, true)
        });
      }
    } else {
      this.updatePendingRequests(id, true);
      this.requestQuantityUpdate(quantityUpdate < 0);
    }
  }

  setExpansionState(productCount = 0) {
    const { isCollapsed } = this;
    this.isCollapsible = productCount > this.maxDisplayedProductCount;
    this.isCollapsed = !this.isCollapsible ? true : isCollapsed;
  }

  undoQuantityUpdate( productId: string, previousQuantity: number ): void {
    Greenbox_eventDispatch(
      `#cart-product-${productId} gbx-mini-cart-quantity-selector`,
      "request_quantitySet_event",
      { quantity: previousQuantity }
    );
    Greenbox_eventDispatch(
      `#cart-product-${productId}`,
      "notify_productQuantityInputChange_event",
      { quantity: previousQuantity }
    );
    this.updatePendingRequests(productId, false);
  }

  requestQuantityUpdate(isUndoable: boolean = false): void {
    this.request_cartItemQuantityUpdate_event.emit({...this.confirmData, isUndoable});
    this.confirmData = null;
  }

  requestCartDelete() {
    this.askForConfirmation = false;
    this.request_cartRemove_event.emit({ id: this.cart.id });
  }

  stateChangeHandler = (newCart) => {
    let blockingError: boolean = false;
    let errorLabel: string = "";

    if (
      !newCart.deliveryAddress ||
      !newCart.deliveryAddress.formatted ||
      !newCart.deliveryDeadline
    ) {
      errorLabel = this.translations.errors.missingDeliveryInformation;
      blockingError = true;
    }

    if (newCart.errors && newCart.errors.length) {
      newCart.errors.map((err) => {
        switch (err.error) {
          case "distanceNotFound":
            errorLabel = this.translations.errors.distanceNotFound;
            blockingError = true;
            break;
          case "deliveryAddressTooFarFromStore":
            errorLabel = this.translations.errors.distanceTooFar;
            blockingError = true;
            break;
          case "productUnavailable":
            newCart.products.map((item) => {
              if (item.refProduct == err.details.refProduct) {
                item.unavailable = true;
              }
            });
            errorLabel = this.translations.errors.productUnavailable;
            blockingError = true;
            break;
          case "productPriceChanged":
            if (newCart.products && newCart.products.length > 0) {
              newCart.products.map((item) => {
                if (item.refProduct == err.details.refProduct) {
                  item.unitPrice = err.details.newPrice;
                  item.totalPrice =
                    (item.unitPrice * item.quantity) / item.quantityUnitNumber;
                }
              });
            }
            break;
          default:
            errorLabel = this.translations.errors.default;
            const deadlineError = newCart.errors.find((error) =>
              [
                "isAsapDeliveryDeadlineReschedule",
                "deliveryDeadlineRescheduled",
                "preOrderDeliveryDeadlineToAsap",
              ].includes(error.error)
            );
            blockingError = !deadlineError;
            break;
        }
      });
    }

    this.error = {
      isBlocking: blockingError,
      label: errorLabel,
    };
  };

  /**
   * Update loading children component array
   * @param {string} productId id of product which loading has to be updated
   * @param {boolean} isLoading new status
   */
  updatePendingRequests(productId: string, isLoading: boolean): void {
    const { loadingCartItems } = this;
    if (productId) {
      loadingCartItems[productId] = isLoading;
    } else {
      for (let loadState in loadingCartItems) {
        loadingCartItems[loadState] = false;
      }
    }
    this.loadingCartItems = { ...loadingCartItems };
  }

  getButtonHeight() {
    const toggleButton = this.cartContainer.querySelector(
      ".gbx-mini-cart__expand-button"
    ) as AnyHTMLElement;
    let buttonHeight = 0;
    if (this.isCollapsible && toggleButton) {
      buttonHeight = toggleButton.offsetHeight;
    }
    return buttonHeight;
  }

  redirectToStore() {
    Greenbox_redirect(this.cart.storeFullUrl);
  }

  toggleProductDisplay(productId: string, mustShow: boolean): void {
    const product = this.cartContainer.querySelector(`#cart-product-${productId}`) as AnyHTMLElement;
    if (product) {
      if (mustShow) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
        this.setExpansionState(this.cart.products.length-1);
      }
      this.cartContentChangeHandler();
    }
  }

  toggleContentDisplay(mustShow: boolean): void {
    const content = this.cartContainer.querySelector(".gbx-mini-cart__content") as AnyHTMLElement;
    if (content) {
      content.style.display = mustShow ? 'block' : 'none';
    }
  }

  isOnShopPage(): boolean {
    return window.location.href.includes(this.cart.storeUrl);
  }

  isSmallFeeShown(): boolean {
    return (
      this.cart.productCount > 0 &&
      this.cart?.fees &&
      this.cart.fees.smallFee > 0 &&
      this.cart.totalProducts < this.cart.fees.minTotalProducts
    );
  }

  //#region HANDLERS

  windowResizeHandler = debounce( () => {
    this.cartContentChangeHandler();
  }, 100);

  cartContentChangeHandler() {
    const products = this.cartContainer.querySelectorAll(
      ".gbx-mini-cart__item"
    );
    const buttonHeight = this.getButtonHeight();

    let totalHeight = 0;
    let visibleRowsHeight = 0;
    let indexWithExcludedProducts = 0;

    products.forEach(prod => {
      const prodComponent = prod.querySelector("gbx-mini-cart-item");
      // If product is visible
      if (prodComponent.offsetParent) {
        const productRowHeight = (prod as AnyHTMLElement).offsetHeight;
        if (indexWithExcludedProducts < this.maxDisplayedProductCount) {
          visibleRowsHeight += productRowHeight;
        }
        totalHeight += productRowHeight;
        indexWithExcludedProducts++;
      }
    });

    this.contentHeight = totalHeight;
    this.visibleRowsHeight = visibleRowsHeight;

    if (this.isCollapsed) {
      this.contentLayerHeight = this.visibleRowsHeight + buttonHeight;
      this.displayedContentHeight = this.visibleRowsHeight;
    } else {
      this.contentLayerHeight = this.contentHeight + buttonHeight;
      this.displayedContentHeight = this.contentHeight;
    }
  }

  addItemsButtonClickHandler(): void {
    this.redirectToStore();
  }

  addMoreItemsButtonClickHandler(): void {
    if (this.isOnShopPage()) {
      this.isMovModalShown = false;
    } else {
      this.redirectToStore();
    }
  }

  inactiveCartClickHandler() {
    this.redirectToStore();
  }

  keepCartButtonClickHandler(): void {
    this.isMovModalShown = false;
    this.checkoutButtonClickHandler(true);
  }

  deleteCartButtonClickHandler(): void {
    this.actionToConfirm = "cartDelete";
    this.askForConfirmation = true;
    if (this.isMovModalShown) {
      this.isMovModalShown = false;
    }
  }

  async checkoutButtonClickHandler(feeBypass = false): Promise<void> {
    this.minAmountOrder = this.cart?.fees?.minTotalProducts || 0;
    const { isLoggedIn } = this;

    if (this.cart.productCount > 0 && (this.cart.totalProducts < this.cart.minTotalProducts)) {
      this.isModalErrorShown = true;
    } else {
      if (this.isSmallFeeShown() && !feeBypass) {
        this.isMovModalShown = true;
      } else if (!isLoggedIn) {
        this.request_authModalOpen_event.emit({ redirectToCheckout: true });
      } else if (!this.error.isBlocking && this.cart.totalProducts > 0 && Greenbox_getAppSettings().checkoutUrl) {
        try {
          await GreenboxAPI.redirectToCheckout(this.cart.id);
          Greenbox_redirect(Greenbox_getAppSettings().checkoutUrl);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  okModalErrorClickHandler() {
    this.isModalErrorShown = false;
  }

  confirmProductDeleteHandler() {
    this.requestQuantityUpdate(true);
    this.askForConfirmation = false;
  }

  cancelProductDeleteHandler() {
    this.undoQuantityUpdate(this.confirmData.product.id, 1);
    this.confirmData = null;
    this.addedProductToogle = false;
    this.askForConfirmation = false;
    this.removeLoadersfromProducts();
  }

  removeLoadersfromProducts(){
    this.cart.products?.forEach(product => {
      this.updatePendingRequests(product.id, false)
    })
  }

  confirmCartDeleteHandler() {
    this.requestCartDelete();
  }

  cancelCartDeleteHandler() {
    this.askForConfirmation = false;
  }

  expandButtonClickHandler() {
    const { isCollapsed } = this;
    if (isCollapsed) {
      this.displayedContentHeight = this.contentHeight;
      this.isCollapsed = false;
    } else {
      this.displayedContentHeight = this.visibleRowsHeight;
      this.isCollapsed = true;
    }
  }

  //#endregion

  render() {
    const isLoading = Object.values(this.loadingCartItems).reduce( (acc, state) => acc || state, false ) as boolean;

    const { products, storeLogo, storeName, storeFullUrl, totalProducts } = this.cart;
    const isActive = this.isActive || this.cart.isActive;
    const enableNextStep = !isLoading && !this.error.isBlocking && isActive && totalProducts > 0;
    const isCartEmpty = !(products?.length > 0);

    // uncomment the real canSwitchToTakeaway when everything it needs is implemented
    // const canSwitchToTakeaway = this.cart.deliveryMode !== "takeaway" && this.cart?.availableDeliveryModes?.includes("takeaway");
    const canSwitchToTakeaway = false;
    const reducibleAmountFromTakeaway = +(+Greenbox_getAppSettings().clickNCollectCashbackAmount * totalProducts).toFixed(2);

    return (
      <div
        class={{
          "gbx-mini-cart": true,
          "--snack": true,
          "--empty": isCartEmpty,
          "--filled": !isCartEmpty,
          "--active": isActive,
          "--inactive": !isActive,
          "--collapsible": this.isCollapsible,
          "--show-content": !this.isCollapsed,
        }}
      >
        {!isActive && (
          <div
            class="gbx-mini-cart__inactivity-overlay"
            onClick={this.inactiveCartClickHandler}
          />
        )}
        {this.isSmallFeeShown() && (
          <div class="gbx-mini-cart__smallfee">
            <gbx-tooltip icon="info" position={TooltipPosition.BOTTOM_LEFT}>
              <div slot="message">
                {this.translations.text.smallFeeMessage.replace(
                  "%mintotalproducts%",
                  (this.cart?.fees?.minTotalProducts / 100).toFixed(2)
                )}
              </div>
            </gbx-tooltip>
            <span>
              {this.translations.text.smallFee
                .replace(
                  "%mintotalproducts%",
                  (this.cart?.fees?.minTotalProducts / 100).toFixed(2)
                )
                .replace(
                  "%smallfee%",
                  (this.cart?.fees?.smallFee / 100).toFixed(2)
                )}
            </span>
          </div>
        )}
        <gbx-title
          slot="title"
          titleType={TitleType.HEADING}
          titleMods={["block", "cart"]}
          heading={3}
          useSnack={true}
          dataCy={{
            pageName: PageName.MINICART,
            elementName: "miniCartTitle",
          }}
        >
          {isActive ? this.translations.title.activeCart : this.translations.title.inactiveCart}
        </gbx-title>
        <snk-mini-cart-header
          class="gbx-mini-cart__store"
          store={{
            fullLogoUrl: `${Greenbox_getAppSettings().cdnURL}${storeLogo}`,
            name: storeName,
            fullUrl: storeFullUrl,
            type: this.cart.type,
          }}
        >
          {isActive && (
            <Fragment>
              <gbx-button
                slot="actions"
                buttonType="button"
                buttonLevel={ButtonLevel.LINK}
                buttonMods={["default", "cart-block", "delete"]}
                onClick={this.deleteCartButtonClickHandler}
                useSnack={true}
              >
                {this.translations.button.remove}
              </gbx-button>
              {!this.isOnShopPage() && !!this.cart.storeFullUrl && (
                <gbx-button
                  slot="actions"
                  buttonType="button"
                  useSnack={true}
                  buttonLevel={ButtonLevel.LINK}
                  buttonMods={["default", "cart-block", "add-items"]}
                  onClick={this.addItemsButtonClickHandler}
                >
                  {this.translations.button.addItems}
                </gbx-button>
              )}
            </Fragment>
          )}
        </snk-mini-cart-header>

        {!isCartEmpty && (
          <div
            class="gbx-mini-cart__body"
            style={{ height: `${this.contentLayerHeight}px` }}
          >
            <div class="gbx-mini-cart__content">
              <ul style={{ maxHeight: `${this.displayedContentHeight}px` }}>
                {products.sort(Greenbox_sortCart).map((product) => (
                  <li class="gbx-mini-cart__item">
                    {this.loadingCartItems[product.id] && (
                      <gbx-loader mode={["mini-cart-item"]} />
                    )}
                    <gbx-mini-cart-item
                      id={`cart-product-${product.id}`}
                      item={product}
                      isCartActive={isActive}
                    />
                  </li>
                ))}
              </ul>

              {this.isCollapsible && (
                <gbx-button
                  class="gbx-mini-cart__expand-button"
                  useSnack={true}
                  buttonType="button"
                  buttonMods={[
                    "cart-block",
                    "toggle-content",
                    this.isCollapsed ? "expand" : "collapse",
                  ]}
                  onClick={this.expandButtonClickHandler}
                >
                  {
                    this.translations.button[
                      this.isCollapsed ? "showMore" : "showLess"
                    ]
                  }
                </gbx-button>
              )}
            </div>
          </div>
        )}

        {this.askForConfirmation && (
          <Fragment>
            {this.actionToConfirm === "productDelete" && (
              <snk-confirm-modal
                onSnkConfirm={this.confirmProductDeleteHandler}
                onSnkCancel={this.cancelProductDeleteHandler}
              >
                <span slot="message">
                  {this.translations.modal.text.productDeleteConfirm}
                </span>
              </snk-confirm-modal>
            )}
            {this.actionToConfirm === "cartDelete" && (
              <snk-confirm-modal
                onSnkConfirm={this.confirmCartDeleteHandler}
                onSnkCancel={this.cancelCartDeleteHandler}
              >
                <span slot="message">
                  {this.translations.modal.text.cartDeleteConfirm}
                </span>
              </snk-confirm-modal>
            )}
          </Fragment>
        )}

        {this.isModalErrorShown && (
          <gbx-modal
            shown={true}
            isClosingDisabled={true}
            lightboxClass={{
              "--min-order": true,
            }}
          >
            <div slot="content">
              <gbx-title
                titleMods={["block", "cart"]}
                titleType={TitleType.HEADING}
                heading={3}
              >
                {this.translations.modal.text.orderError}
              </gbx-title>
              <p>
                {this.translations.modal.text.orderErrorMessage.replace(
                  "%minTotalProducts%",
                  (this.cart.minTotalProducts / 100).toFixed(2)
                )}
              </p>
              <gbx-button
                useSnack={true}
                buttonLevel={ButtonLevel.PRIMARY}
                buttonMods={["label", "default"]}
                onGbxButtonClick={this.okModalErrorClickHandler}
                dataCy={{
                  pageName: PageName.MINICART,
                  elementName: "miniCartOkModalErrorButton",
                }}
              >
                {this.translations.modal.button.ok}
              </gbx-button>
            </div>
          </gbx-modal>
        )}

        {this.isMovModalShown && (
          <snk-confirm-modal
            onSnkConfirm={this.addMoreItemsButtonClickHandler}
            onSnkCancel={this.keepCartButtonClickHandler}
          >
            <span slot="message">
              {this.translations.modal.text.minOrderAmount.replace(
                "%smallFee%",
                (this.cart.smallFee / 100).toFixed(2)
              ).replace(
                "%minAmountToOrder%",
                (this.minAmountOrder / 100).toFixed(2)
              )}
            </span>
            <span slot="labelConfirmButton">
              {this.translations.modal.text.addMoreItems}
            </span>
            <span slot="labelCancelButton">
              {this.translations.modal.text.cancelOrder}
            </span>
          </snk-confirm-modal>
        )}

        <footer class="gbx-mini-cart__footer">
          <snk-store-note
            note={this.cart.noteToStore}
            isCartActive={isActive}
          />
          {isActive && canSwitchToTakeaway && (
            <snk-click-and-collect-toggle
              cartId={this.cart.id}
              reducibleAmount={(reducibleAmountFromTakeaway / 100).toFixed(2)}
              reduciblePercentage={+Greenbox_getAppSettings().clickNCollectCashbackAmount * 100}
            />
          )}
          <gbx-button
            slot="header"
            buttonType="button"
            isDisabled={!enableNextStep}
            useSnack={true}
            buttonLevel={ButtonLevel.PRIMARY}
            buttonMods={["label", "default", "cart-block", "checkout"]}
            onClick={() => this.checkoutButtonClickHandler()}
            dataCy={{
              pageName: PageName.MINICART,
              elementName: "miniCartCheckout",
            }}
            class="gbx-mini-cart__checkout-button"
          >
            <span class="gbx-mini-cart__checkout-prompt">
              {this.translations.button.checkout}
            </span>
            <strong class="gbx-mini-cart__subtotal">
              {Greenbox_formatPrice({
                price: totalProducts,
                cents: true,
                isFrCurrency: false,
              })}
            </strong>
          </gbx-button>
        </footer>
      </div>
    );
  }
}
