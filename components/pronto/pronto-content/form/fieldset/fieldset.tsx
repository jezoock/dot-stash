import { Component, h, Host, Prop, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'pronto-fieldset',
})
export class ProntoFieldset {

  @Prop() name: string = "";
  @Prop() label: string = "";
  @Prop() depth: number = 0;
  @Prop() fields: any[] = [];
  @Prop() defaultValue: any;

  @State() value;

  @Event() valueChange: EventEmitter;

  valueChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();

    const { detail: { name, value }} = event;

    const newValue = {
      ...this.value,
      [name]: value,
    }
    this.valueChange.emit({ name: this.name, value: newValue });
    this.value = newValue;
  }

  constructor() {
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
  }

  componentWillLoad() {
    this.value = this.defaultValue || {};
  }
  
  render() {
    return (
      <Host>
        <fieldset class={this.name}>
          {Boolean(this.label) && (
            <ds-title form>{this.label}</ds-title>
          )}
          {this.fields.map( inputProps => {
            return Array.isArray(inputProps.type) ? <pronto-fieldset depth={this.depth+1} fields={inputProps.fields} /> : <pronto-field onValueChange={this.valueChangeHandler} {...inputProps} /> })}
        </fieldset>
      </Host>
    );
  }
}