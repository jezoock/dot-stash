import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import { SNACKBAR_OPTIONS } from './snackbar-options';

@Component({
  tag: "ds-cart-block",
  styleUrls: [
    "cart-block.scss",
    "./scss/sidebar.scss",
    "./scss/title.scss",
    "./scss/button.scss",
  ],
})
export class DSCartBlock {
  //#region PROPS

  @Prop({ mutable: true }) carts: any[] = [];
  @Prop() activeCartId: string;
  @Prop({ mutable: true, reflect: true }) isLoggedIn = false;

  @State() showContent = false;
  @State() popState = true;
  @State() snackBar: any;/* SnackbarOptions = {
    isSnackBarShown: false,
    message: "",
    undoLabel: "",
    type: "",
    closingDelay: 2000,
    onUndo: () => {},
    onClose: () => {}
  }; */

  translations: any;
  sidebar: HTMLDsSidebarElement;
  timeout: NodeJS.Timeout;

  //#endregion

  //#region EVENTS

  @Event() dsCartBlockHide: EventEmitter;
  @Event() dsCartBlockHidden: EventEmitter;
  @Event() dsCartBlockShow: EventEmitter;
  @Event() dsCartBlockShown: EventEmitter;

  @Event() request_cartDelete_event: EventEmitter;

  //#region BLOCK DISPLAY LISTENERS

  @Listen("request_cartBlockShow_event")
  request_cartBlockShow_eventHandler() {
    this.open();
  }

  @Listen("request_cartBlockHide_event")
  request_cartBlockHide_eventHandler() {
    //this.popState = false;
    this.close();
  }

  @Listen("request_cartBlockToggle_event")
  request_cartBlockToggle_eventHandler({ detail: { mustShow } }: any) {
    this.toggle(mustShow);
  }

  //#endregion

  @Listen("request_cartRemove_event")
  request_cartDelete_eventHandler( event: CustomEvent ) {
    event.stopPropagation();
    const { detail: { id } } = event;

    this.toggleCartDisplay(id, false);

    this.openSnackbar({
      type: "cart-removed",
      onUndo: () => this.toggleCartDisplay(id, true),
      onClose: () => this.request_cartDelete_event.emit({ id })
    });
  }

  @Listen("notify_toasterHide_event")
  notify_toasterHide_eventListener({ detail: { isUndo } }: { detail: { isUndo: boolean } }) {
    this.closeSnackbar(isUndo);
  }

  @Listen("request_snackbarOpen_event")
  request_snackbarOpen_eventHandler({ detail: { type, undoHandler, closeHandler }}) {
    const snackbarOptions = {
      type: type,
      onUndo: undoHandler,
      onClose: closeHandler
    };
    this.openSnackbar(snackbarOptions);
  }

  //#endregion

  //#region LIFECYCLE

  constructor() {
    this.cartIconClickHandler = this.cartIconClickHandler.bind(this);
    this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);
  }

  componentDidLoad() {
    if (history.pushState) {
      window.onpopstate = (event) => {
        if (this.showContent) {
          event.stopPropagation();
          this.popState = false;
          this.close();
        }
      };
    }

    const urlParams: URLSearchParams = new URLSearchParams(
      window.location.search
    );
    const myParam = "openCart";

    if (urlParams.has(myParam)) {
      const newUrl = window.location.href.split("?");

      if (newUrl?.length) {
        window.history.pushState(null, "", newUrl[0]);
      }

      this.open();
    }
  }

  //#endregion

  toggleCartDisplay(cartId: string, mustShow: boolean): void {
    /* DS_eventDispatch(
      [`#cart-${cartId}`],
      "request_cartContentDisplayToggle_event",
      { mustShow }
    ) */
  }

  //#region SNACKBAR DISPLAY

  openSnackbar(snackBarOptions: DSCartBlock['snackBar']) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    const options = {
      ...snackBarOptions,
      ...SNACKBAR_OPTIONS[ snackBarOptions.type ],
    }

    this.snackBar = {
      ...options,
      isSnackBarShown: true
    };

    this.timeout = setTimeout(() => {
      this.closeSnackbar();
    }, options.closingDelay);
  }

  closeSnackbar(isUndo = false) {
    clearTimeout(this.timeout);
    if (this.snackBar.onClose && !isUndo) {
      this.snackBar.onClose();
    } else if (this.snackBar.onUndo && isUndo) {
      this.snackBar.onUndo();
    }

    this.snackBar = {
      ...this.snackBar,
      isSnackBarShown: false
    };
  }

  //#endregion

  //#region BLOCK DISPLAY

  open(): void {
    // current displayed block should be handled in app redux store
    /* DS_eventDispatch(
      ["ds-account-block"],
      "cartBlock_request_blockHide_event"
    );
    DS_eventDispatch(["ds-shop-header"], "request_sidebarHide_event");
    DS_eventDispatch(this.sidebar, `request_sidebarShow_event`); */

    if (history.pushState) {
      history.pushState(null, document.title, location.href);
    }

    /* DS_triggerTrackingEvent({ eventName: 'VIEW_BASKET' }); */

    this.showContent = true;
  }

  close(): void {
    /* DS_eventDispatch(this.sidebar, `request_sidebarHide_event`); */
    this.showContent = false;
  }

  toggle(mustShow?: boolean): void {
    let { showContent } = this;

    if (typeof mustShow === "boolean") {
      showContent = mustShow;
    } else {
      showContent = !showContent;
    }

    this[showContent ? "open" : "close"]();
  }

  //#endregion

  //#region HANDLERS

  cartIconClickHandler(event: PointerEvent): void {
    event.preventDefault();
    this.toggle();
  }

  closeButtonClickHandler(event: Event): void {
    event.preventDefault();
    this.close();
  }

  //#endregion

  render() {
    const [activeCart] = this.carts.filter( ({isActive}) => isActive );

    return (
      <div class="ds-cart-block">
        <ds-trigger
          class="ds-cart-block__icon"
          onClick={this.cartIconClickHandler}
          type="button"
          mods={'cart-icon'}
        >
          <span class={{
            "ds-cart-block__count": true,
          }}>{activeCart?.productCount || 0}</span>
        </ds-trigger>

        <ds-sidebar
          ref={(el) => (this.sidebar = el)}
          class="ds-cart-block__content"
          mods="cart"
        >
          <ds-block mods="cart-list">
            <ds-title
              slot="header"
              mods={["block", "cart"]}
            >
              {this.translations.title.orders}
            </ds-title>
            {this.snackBar.isSnackBarShown && (
              <ds-snackbar
                message={this.snackBar.message}
                type={this.snackBar.type}
                undoLabel={this.snackBar.undoLabel}
                onUndo={this.snackBar.onUndo}
                onClose={this.snackBar.onClose}
              />
            )}
            <ds-trigger
              slot="header"
              class="ds-cart-block__menu"
              type="button"
              mods={[ "cart-block", "close"]}
              onClick={this.closeButtonClickHandler}
            />

            <div class="ds-cart-block__content">
              {this.carts.length ? (
                this.carts.map(cart => {
                  return <ds-mini-cart
                    key={`cart-${cart.id}`}
                    id={`cart-${cart.id}`}
                    class="ds-cart-block__cart"
                    cart={cart}
                    isActive={this.activeCartId === cart.id}
                    isLoggedIn={this.isLoggedIn}
                  />
                })
              ) : (
                <p
                  class="ds-cart-block__empty-cart"
                 
                >
                  {this.translations.empty}
                </p>
              )}
            </div>
          </ds-block>
        </ds-sidebar>
      </div>
    );
  }
}
