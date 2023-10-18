import { h, Component, Prop, Event, EventEmitter } from "@stencil/core";
import { translations } from "./translations";

@Component({
  tag: "gbx-address-dropdown",
  styleUrls: [
    "./address-dropdown.scss",
    "./scss/button.scss"
  ]
})
export class GreenboxAddressDropdown {

  @Prop() locale: string = 'en';
  @Prop({ mutable: true }) addresses: any[] = [];
  @Prop() pageName: string = "Grocery";

  @Event() gbxSelectAddressClick: EventEmitter;
  @Event() gbxNewAddressClick: EventEmitter;

  translations: any = translations[this.locale].gbx_addressDropdown;

  constructor() {
    this.dropDownClickHandler = this.dropDownClickHandler.bind(this);
    this.selectAddressButtonClickHandler = this.selectAddressButtonClickHandler.bind(this);
    this.newAddressButtonClickHandler = this.newAddressButtonClickHandler.bind(this);
  }

  componentWillLoad() { }

  dropDownClickHandler(event: UIEvent): void {
    event.preventDefault();
  }

  selectAddressButtonClickHandler(address: any): void {
    this.gbxSelectAddressClick.emit(address);
  }

  newAddressButtonClickHandler(): void {
    this.gbxNewAddressClick.emit();
  }

  render() {
    return (
      <menu
        class="gbx-address-dropdown"
        onClick={this.dropDownClickHandler}
        data-cy={this.pageName + '_Button_GbxAddressDropdown'}
      >
        <div class="gbx-address-dropdown-list">
          <ul class="gbx-address-dropdown-list__list">
            {this.addresses.map(address => (
              <li
                class={{
                  "gbx-address-dropdown__list-item": true,
                  "--selected": address.selected
                }}
                data-cy={this.pageName + '_Li_GbxAddressDropdownItem'}
              >
                <button
                  type="button"
                  class={{
                    "gbx-button": true,
                    "--address-dropdown": true,
                    "--address-select": true
                  }}
                  onClick={() => {
                    this.selectAddressButtonClickHandler(address);
                  }}
                  data-cy={this.pageName + '_Button_GbxAddressDropdownItem'}
                >
                  <span data-cy={this.pageName + '_Label_GbxAddressDropdownItem'}>{address.formatted}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            class={{
              "gbx-button": true,
              "--address-dropdown": true,
              "--new-address": true
            }}
            onClick={this.newAddressButtonClickHandler}
            data-cy={this.pageName + '_Button_GbxAddressDropdownNewAddress'}
          >
            {this.translations.newAddress}
          </button>
        </div>
      </menu>
    );
  }
}
