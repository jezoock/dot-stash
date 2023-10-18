import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { translations } from "./translations";
import { DS_setTranslations } from "../../../../../../../utils";
import { Translations } from '../../../../../../interfaces';

@Component({
  tag: 'ds-address-list',
  styleUrls: [
    'address-list.scss',
  ]
})
export class DSAddressList {

  @Prop() defaultAddress: any;
  @Prop() addresses: any[] = [];

  translations: Translations;

  @Event() request_addressDelete_event: EventEmitter;
  @Event() request_addressSetAsDefault_event: EventEmitter;

  constructor() {
    this.setAsDefaultAddressButtonClickHandler = this.setAsDefaultAddressButtonClickHandler.bind(this);
    this.deleteAddressButtonClickHandler = this.deleteAddressButtonClickHandler.bind(this);

    this.translations = DS_setTranslations(translations, ["gbx_addressList"]);
  }

  isDefaultAddress(address: any): boolean {
    const defProps: any = Object.getOwnPropertyNames(this.defaultAddress);
    const addressProps: any = Object.getOwnPropertyNames(address);

    if (defProps.length != addressProps.length) {
      return false;
    }

    for (let i = 0; i < defProps.length; i++) {
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
        "ds-address-list": true,
        "--empty": this.addresses?.length === 0
      }}>

        {this.addresses?.length > 0 && (
          this.addresses.map((address: any, index: number) => {

            const isDefaultAddress: boolean = this.isDefaultAddress(address);
            return (
              <li class="ds-address-list__item">

                <address>
                  <span>{address.formatted}</span>
                  <ds-button
                    buttonMods={["trash"]}
                    onGbxButtonClick={ () => this.deleteAddressButtonClickHandler(index, address.formatted) }
                  />
                </address>

                <ds-checkbox
                  type={["default", "list-default"]}
                  isChecked={isDefaultAddress}
                  onGbxCheckboxClick={ () => this.setAsDefaultAddressButtonClickHandler(address) }
                >
                  <span slot="label">{this.translations.label.defaultAddress}</span>
                </ds-checkbox>

              </li>
            );
          })
        )}
        {(!this.addresses || this.addresses.length === 0) && (
          <li class="ds-address-list__item">
            {this.translations.text.noAddress}
          </li>
        )}
      </ul>
    );
  }
}