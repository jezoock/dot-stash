import { Component, h, Prop, State, Event, EventEmitter } from "@stencil/core";

import { Store, Action } from "@stencil/redux";
import { translations } from "./translations";
import { TransAddTranslations } from "../../_redux/actions/localization";

@Component({
  tag: "gbx-address",
  styleUrl: "address.scss"
})
export class GreenboxAddress {
  @Prop({ mutable: true }) address: any;
  @Prop({ mutable: true }) index: any;
  @Prop({ mutable: true }) isDefault: any;
  @Prop({ mutable: true, reflect: true }) mode: string = "view";

  @State() edit: false;
  @State() user: any;

  @Prop({ context: "store" }) store: Store;
  @State() settings: any;
  @State() translations: any;

  TransAddTranslations: Action;

  @Event() address_request_addressDelete_event: EventEmitter;
  @Event() address_request_addressSetAsDefault_event: EventEmitter;

  constructor() {
    this.setAsDefault = this.setAsDefault.bind(this);
    this.delete = this.delete.bind(this);
  }

  componentWillLoad() {

    this.store.mapStateToProps(this, state => {
      const {
        app: { settings },
        localization: translations,
        user: {
          user: user
        }
      } = state;
      return { settings: settings, translations: translations, user: user };
    });

    if (this.translations && this.translations.gbx_address === undefined) {
      this.store.mapDispatchToProps(this, {
        TransAddTranslations
      });
      this.TransAddTranslations(translations[this.settings.locale]);
    }
  }

  componentDidLoad() {
    this.isDefault = this.setIsDefault();
  }

  setIsDefault() {

    var defProps = Object.getOwnPropertyNames(this.user.defaultAddress);
    var addressProps = Object.getOwnPropertyNames(this.address);

    if (defProps.length != addressProps.length) {
      return false;
    }

    for (var i = 0; i < defProps.length; i++) {
      var propName = defProps[i];
      if (this.user.defaultAddress[propName] != this.address[propName]) {
        return false;
      }
    }
    return true;
  }

  delete(event) {
    event.preventDefault();
    this.address_request_addressDelete_event.emit({ index: this.index, address: this.address });
  }

  setAsDefault() {
    this.address_request_addressSetAsDefault_event.emit({
      address: this.address
    });
  }

  render() {
    return (
      <div class="gbx-address">
        <address>
          <span>{this.address.formatted}</span>
          <button
            class="gbx-address__remove-button"
            onClick={evt => {
              this.delete(evt);
            }}
            title={this.translations.gbx_address.buttons.delete}
          />
        </address>
        <label
          htmlFor={"address-" + this.index}
          class={
            "gbx-radio-old gbx-radio-old--square" +
            (this.isDefault ? " gbx-js--checked" : "")
          }>
          <input
            type="radio"
            name="defaultAddress"
            value=""
            id={"address-" + this.index}
            checked={this.isDefault}
            onClick={this.setAsDefault}
          />
          {this.translations.gbx_address.labels.default}
        </label>
      </div>
    );
  }
}
