import {
  Component,
  h,
  Prop,
  State,
  Event,
  EventEmitter,
  Watch,
  Method
} from "@stencil/core";
import uuid from "../../typescript/uuid";

export interface DSOption {
  index: number;
  id?: string;
  value: string;
  name?: string;
  disabled?: boolean;
  selected?: boolean;
  image?: string;
}

@Component({
  tag: "gbx-combo",
  styleUrl: "combo.scss"
})
export class DSCombo {
  @Prop({ mutable: true, reflect: true }) options: any;
  @Prop() name: string;
  @Prop({ mutable: true, reflect: true }) mode = "";
  @Prop({ mutable: true, reflect: true }) customLabel = "";
  @Prop() multiple = false;
  @Prop() overlay = false;
  @Prop() position = "left";
  @Prop({ mutable: true }) selectedOption: DSOption[] = [];
  @Prop({ mutable: true, reflect: true }) selected: DSOption = {
    id: "",
    index: -1,
    name: "",
    value: ""
  };
  @Prop() pageName = "Grocery";

  @State() uid = uuid();
  @State() showCombo = false;
  @State() optionsArray: any[] = [];

  @Event() gbxValueChange: EventEmitter;

  @Watch("options")
  watchOptionsHandler(options) {
    this.optionsHandler(options, 0);
  }

  constructor() {
    this.bodyClickHandler = this.bodyClickHandler.bind(this);
    this.toggle = this.toggle.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  componentWillLoad() {
    this.optionsHandler(this.options);
  }

  optionsHandler(options, selected = null) {
    if (options && typeof options === "string") {
      options = JSON.parse(options);
    }
    this.optionsArray = options;

    let index;

    if (typeof this.selected.index !== "undefined") {
      index = this.selected.index;
    } else if (this.selected.value) {
      index = this.optionsArray
        .map(function (option) {
          return option.value;
        })
        .indexOf(this.selected.value);
    } else if (this.selected.name) {
      index = this.optionsArray
        .map(function (option) {
          return option.name;
        })
        .indexOf(this.selected.name);
    } else if (selected) {
      index = selected;
    }

    if (index > -1) this.setSelected(index, false);
  }

  setSelected(index: number, emit = true) {
    const selectedOption = { ...this.optionsArray[index] };
    const selected = selectedOption.selected;
    const previousOptions = [...this.optionsArray];
    const previousSelectedOptions = [...this.selectedOption];

    if (selectedOption.value === "") {
      return false;
    }

    if (this.multiple) {
      selectedOption.selected = !selected;
      previousOptions[index].selected = !selected;

      const selectedIndex = previousSelectedOptions
        .map(option => option.value)
        .indexOf(selectedOption.value);

      if (selectedIndex > -1) {
        previousSelectedOptions.splice(selectedIndex, 1);
      } else {
        previousSelectedOptions.push(selectedOption);
      }
      this.selectedOption = previousSelectedOptions;
    } else {
      selectedOption.selected = true;
      previousOptions.map(option => (option.selected = false));
      previousOptions[index] = selectedOption;
      this.selectedOption = [selectedOption];
    }

    this.optionsArray = previousOptions;

    if (emit) {
      this.gbxValueChange.emit({
        name: this.name,
        option: this.selectedOption
      });
    }
  }

  selectOption(event: Event, index: number) {
    this.setSelected(index);
    if (!this.multiple) {
      this.toggle();
    } else {
      event.stopPropagation();
    }
  }

  bodyClickHandler(e) {
    if (!(e.target as HTMLDivElement).closest(`.gbx-combo-${this.uid}`)) {
      this.close();
    }
  }

  @Method()
  async close() {
    const body = document.querySelector("body");
    body.removeEventListener("click", this.bodyClickHandler);
    this.showCombo = false;
  }

  @Method()
  async open() {
    const body = document.querySelector("body");
    body.addEventListener("click", this.bodyClickHandler);
    this.showCombo = true;
  }

  @Method()
  async toggle(forceDisplay?: boolean) {
    const show =
      typeof forceDisplay !== "undefined" ? forceDisplay : !this.showCombo;

    if (show) {
      this.open();
    } else {
      this.close();
    }
  }

  render() {
    return (
      <div
        id={
          "gbx-combo-" +
          (this.name ||
            [
              ...(document.querySelectorAll("gbx-combo") as any)
            ].length.toString())
        }
        class={{
          "gbx-combo": true,
          "gbx-combo--open": this.showCombo,
          [`gbx-combo-${this.uid}`]: true,
          [`gbx-combo--position-${this.position}`]: true,
          [`gbx-combo--${this.mode}`]: !!this.mode,
        }}>
        {this.overlay && (
          <div
            class="gbx-overlay"
            onClick={this.close}
          />
        )}
        {this.mode !== "dropdown" && (
          <div
            class="gbx-combo__selected-option"
            onClick={() => {
              this.toggle();
            }}
            data-cy={this.pageName + '_Button_' + this.name + 'OptionSelected'}>
            {this.multiple && (
              <span data-cy={this.pageName + '_Label_' + this.name + 'OptionSelectedName'}>
                {this.name}
                {this.selectedOption.length > 0 && (
                  <span data-cy={this.pageName + '_Label_OptionSelectedLength'}>({this.selectedOption.length})</span>
                )}
              </span>
            )}
            {!this.multiple && (
              <span>
                {this.customLabel ||
                  (this.selectedOption.length > 0 &&
                    this.selectedOption[0]?.name) ||
                 this.optionsArray[0]?.name}
              </span>
            )}
          </div>
        )}
        {(this.showCombo || this.mode === "image") && (
          <menu>
            <ul
              class={{
                "gbx-combo__option-list": true,
                "gbx-js--hidden": this.mode === "image" && !this.showCombo
              }}>
              {this.optionsArray.map((option, optionIndex) => (
                <li
                  class={{
                    "gbx-combo__option": true,
                    "gbx-bombo__option--disabled": option.disabled,
                    "gbx-combo__option--selected": option.selected
                  }}
                  onClick={evt => {
                    this.selectOption(evt, optionIndex);
                  }}
                  data-cy={this.pageName + '_Button_Option' + option.name}>
                  {this.mode === "image" && (
                    <img
                      src={option.image}
                      alt={option.name}
                    />
                  )}
                  {option.url ? (
                    <a href={option.url} data-cy={this.pageName + '_Button_OptionLink' + option.name}>{option.name}</a>
                  ) : (
                      <span data-cy={this.pageName + '_Label_Option' + option.name}>{option.name}</span>
                    )}
                </li>
              ))}
            </ul>
          </menu>
        )}
      </div>
    );
  }
}
