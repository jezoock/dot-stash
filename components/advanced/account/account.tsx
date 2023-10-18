import { Component, h, Prop, State, Listen } from "@stencil/core";
import { menu } from "./routes";
import { Store } from "@stencil/redux";
import { UserLogoutAction } from "../../../_redux/actions/user";
import { Greenbox_eventDispatch, Greenbox_setTranslations } from "../../../utils";
import { Translations } from "../../interfaces";
import { translations } from "./translations";

@Component({
  tag: "gbx-account",
  styleUrls: [
    "./account.scss",
    "./scss/modal.scss",
    "./scss/block.scss",
    "./scss/button.scss"
  ]
})
export class GreenboxAccount {

  @Prop({ mutable: true }) avatarDisplay: boolean = true;
  @Prop({ context: "store" }) store: Store;
  @Prop() pageName: string = "Grocery";

  @State() showDropdown: boolean = false;
  @State() showAccountModal: boolean = false;
  @State() page: string = "";
  @State() orderId: string;
  @State() menu: any[] = [];
  @State() apiSettings: any;
  @State() settings: any;
  @State() user: any;
  @State() logged: any;

  translations: Translations = Greenbox_setTranslations(translations, ['gbx_account']);

  UserLogoutAction: typeof UserLogoutAction;

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
    this.store.mapStateToProps(this, ({
                                        app: { settings, apiSettings },
                                        user: { logged, user }
                                      }) => ({
      apiSettings,
      settings,
      user,
      logged,
    }));

    this.store.mapDispatchToProps(this, {
      UserLogoutAction
    });

    this.menu = menu;

    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const myParam: string = 'openOrder';

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
    await this.UserLogoutAction();
    Greenbox_eventDispatch(
      ["gbx-checkout"],
      "request_redirectToCart_event",
      { fromLogout: true }
    );
  }

  /**
   * Set page to be displayed in account modal
   * @param {Event} event UI Event
   * @param {string} pageName Page id
   * @param {boolean} redirect Redirect to a page
   * */
  display(event: Event, pageName: string, redirect: boolean = false): void {
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
    if (pageName === "shoppingBag") {
      // open shopping bags
      // /!\ error in Greenbox_eventDispatch if redimentionnement
      Greenbox_eventDispatch(
        ["gbx-shopping-bag"],
        "request_shoppingbag_open"
      );
    }
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
    Greenbox_eventDispatch(
      "gbx-cart-block",
      "request_cartBlockHide_event",
    );

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
    document.querySelector("body").appendChild(document.querySelector("gbx-modal"));
  }

  render() {
    const { firstname: username } = this.user;

    return (
      <div
        class={{
          "gbx-account": true,
          "--dropdown-open": this.showDropdown,
          "--avatar": this.avatarDisplay
        }}
      >
        <button
          class="gbx-account__avatar"
          type="button"
          onClick={this.toggle}
          data-cy="Grocery_Button_Avatar"
        >
          <span data-cy="Grocery_Label_Avatar">{username}</span>
        </button>

        {(this.showDropdown || this.settings.isMobile) && (
          <nav class="gbx-account-menu">
            <ul>
              {this.menu.map(menu => (
                menu.isActive && (
                  <li>
                    <a
                      class={{
                        "gbx-account-menu__item": true,
                        [`--${menu.page}`]: true
                      }}
                      onClick={evt => {
                        this.display(evt, menu.page, menu.redirect);
                      }}
                      href={
                        `/${this.settings.locale}/${menu.link === "parrainage" ? this.translations.sponsorshipLink : menu.link}`
                      }
                      data-cy={"Grocery_Button_" + menu.label.toUpperCase()}
                    >
                      {this.translations[menu.label]}
                    </a>
                  </li>
                )
              ))}
              {this.settings.isMobile && window.innerWidth < 768 && (
                <li>
                  <gbx-shopping-bag
                    mode="sidebar"
                  >
                    {this.translations.shoppingBags}
                  </gbx-shopping-bag>
                </li>
              )}
              <li>
                <button
                  type="button"
                  class={{
                    "gbx-account-menu__item": true,
                    "--logout": true
                  }}
                  onClick={this.logout}
                  data-cy="Grocery_Button_AccountLogout"
                >
                  {this.translations.logout}
                </button>
              </li>
            </ul>
          </nav>
        )}

        {this.showAccountModal && (
          <gbx-modal
            shown={this.showAccountModal}
            overlay={true}
            isHeaderDisabled={true}
            isFooterDisabled={true}
            lightboxClass={{
              "--dialog": true,
              "--account": true,
              [`--${this.page}`]: true
            }}
            onGbxModalClose={this.closeButtonClickHandler}
            onGbxModalOpen={this.appendModalToBody}
          >
            <div slot="content">
              <div class={{ "gbx-account-title": true }}>
                <gbx-title
                  titleMods={["gbx-title", "modal", "main"]}
                  heading={3}
                >
                  {this.translations[this.page]}
                </gbx-title>

                <gbx-button
                  useSnack={true}
                  buttonMods={["snack", "close"]}
                  onGbxButtonClick={this.closeButtonClickHandler}
                />
              </div>
              {(this.page === "order" || this.page === "orders") && (
                <gbx-orders orderId={this.orderId}  />
              )}

              {this.page === "profile" && (
                <gbx-profile />
              )}

              {this.page === "wallet" && (
                <gbx-wallet />
              )}

              {this.page === "vouchers" && (
                <gbx-vouchers />
              )}

            </div>
          </gbx-modal>
        )}

      </div>
    );
  }
}
