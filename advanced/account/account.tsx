import { Component, h, Prop, State, Listen } from "@stencil/core";
import { menu } from "./routes";

@Component({
  tag: "ds-account",
  styleUrls: [
    "./account.scss",
    "./scss/modal.scss",
    "./scss/block.scss",
    "./scss/button.scss"
  ]
})
export class DSAccount {

  @Prop({ mutable: true }) avatarDisplay = true;
  @Prop() pageName = "Grocery";

  @State() showDropdown = false;
  @State() showAccountModal = false;
  @State() page = "";
  @State() orderId: string;
  @State() menu: any[] = [];
  @State() apiSettings: any;
  @State() settings: any;
  @State() user: any;
  @State() logged: any;

  @Listen("request_orderDisplay_event")
  request_orderDisplay_eventHandler({ detail: { orderId } }) {
    this.page = "order";
    this.showAccountModal = true;
    this.orderId = orderId;
  }

  @Listen("orders_request_accountPageDisplay_event")
  orders_request_accountPageDisplay_eventHandler({ detail: { page } }) {
    this.page = page;
  }

  @Listen("request_accountModalClose_event")
  request_accountModalClose_eventHandler() {
    this.showAccountModal = false;
  }

  constructor() {
    this.toggle = this.toggle.bind(this);
    this.logout = this.logout.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);
    this.appendModalToBody = this.appendModalToBody.bind(this);
  }

  componentWillLoad() {
    
    this.menu = menu;

    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const myParam = 'openOrder';

    if (urlParams.has(myParam)) {
      const newUrl = window.location.href.split('?');

      if (newUrl?.length) {
        window.history.pushState(null, '', newUrl[0]);
      }

      this.page = 'orders';
      this.showAccountModal = true;
      this.open();
    }
  }

  /**
   * Call redux store logout action
   * @returns {Promise<any>}
   */
  async logout(): Promise<any> {
    /* await this.UserLogoutAction();
    DS_eventDispatch(
      ["ds-checkout"],
      "request_redirectToCart_event",
      { fromLogout: true }
    ); */
  }

  /**
   * Set page to be displayed in account modal
   * @param {Event} event UI Event
   * @param {string} pageName Page id
   * @param {boolean} redirect Redirect to a page
   * */
  display(event: Event, pageName: string, redirect = false): void {
    if (!redirect) {
      event.preventDefault();
      this.page = pageName;
      this.showAccountModal = true;
    }
  }

  /**
   * Dispatch shopping bag open event if needed
   * @param {Event} event UI Event
   * @param {string} pageName Page id
   */
  dispatch(event: Event, pageName: string): void {
    event.preventDefault();
    /* if (pageName === "shoppingBag") {
      // open shopping bags
      // /!\ error in DS_eventDispatch if redimentionnement
      DS_eventDispatch(
        ["ds-shopping-bag"],
        "request_shoppingbag_open"
      );
    } */
  }

  close(): void {
    const body = document.querySelector("body");
    body.removeEventListener("click", this.close);
    this.showDropdown = false;
    this.orderId = null;
  }

  open(): void {
    const body = document.querySelector("body");
    body.addEventListener("click", this.close);
    this.showDropdown = true;
    /* DS_eventDispatch(
      "ds-cart-block",
      "request_cartBlockHide_event",
    ); */

  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (!this.settings.isMobile) {
      const { showDropdown: shown } = this;
      if (shown) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  closeButtonClickHandler(event): void {
    event.stopPropagation();
    this.showAccountModal = false;
  }

  appendModalToBody() {
    document.querySelector("body").appendChild(document.querySelector("ds-modal"));
  }

  render() {
    const { firstname: username } = this.user;

    return (
      <div
        class={{
          "ds-account": true,
          "--dropdown-open": this.showDropdown,
          "--avatar": this.avatarDisplay
        }}
      >
        <button
          class="ds-account__avatar"
          type="button"
          onClick={this.toggle}
          data-cy="Grocery_Button_Avatar"
        >
          <span data-cy="Grocery_Label_Avatar">{username}</span>
        </button>

        {(this.showDropdown || this.settings.isMobile) && (
          <nav class="ds-account-menu">
            <ul>
              {this.menu.map(menu => (
                menu.isActive && (
                  <li>
                    <a
                      class={{
                        "ds-account-menu__item": true,
                        [`--${menu.page}`]: true
                      }}
                      onClick={evt => {
                        this.display(evt, menu.page, menu.redirect);
                      }}
                      href={
                        `/${this.settings.locale}/${menu.link === "parrainage" ? "this.translations.sponsorshipLink" : menu.link}`
                      }
                      data-cy={"Grocery_Button_" + menu.label.toUpperCase()}
                    >
                      {"this.translations[menu.label]"}
                    </a>
                  </li>
                )
              ))}
              {this.settings.isMobile && window.innerWidth < 768 && (
                <li>
                  <ds-shopping-bag
                    mode="sidebar"
                  >
                    {"this.translations.shoppingBags"}
                  </ds-shopping-bag>
                </li>
              )}
              <li>
                <button
                  type="button"
                  class={{
                    "ds-account-menu__item": true,
                    "--logout": true
                  }}
                  onClick={this.logout}
                  data-cy="Grocery_Button_AccountLogout"
                >
                  {"this.translations.logout"}
                </button>
              </li>
            </ul>
          </nav>
        )}

        {this.showAccountModal && (
          <ds-modal
            shown={this.showAccountModal}
            overlay={true}
            isHeaderDisabled={true}
            isFooterDisabled={true}
            lightboxClass={{
              "--dialog": true,
              "--account": true,
              [`--${this.page}`]: true
            }}
            onDSModalClose={this.closeButtonClickHandler}
            onDSModalOpen={this.appendModalToBody}
          >
            <div slot="content">
              <div class={{ "ds-account-title": true }}>
                <ds-title
                  mods={["ds-title", "modal", "main"]}
                  heading={3}
                >
                  {"this.translations[this.page]"}
                </ds-title>

                <ds-button
                  
                  buttonMods={[ "close"]}
                  onDSButtonClick={this.closeButtonClickHandler}
                />
              </div>
              {(this.page === "order" || this.page === "orders") && (
                <ds-orders orderId={this.orderId}  />
              )}

              {this.page === "profile" && (
                <ds-profile />
              )}

              {this.page === "wallet" && (
                <ds-wallet />
              )}

              {this.page === "vouchers" && (
                <ds-vouchers />
              )}

            </div>
          </ds-modal>
        )}

      </div>
    );
  }
}
