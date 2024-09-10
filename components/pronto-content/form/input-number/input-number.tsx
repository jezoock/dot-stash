import { Component, h, Element, Prop, State, Host, Event, Method, EventEmitter } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

interface InputProps {
  type: string;
  name: string;
  id: string;
  inputmode: string;
  pattern: string;
  min?: string;
  max?: string;
  "aria-label"?: string;
}

@Component({
  tag: 'ds-input-number',
})
export class DSInputNumber {

  @Element() hostContainer: HTMLDsInputNumberElement;
  
  @Prop() name: string;
  @Prop() defaultValue: number | string = 1;
  @Prop() min: number | string = 1;
  @Prop() max: number | string;
  @Prop() ariaLabel: string = "";

  @State() value: number;
  @State() tempValue: number;

  @Event() quantityChange: EventEmitter;

  @Method()
  async setValue( value: number ) {
    this.value = value;
  }

  inputProps: InputProps;

  constructor() {
    this.minusButtonClickHandler = this.minusButtonClickHandler.bind(this);
    this.plusButtonClickHandler = this.plusButtonClickHandler.bind(this);
    this.inputBlurHandler = this.inputBlurHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.inputFocusHandler = this.inputFocusHandler.bind(this);
  }

  componentWillLoad() {
    this.value = _ds.props.toNumber(this.defaultValue);

    const inputProps: InputProps = {
      type: "number",
      name: this.name,
      id: this.hostContainer.getAttribute("id"),
      inputmode: "numeric",
      pattern: "[0-9]*"
    };

    if (this.min) {
      inputProps.min = this.min.toString();
    }

    if (this.max) {
      inputProps.max = this.max.toString();
    }

    if (this.ariaLabel) {
      inputProps['aria-label'] = this.ariaLabel;
    }

    this.inputProps = inputProps;
  }

  valueChangeHandler(value: number, update: number) {
    this.value = value;
    this.quantityChange.emit({ value, update });
  }

  minusButtonClickHandler() {
    const { value: previousValue } = this;
    const value = previousValue - 1;
    if (value >= _ds.props.toNumber(this.inputProps.min)) {
      this.valueChangeHandler(value, -1);
    }
  }
  
  plusButtonClickHandler() {
    const { value: previousValue } = this;
    const value = previousValue + 1;
    if (this.max && value <= _ds.props.toNumber(this.inputProps.max) || !this.max) {
      this.valueChangeHandler(value, 1);
    }
  }

  inputBlurHandler(event: Event) {
    const { target } = event;
    const value = parseInt((target as HTMLInputElement).value);
    const { tempValue: previousValue } = this;

    if (value >= _ds.props.toNumber(this.inputProps.min) && (this.max && value <= _ds.props.toNumber(this.inputProps.max) || !this.max)) {
      this.value = value;
    } else {
      this.value = previousValue;
    }

    if(previousValue !== value) {
      this.valueChangeHandler(value, value - previousValue);
    }
  }

  inputChangeHandler(event: Event) {
    const { target } = event;
    const value = parseInt((target as HTMLInputElement).value);
    const { value: previousValue } = this;

    this.value = value;

    if(previousValue !== value) {
      this.valueChangeHandler(value, value - previousValue);
    }
  }

  inputFocusHandler(event: Event) {
    const { target } = event;
    const value = parseInt((target as HTMLInputElement).value);
    this.tempValue = value;
  }

  render() {
    return (
      <Host class="ds-input-quantity">
        
        <ds-trigger 
          class="ds-input-quantity__minus-button"
          type="button" 
          onClick={this.minusButtonClickHandler}
        />

        <input onFocus={this.inputFocusHandler} onInput={this.inputChangeHandler} onBlur={this.inputBlurHandler} {...this.inputProps} value={this.value} class="ds-input-quantity__input"/>
        
        <ds-trigger 
          class="ds-input-quantity__plus-button"
          type="button" 
          onClick={this.plusButtonClickHandler}
        />
      </Host>
    );
  }
}