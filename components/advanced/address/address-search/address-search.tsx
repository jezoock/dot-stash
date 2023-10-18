import { Component, h, Prop, Listen, State, Watch } from "@stencil/core";
import dayjs from 'dayjs';
import { DS_getAppLocale } from '../../../utils';
import "dayjs/locale/fr";
import "dayjs/locale/en";
import "dayjs/locale/de";
import "dayjs/locale/it";
dayjs.locale(DS_getAppLocale());
import { Store, Action } from "@stencil/redux";
import { translations } from "./translations";
import {
  AddressSetAction,
} from "../../../_redux/actions/cart";
import Address from "../../../models/address";

const AddressAccuracy = {
  country: 0,
  locality: 1,
  postalCode: 2,
  route: 3,
  streetNumber: 4
};

@Component({
  tag: "ds-address-search",
  styleUrl: "address-search.scss"
})
export class DSAddressSearch {

  @Prop() accuracyRequired: string = "streetNumber";
  @Prop() accuracyLevel: number = AddressAccuracy[this.accuracyRequired] || 0;
  @Prop({ mutable: true }) mode: string = "geolocate";
  @Prop({ mutable: true }) displayMode: string = "";
  @Prop({ context: "store" }) store: Store;
  @Prop() pageName: string = "Grocery";

  @State() notification: { type: string[], messages: string[], animation: string };
  @State() address: any;
  @State() settings: any;
  @State() cartId: any;
  @State() user: any;

  translations: any;
  autocompleteElement: HTMLGbxAddressAutocompleteElement;

  AddressSetAction: Action;

  @Watch("user")
  userWatchHandler() {
    this.setMode();
  }

  @Listen("notify_addressSet_event")
  notify_addressSet_eventHandler(event) {
    const { address } = event.detail;
    this.setAddress(address);
  }

  @Listen("request_messageReset_event")
  request_messageReset_eventHandler() {
    this.resetMessages();
  }

  @Listen("request_newAddress_event")
  request_newAddress_eventHandler() {
    this.setMode("geolocate");
  }

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        app: { settings },
        user: user,
        cart: {
          cart: {
            id: cartId,
            deliveryAddress,
          },
        }
      } = state;
      return {
        settings: settings,
        cartId: cartId,
        address: deliveryAddress,
        user: user,
      };
    });

    this.store.mapDispatchToProps(this, {
      AddressSetAction,
    });
    this.translations = translations[this.settings.locale].gbx_addressSearch;
  }

  setMode(mode?: string): void {
    if (!!mode) {
      this.mode = mode;
    } else {
      this.mode = this.user?.logged && !!this.user?.user?.addresses?.length
        ? "list"
        : "geolocate";
    }
  }

  async setAddress(address) {

    const addressObject: Address = new Address(address);
    const errors = addressObject._checkAddressValidity(this.accuracyLevel);

    if (errors.length) {
      this.displayMessage(errors.map(error => this.translations.errors[error]), ["error", "address-search"], "toast");
    } else {
      await this.AddressSetAction({ address: address, cartId: this.cartId });
      this.displayMessage([this.translations.messages.ok], ["valid", "address-search"], "toast");
    }
  }

  resetMessages() {
    const notification = {
      messages: [],
      type: [],
      animation: ""
    };
    this.notification = notification;
  }

  displayMessage(messages, type = ["notice"], animation = "showHide") {
    const notification = {
      animation: animation,
      type: type,
      messages: messages
    };
    this.notification = notification;
    setTimeout(() => {
      this.resetMessages();
    }, 4500);
  }

  render() {
    let displayedAddress = '';

    if (this.address) {
      displayedAddress = this.address.formatted;
    } else if (this.user?.user?.defaultAddress?.formatted) {
      displayedAddress = this.user.user.defaultAddress.formatted;
    }

    return (
      <div
        class={{
          "ds-address-search": true,
          [`--${this.displayMode}`]: !!this.displayMode,
          [`--${this.mode}`]: true
        }}
      >

        {this.mode === "geolocate" && (
          <div class="ds-address-search__autocomplete">
            <ds-address-autocomplete
              ref={el => (this.autocompleteElement = el)}
              address={this.address}
              locale={this.settings.locale}
              peliasUri={this.settings.credentials.pelias.uri}
              pageName={this.pageName}
            />
            {this.notification?.messages?.length > 0 && (
              <ds-notification
                messages={this.notification.messages}
                animation={this.notification.animation}
                type={this.notification.type}
              />
            )}
          </div>
        )}

        {this.mode === "list" && (
          <div class="ds-address-search__selector">
            <ds-address-selector
              locale={this.settings.locale}
              addresses={this.user.user.addresses}
              defaultAddress={displayedAddress}
              pageName={this.pageName}
            />
          </div>
        )}

      </div>
    );
  }
}
