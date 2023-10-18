import { h, Component, Prop, State, Event, EventEmitter } from "@stencil/core";
import { translations } from "./translations";

@Component({
  tag: "ds-address-selector",
  styleUrls: [
    "./address-selector.scss",
  ]
})
export class DSAddressSelector {

  @Prop() addresses: any[] = [];
  @Prop() locale: string = 'en';
  @Prop() defaultAddress: string = "";
  @Prop() pageName: string = "Grocery";

  @State() showDropdown: boolean = false;

  translations: any = translations[this.locale].gbx_addressSelector;

  @Event() notify_addressSet_event: EventEmitter;
  @Event() request_newAddress_event: EventEmitter;

  constructor() {
    this.bodyClickHandler = this.bodyClickHandler.bind(this);
    this.addressInputClickHandler = this.addressInputClickHandler.bind(this);
    this.requestNewAddresFormDisplay = this.requestNewAddresFormDisplay.bind(this);
    this.notifyAddressSet = this.notifyAddressSet.bind(this);
  }

  closeDropdown() {
    const body = document.querySelector("body");
    body.removeEventListener("click", this.bodyClickHandler);
    this.showDropdown = false;
  }

  openDropdown() {
    const body = document.querySelector("body");
    body.addEventListener("click", this.bodyClickHandler);
    this.showDropdown = true;
  }

  toggleDropdown() {
    this[`${this.showDropdown ? "close" : "open"}Dropdown`]();
  }

  bodyClickHandler(event: MouseEvent) {
    if (!(event.target as HTMLDivElement).closest(".ds-address-selector")) {
      this.closeDropdown();
    }
  }

  notifyAddressSet(event: CustomEvent) {
    const { detail: address } = event;
    this.closeDropdown();
    this.notify_addressSet_event.emit({ address });
  }

  requestNewAddresFormDisplay() {
    this.closeDropdown();
    this.request_newAddress_event.emit();
  }

  addressInputClickHandler() {
    this.toggleDropdown();
  }

  render() {
    return (
      <div class="ds-address-selector">

        <input
          type="text"
          placeholder={this.translations.placeholder}
          readonly={true}
          onClick={this.addressInputClickHandler}
          value={this.defaultAddress}
          data-cy={this.pageName + '_Input_GbxAddressDropdown'}
        />

        {this.showDropdown && (
          <ds-address-dropdown
            locale={this.locale}
            addresses={this.addresses}
            onGbxNewAddressClick={this.requestNewAddresFormDisplay}
            onGbxSelectAddressClick={this.notifyAddressSet}
            pageName={this.pageName}
          />
        )}

      </div>

    );
  }
}
