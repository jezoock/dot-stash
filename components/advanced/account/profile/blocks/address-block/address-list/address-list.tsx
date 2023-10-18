import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { translations } from "./translations";
import { Greenbox_setTranslations } from "../../../../../../../utils";
import { Translations } from '../../../../../../interfaces';

@Component({
  tag: 'gbx-address-list',
  styleUrls: [
    'address-list.scss',
  ]
})
export class GreenboxAddressList {

  @Prop() defaultAddress: any;
  @Prop() addresses: any[] = [];

  translations: Translations;

  @Event() request_addressDelete_event: EventEmitter;
  @Event() request_addressSetAsDefault_event: EventEmitter;

  constructor() {
    this.setAsDefaultAddressButtonClickHandler = this.setAsDefaultAddressButtonClickHandler.bind(this);
    this.deleteAddressButtonClickHandler = this.deleteAddressButtonClickHandler.bind(this);

    this.translations = Greenbox_setTranslations(translations, ["gbx_addressList"]);
  }

  isDefaultAddress(address: any): boolean {
    const defProps: any = Object.getOwnPropertyNames(this.defaultAddress);
    const addressProps: any = Object.getOwnPropertyNames(address);

    if (defProps.length != addressProps.length) {
      return false;
    }

    for (var i = 0; i < defProps.length; i++) {
      const propName: string = defProps[i];
      if (this.defaultAddress[propName] != address[propName]) {
        return false;
      }
    }
    return true;
  }

  setAsDefaultAddressButtonClickHandler(address: any): void {
    this.request_addressSetAsDefault_event.emit({ address });
  }

  deleteAddressButtonClickHandler(index: number, address: any): void {
    this.request_addressDelete_event.emit({ index, address });
  }

  render() {
    return (
      <ul class={{
        "gbx-address-list": true,
        "--empty": this.addresses?.length === 0
      }}>

        {this.addresses?.length > 0 && (
          this.addresses.map((address: any, index: number) => {

            const isDefaultAddress: boolean = this.isDefaultAddress(address);
            return (
              <li class="gbx-address-list__item">

                <address>
                  <span>{address.formatted}</span>
                  <gbx-button
                    buttonMods={["trash"]}
                    onGbxButtonClick={ () => this.deleteAddressButtonClickHandler(index, address.formatted) }
                  />
                </address>

                <gbx-checkbox
                  type={["default", "list-default"]}
                  isChecked={isDefaultAddress}
                  onGbxCheckboxClick={ () => this.setAsDefaultAddressButtonClickHandler(address) }
                >
                  <span slot="label">{this.translations.label.defaultAddress}</span>
                </gbx-checkbox>

              </li>
            );
          })
        )}
        {(!this.addresses || this.addresses.length === 0) && (
          <li class="gbx-address-list__item">
            {this.translations.text.noAddress}
          </li>
        )}
      </ul>
    );
  }
}