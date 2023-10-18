import { Component, h, Event, EventEmitter, Prop } from '@stencil/core';
import { DataCy } from "../../../../../utils/data-cy";
import { Greenbox_getDataCy } from "../../../../../utils";

@Component({
  tag: 'gbx-input-password',
  styleUrls: [
    'input-password.scss',
    './scss/button.scss'
  ]
})
export class GreenboxInput {
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
          "gbx-input-password": true,
          "--password": true,
          '--valid': this.value && !this.isInError,
          '--error': this.isInError,
        }}
      >

        <gbx-input
          class="gbx-input-password__input"
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
          data-cy={Greenbox_getDataCy({
            ...this.dataCy,
            elementType: "Input",
            elementName: "Password",
          })}
        />

        <gbx-button
          class="gbx-input-password__button"
          buttonMods={['auth', 'toggle-password']}
          buttonType="button"
          data-cy={Greenbox_getDataCy({
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
