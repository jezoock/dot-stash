import { Element, Component, h, Host, Event, Prop, EventEmitter } from '@stencil/core';
import flatpickr  from "flatpickr";

@Component({
  tag: 'ds-input-date',
  styleUrl: 'input-date.scss'
})
export class DSInputDate {

  @Element() host: HTMLDsInputDateElement;

  @Prop({ mutable: true, reflect: true}) value: string;

  @Event() valueChange: EventEmitter;

  picker: any;


  constructor() {
    this.dateChangeHandler = this.dateChangeHandler.bind(this);
    this.clearButtonClickHandler = this.clearButtonClickHandler.bind(this);
  }

  componentDidLoad() {
    const input = this.host.querySelector("input");
    const pickerSettings: any = {
      enableTime: true,
      dateFormat:"Y-m-d H:i:S",
      onChange: this.dateChangeHandler,
    };
    if (this.value) {
      pickerSettings.defaultDate = this.value;
    }

    this.picker = flatpickr(input, pickerSettings);
      
  }

  dateChangeHandler(_, formattedDate: string) {
    this.valueChange.emit({ value: formattedDate })
  }

  clearButtonClickHandler() {
    this.picker.clear();
  }
  
  render() {
    return (
      <Host>
        <input type="text" value={this.value} name="date" />
        <ds-trigger class="pronto-field__clear-button" onClick={this.clearButtonClickHandler} type="button">X</ds-trigger>
      </Host>
    );
  }
}