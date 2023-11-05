import { Component, h, Event, EventEmitter, Prop } from '@stencil/core';

@Component({
  tag: 'ds-input-password',
  styleUrls: [
    'input-password.scss',
    './scss/button.scss'
  ]
})
export class DSInput {
  @Prop() type = 'text';
  @Prop() inputId: string;
  @Prop() inputName: string;
  @Prop() min: number;
  @Prop() max: number;
  @Prop() isDisabled: boolean;
  @Prop() value: any;
  @Prop() isInError: boolean;
  @Prop({ mutable: true, reflect: true }) placeholder = '';
  @Prop({ mutable: true, reflect: true }) autocomplete = 'on';

  @Event() dSInputBlur: EventEmitter;

  constructor() {
    this.inputBlurHandler = this.inputBlurHandler.bind(this);
    this.clickButtonHandler = this.clickButtonHandler.bind(this);
  }

  inputBlurHandler(event: any): void {
    const { value } = event.target;
    this.dSInputBlur.emit({ name: this.inputName, value });
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
        />

        <ds-button
          class="ds-input-password__button"
          mods={['auth', 'toggle-password']}
          type="button"
          onClick={this.clickButtonHandler}
        />
      </div>

    );
  }
}
