import { Component, h, Event, EventEmitter, Prop } from '@stencil/core';
import { DataCy } from "../../../../../utils/data-cy";
import { DS_getDataCy } from "../../../../../utils";

@Component({
  tag: 'ds-input-password',
  styleUrls: [
    'input-password.scss',
    './scss/button.scss'
  ]
})
export class DSInput {
  @Prop() type: string = 'text';
  @Prop() inputId: string;
  @Prop() inputName: string;
  @Prop() min: number;
  @Prop() max: number;
  @Prop() isDisabled: boolean;
  @Prop() value: any;
  @Prop() isInError: boolean;
  @Prop({ mutable: true, reflect: true }) placeholder: string = '';
  @Prop({ mutable: true, reflect: true }) autocomplete: string = 'on';
  @Prop({ attribute: 'data-cy', mutable: true }) dataCy: DataCy = {
    pageName: null,
    elementName: "Password"
  };

  @Event() gbxInputBlur: EventEmitter;

  constructor() {
    this.inputBlurHandler = this.inputBlurHandler.bind(this);
    this.clickButtonHandler = this.clickButtonHandler.bind(this);
  }

  inputBlurHandler(event: any): void {
    const { value } = event.target;
    this.gbxInputBlur.emit({ name: this.inputName, value });
  }

  clickButtonHandler() {
    this.type = this.type === 'text' ? 'password' : 'text';
  }

  render() {

    return (
      <div
        class={{
          "ds-input-password": true,
          "--password": true,
          '--valid': this.value && !this.isInError,
          '--error': this.isInError,
        }}
      >

        <ds-input
          class="ds-input-password__input"
          mods="password"
          inputName={this.inputName}
          placeholder={this.placeholder}
          type={this.type}
          id={this.inputId}
          min={this.min}
          max={this.max}
          isDisabled={this.isDisabled}
          onBlur={this.inputBlurHandler}
          autocomplete={this.autocomplete}
          value={this.value}
          isInError={this.isInError}
          data-cy={DS_getDataCy({
            ...this.dataCy,
            elementType: "Input",
            elementName: "Password",
          })}
        />

        <ds-button
          class="ds-input-password__button"
          buttonMods={['auth', 'toggle-password']}
          buttonType="button"
          data-cy={DS_getDataCy({
            ...this.dataCy,
            elementType: "InputButton",
            elementName: "Password",
          })}
          onClick={this.clickButtonHandler}
        />
      </div>

    );
  }
}
