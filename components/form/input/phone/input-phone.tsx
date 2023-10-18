/**
 * Vendor imports
 */
import { Component, EventEmitter, h, Prop, Event, State } from '@stencil/core';
import intlTelInput, { Iti } from 'intl-tel-input';
import { AsYouType, CountryCode } from 'libphonenumber-js';
/**
 * App imports
 */
import { DS_getDataCy, DS_injectSDK } from '../../../../../utils';
import { DataCy } from "../../../../../utils/data-cy";

declare global {
  interface Window {
    intlTelInputUtils: any;
  }
}

@Component({
  tag: 'ds-input-phone',
  styleUrl:'input-phone.scss',
})
export class GbxInputPhone {
  @Prop() inputName: string;
  @Prop() value: string;
  @Prop() inputId: string;
  @Prop() isDisabled: boolean;
  @Prop() preferredCountries: string[] = ['ch', 'fr'];
  @Prop() isInError: boolean;
  @Prop({ attribute: 'data-cy', mutable: true }) dataCy: DataCy = {
    pageName: null,
    elementName: null
  };

  @State() errorMessage: string;
  /**
   * Determine if the value is changed to set the state of the input
   */
  @State() isValueChanged: boolean;

  private iti: Iti;
  private inputPhone: HTMLInputElement;
  private selectedCountry: CountryCode = 'CH'; // default to swiss
  private intlUtils: any;
  private asYouType: AsYouType;

  @Event() gbxInputBlur: EventEmitter;

  constructor() {
    this.inputBlurHandler = this.inputBlurHandler.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.setPhoneNumberMaxLength = this.setPhoneNumberMaxLength.bind(this);
    this.pastePhoneHandler = this.pastePhoneHandler.bind(this);
  }

  async componentWillLoad() {
    if (typeof window.intlTelInputUtils === 'undefined') {
      try {
        await DS_injectSDK('intlTelInput', false);
        this.intlUtils = window.intlTelInputUtils;
      } catch (e) {
        console.error(e);
      }
    }

    this.asYouType = new AsYouType(this.selectedCountry);
  }

  componentDidLoad() {
    this.iti = intlTelInput(this.inputPhone, {
      preferredCountries: this.preferredCountries,
      nationalMode: false,
      formatOnDisplay: true,
      autoHideDialCode: false,
    });
  }

  /**
   * Get the selected country code from selected input
   * @return {CountryCode}
   */
  private getCountry(): CountryCode {
    return this.iti?.getSelectedCountryData()?.iso2?.toUpperCase();
  }

  /**
   * Set the phone number max length from the country code
   */
  private setPhoneNumberMaxLength(): void {
    if (!this.intlUtils) {
      this.intlUtils = window.intlTelInputUtils;
    }

    const exampleNumber: string = this.intlUtils?.getExampleNumber(this.selectedCountry, false, this.intlUtils.numberType.FIXED_LINE_OR_MOBILE);

    if (exampleNumber) {
      let maxLength = exampleNumber.length;

      // La lib est foireuse, ne renvoie pas le bon exemple pour allemand
      if (this.selectedCountry === 'DE') {
        maxLength =  exampleNumber.length + 3; // for dialCode
      }

      this.inputPhone.maxLength = maxLength;
    }
  }

  pastePhoneHandler(event: any): void {
    event.preventDefault();
    const value = event.clipboardData.getData('text');
    const newCountry = this.getCountry();

    this.asYouType.country = newCountry;
    this.selectedCountry = newCountry;
    this.setPhoneNumberMaxLength();
    this.asYouType.reset();

    this.value = this.asYouType.input(value);
  }

  inputBlurHandler(event: any): void {
    const { value } = event.target;
    const objectToSend: any = { name: this.inputName, value }

    let isValidNumber: boolean = this.iti.isValidNumber();

    if (!isValidNumber) {
      this.isInError = true;
      objectToSend.errorType = 'invalidNumber';
    }

    this.gbxInputBlur.emit(objectToSend);
  }

  inputHandler(event) {
    this.isValueChanged = true;
    const { value } = event.target;

    if (value.trim()?.length > 1) {
      const newCountry = this.getCountry();

      this.asYouType.country = newCountry;
      this.selectedCountry = newCountry;
      this.setPhoneNumberMaxLength();
      this.asYouType.reset();

      this.inputPhone.value = this.asYouType.input(value);
    } else {
      this.asYouType.country = null;
      this.selectedCountry = null;
      this.asYouType.reset();
    }
  }

  render() {
    return (
      <div class={{
        'ds-input-phone': true,
        'ds-input': true,
        "--phone": true,
        "--ltr-border": true,
        '--valid': this.value && !this.isInError && this.isValueChanged,
        '--error': this.isInError,
      }}>
        <input
          id={this.inputId}
          type="tel"
          max="4" // World shortest phone numbers are only 4 digits long
          name={this.inputName}
          disabled={this.isDisabled}
          ref={el => this.inputPhone = el as HTMLInputElement}
          onBlur={this.inputBlurHandler}
          onInput={this.inputHandler}
          value={this.value}
          data-cy={DS_getDataCy({
            ...this.dataCy,
            elementType: "Input",
            elementName: "Phone",
          })}
          onPaste={this.pastePhoneHandler}
        />
      </div>
    );
  }
}
