import { h, Component, Prop, Event, EventEmitter } from "@stencil/core";
import { translations } from "./translations";

@Component({
  tag: "ds-address-dropdown",
  styleUrls: [
    "./address-dropdown.scss",
    "./scss/button.scss"
  ]
})
export class DSAddressDropdown {

  @Prop() locale: string = 'en';
  @Prop({ mutable: true }) addresses: any[] = [];
  @Prop() pageName: string = "Grocery";

  @Event() dsSelectAddressClick: EventEmitter;
  @Event() dsNewAddressClick: EventEmitter;

  translations: any = translations[this.locale].ds_addressDropdown;

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
    this.dsSelectAddressClick.emit(address);
  }

  newAddressButtonClickHandler(): void {
    this.dsNewAddressClick.emit();
  }

  render() {
    return (
      <menu
        class="ds-address-dropdown"
        onClick={this.dropDownClickHandler}
        data-cy={this.pageName + '_Button_DSAddressDropdown'}
      >
        <div class="ds-address-dropdown-list">
          <ul class="ds-address-dropdown-list__list">
            {this.addresses.map(address => (
              <li
                class={{
                  "ds-address-dropdown__list-item": true,
                  "--selected": address.selected
                }}
                data-cy={this.pageName + '_Li_DSAddressDropdownItem'}
              >
                <button
                  type="button"
                  class={{
                    "ds-button": true,
                    "--address-dropdown": true,
                    "--address-select": true
                  }}
                  onClick={() => {
                    this.selectAddressButtonClickHandler(address);
                  }}
                  data-cy={this.pageName + '_Button_DSAddressDropdownItem'}
                >
                  <span data-cy={this.pageName + '_Label_DSAddressDropdownItem'}>{address.formatted}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            class={{
              "ds-button": true,
              "--address-dropdown": true,
              "--new-address": true
            }}
            onClick={this.newAddressButtonClickHandler}
            data-cy={this.pageName + '_Button_DSAddressDropdownNewAddress'}
          >
            {this.translations.newAddress}
          </button>
        </div>
      </menu>
    );
  }
}
