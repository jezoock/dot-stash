//#region Vendor imports
import { Component, Event, EventEmitter, h, Listen, Prop } from '@stencil/core';
//#endregion
//#region App imports
import { isFieldRequired } from '../../utils';
import { FormValidator } from '../../validator/form-validator';
import { Translations } from '../../../../interfaces';
import { DS_getDataCy, DS_setTranslations } from '../../../../../utils';
import { translations } from '../../translations';
import { Validator } from '../../validator/validator';
import { InputFieldType } from './input-field-type.enum';
import { DataCy } from "../../../../../utils/data-cy";

//#endregion

@Component({
  tag: 'ds-input-field',
  styleUrls: [
    'input-field.scss',
    './scss/button.scss',
  ],
})
export class GbxInput {

  @Prop() inputType: InputFieldType = InputFieldType.INPUT;
  @Prop() inputName: string;
  @Prop() inputPlaceholder: string;
  @Prop() value: string;
  @Prop() inputId: string;
  /**
   * Send data with an event
   * @type {boolean}
   */
  @Prop() sendValue: boolean = true;
  @Prop() label: string;
  @Prop() type: string = 'text';
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
  @Prop({ attribute: 'data-cy', mutable: true }) dataCy: DataCy = {
    pageName: null,
    elementName: null,
  };

  @Event() notify_fieldChanged_event: EventEmitter<{ value: string, name: string }>;
  @Event() clickButtonHandler: EventEmitter;

  private translations: Translations;
  private readonly isRequired: boolean;

  @Listen('notify_fieldInError_event')
  notify_fieldInError_eventHandler({ detail: { field, errorMessage } }) {
    if (field && errorMessage && field === this.inputName) {
      this.isInError = true;
      this.errorMessage = errorMessage;
    }
  }

  constructor() {
    this.translations = DS_setTranslations(translations, ['gbx_form']);
    this.inputHandler = this.inputHandler.bind(this);
    this.isRequired = isFieldRequired(this.validators);
  }

  inputHandler({ detail: { value, name, errorType } }) {
    if (!errorType) {
      const { errorMessage, isInError } = this.checkInputValidation(value);
      this.errorMessage = errorMessage;
      this.isInError = isInError;
    } else {
      this.errorMessage = this.translations.error[errorType];
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
        { validatorType: validator?.type, validators: this.validators, defaultErrors: this.translations.error }
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
        data-cy={DS_getDataCy({
          ...this.dataCy,
          elementType: "InputField",
        })}
      >
        {this.label && (
          <ds-form-label
            fieldLabel={this.label}
            isInError={this.isInError}
            isRequired={this.isRequired}
            data-cy={this.dataCy}
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
            onGbxInputBlur={this.inputHandler}
            onGbxInput={this.inputHandler}
            data-cy={this.dataCy}
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
            onGbxInputBlur={this.inputHandler}
            data-cy={this.dataCy}
          />
        )}

        {this.inputType === InputFieldType.PHONE && (
          <ds-input-phone
            value={this.value}
            inputName={this.inputName}
            inputId={this.inputId}
            isDisabled={this.isDisabled}
            isInError={this.isInError}
            onGbxInputBlur={this.inputHandler}
            data-cy={this.dataCy}
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
