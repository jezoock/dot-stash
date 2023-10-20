//#region Vendor imports
import { Component, Event, EventEmitter, h, Listen, Prop } from '@stencil/core';
//#endregion
//#region App imports
import { isFieldRequired } from '../../utils';
import { FormValidator } from '../../validator/form-validator';
import { Validator } from '../../validator/validator';
import { InputFieldType } from './input-field-type.enum';

//#endregion

@Component({
  tag: 'ds-input-field',
  styleUrls: [
    'input-field.scss',
    './scss/button.scss',
  ],
})
export class DSInput {

  @Prop() inputType: InputFieldType = InputFieldType.INPUT;
  @Prop() inputName: string;
  @Prop() inputPlaceholder: string;
  @Prop() value: string;
  @Prop() inputId: string;
  /**
   * Send data with an event
   * @type {boolean}
   */
  @Prop() sendValue = true;
  @Prop() label: string;
  @Prop() type = 'text';
  @Prop() min: number;
  @Prop() max: number;
  @Prop() isDisabled: boolean;
  /**
   * A table of validators to validate the form field and theirs error messages.
   * The error messages from the component implementing the form field.
   * If no error messages are passed, default values will be used from the translations
   * Can be empty
   * @type {ValidatorType[]}
   */
  @Prop() validators: Validator[] = [];
  @Prop() icon: string;
  @Prop({ mutable: true, reflect: true }) isInError: boolean;
  @Prop({ mutable: true, reflect: true }) errorMessage: string;

  @Event() notify_fieldChanged_event: EventEmitter<{ value: string, name: string }>;
  @Event() clickButtonHandler: EventEmitter;

  private readonly isRequired: boolean;

  @Listen('notify_fieldInError_event')
  notify_fieldInError_eventHandler({ detail: { field, errorMessage } }) {
    if (field && errorMessage && field === this.inputName) {
      this.isInError = true;
      this.errorMessage = errorMessage;
    }
  }

  constructor() {
    this.inputHandler = this.inputHandler.bind(this);
    this.isRequired = isFieldRequired(this.validators);
  }

  inputHandler({ detail: { value, name, errorType } }) {
    if (!errorType) {
      const { errorMessage, isInError } = this.checkInputValidation(value);
      this.errorMessage = errorMessage;
      this.isInError = isInError;
    } else {
      this.errorMessage = "this.translations.error[errorType]";
      this.isInError = true;
    }

    if (!this.isInError && !this.errorMessage) {
      this.fieldChangeHandler({ value, name });
    } else if (this.sendValue) {
      this.notify_fieldChanged_event.emit({ value: null, name });
    }
  }

  /**
   * Check input validation and return an error or no
   * @param {string} value
   * @return {{ errorMessage: string, isInError: boolean }}
   */
  private checkInputValidation(value: string): { errorMessage?: string, isInError: boolean } {
    if (this.validators?.length) {
      const validator: Validator = FormValidator.validate(value, this.validators);
      const errorMessage: string = FormValidator.getErrorMessage(
        { validatorType: validator?.type, validators: this.validators, defaultErrors: "this.translations.error" }
      );

      if (errorMessage) {
        return { errorMessage, isInError: true };
      }
    }

    return { isInError: false };
  }

  fieldChangeHandler({ value, name }): void {
    if (value) {
      this.value = value;

      if (this.sendValue) {
        this.notify_fieldChanged_event.emit({ value, name });
      }
    }
  }

  render() {
    return (
      <div
        class="ds-input-field"
      >
        {this.label && (
          <ds-form-label
            fieldLabel={this.label}
            isInError={this.isInError}
            isRequired={this.isRequired}
          />
        )}

        {this.inputType === InputFieldType.INPUT && (
          <ds-input
            inputName={this.inputName}
            inputId={this.inputId}
            placeholder={this.inputPlaceholder}
            type={this.type}
            min={this.min}
            max={this.max}
            isDisabled={this.isDisabled}
            value={this.value}
            isInError={this.isInError}
            onDSInputBlur={this.inputHandler}
            onDSInput={this.inputHandler}
            />
            )}

        {this.inputType === InputFieldType.PASSWORD && (
          <ds-input-password
            inputName={this.inputName}
            inputId={this.inputId}
            placeholder={this.inputPlaceholder}
            type={this.type}
            min={this.min}
            max={this.max}
            isDisabled={this.isDisabled}
            value={this.value}
            isInError={this.isInError}
            onDSInputBlur={this.inputHandler}
          />
        )}

        {this.inputType === InputFieldType.PHONE && (
          <ds-input-phone
            value={this.value}
            inputName={this.inputName}
            inputId={this.inputId}
            isDisabled={this.isDisabled}
            isInError={this.isInError}
            onDSInputBlur={this.inputHandler}
          />
        )}

        {this.errorMessage && (
          <div
            id={`input-error-message-${this.inputName}`}
            class={{ 'ds-input-field__error-message': true }}
          >
            {this.errorMessage}
          </div>
        )}
      </div>
    );
  }
}
