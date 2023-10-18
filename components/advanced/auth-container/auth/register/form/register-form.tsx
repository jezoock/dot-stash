//#region Vendor imports
import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
//#endregion

//#region App imports
import { ValidatorType } from '../../../../../ui/form/validator/validator-type.enum';
import { Greenbox_getAppSettings, Greenbox_injectSDK, Greenbox_setTranslations } from '../../../../../../utils';
import { translations } from './translations';
import { Translations } from '../../../../../interfaces';
import { Validators } from '../../../../../ui/form/validator/validators';
import { InputFieldType } from '../../../../../ui/form/field/input/input-field-type.enum';
import { ButtonLevel } from "../../../../../ui/button/button-level.enum";
//#endregion

declare global {
  interface Window {
    grecaptcha: any;
    callbackSuccessfulGrecaptcha: any;
  }
}

@Component({
  tag: 'gbx-register-form',
  styleUrl: 'register-form.scss',
})
export class GbxRegisterForm {

  @Prop({ mutable: true, reflect: true }) registerData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
    company?: string;
    phone: string;
    acceptCGU: boolean;
  } = {
    firstname: null,
    lastname: null,
    email: null,
    password: null,
    confirmPassword: null,
    company: null,
    phone: null,
    acceptCGU: false,
  }
  @Prop({ mutable: true, reflect: true }) isRegisterProcessing: boolean;

  @State() isValidForm: boolean;
  @State() isFormDisabled: boolean;

  private translations: Translations;
  private minPasswordLength: number = 8;
  private grecaptcha: any;

  @Event() notify_registerFormSend_event: EventEmitter;

  @Listen('notify_fieldChanged_event')
  notify_fieldChanged_eventHandler({ detail: { value, name } }) {
    this.updateRegisterData({ value, name })
  }

  constructor() {
    this.translations = Greenbox_setTranslations(translations, ['gbx_registerForm']);

    this.register = this.register.bind(this);
    this.cguClickHandler = this.cguClickHandler.bind(this);
    this.callbackSuccessfulGrecaptcha = this.callbackSuccessfulGrecaptcha.bind(this);
    this.registerClickHandler = this.registerClickHandler.bind(this);
  }

  componentWillLoad() {
    this.isValidForm = this.validateForm();
    window.callbackSuccessfulGrecaptcha = this.callbackSuccessfulGrecaptcha;
  }

  async componentDidLoad() {
    let sitekeys : string = "";

    if (typeof window.grecaptcha === 'undefined') {
      try {
        await Greenbox_injectSDK('grecaptcha', false);
        this.grecaptcha = window.grecaptcha;
      } catch (e) {
        console.error(e);
      }
    } else {
      this.grecaptcha = window.grecaptcha;
    }

    if (Greenbox_getAppSettings()?.google_recaptcha_public) {
      sitekeys = Greenbox_getAppSettings()?.google_recaptcha_public;
    } else {
      sitekeys = Greenbox_getAppSettings()?.credentials?.google?.recaptcha?.publicKey;
    }

    this.grecaptcha.render("register", {
      'sitekey': sitekeys,
      'callback': this.callbackSuccessfulGrecaptcha
    });
  }

  private validateForm(): boolean {
    const { firstname, lastname, email, password, confirmPassword, phone, acceptCGU } = this.registerData;

    return !!(
      firstname
      && lastname
      && email
      && password
      && confirmPassword
      && Validators.isSame({ value: password, argument: confirmPassword })
      && phone
      && acceptCGU
    );
  }

  private register(): void {
    this.notify_registerFormSend_event.emit(this.registerData);
    this.isRegisterProcessing = true;
  }

  cguClickHandler({ detail: { hasAcceptedCgu } }): void {
    this.updateRegisterData({ value: hasAcceptedCgu, name: 'acceptCGU' })
  }

  /**
   * Update the register data
   * @param {string} value  the new field value
   * @param {string} name   the field needed to be updated in 'registerData'
   */
  private updateRegisterData({ value, name }): void {
    if (name) {
      this.registerData = { ...this.registerData, [name]: value };
      this.isValidForm = this.validateForm();
    }
  }

  registerClickHandler(): void {
    this.grecaptcha.reset();
    this.grecaptcha.execute();
  }

  callbackSuccessfulGrecaptcha(): void {
    this.register();
  }

  render() {
    return (
      <form class="gbx-register-form">
        {this.isRegisterProcessing && (
          <gbx-loader message={this.translations.message.registerInProgress} />
        )}
        <gbx-input-field
          id="input-field-firstname"
          value={this.registerData.firstname}
          inputName="firstname"
          inputId="register-firstname"
          inputPlaceholder={this.translations.label.firstname}
          isDisabled={this.isFormDisabled}
          validators={[
            { type: ValidatorType.REQUIRED, errorMessage: this.translations.message.error.firstname.required }
          ]}
        />

        <gbx-input-field
          id="input-field-lastname"
          value={this.registerData.lastname}
          inputName="lastname"
          inputId="register-lastname"
          inputPlaceholder={this.translations.label.lastname}
          isDisabled={this.isFormDisabled}
          validators={[
            { type: ValidatorType.REQUIRED, errorMessage: this.translations.message.error.lastname.required }
          ]}
        />
        <gbx-input-field
          id="input-field-email"
          value={this.registerData.email}
          inputName="email"
          inputId="register-email"
          inputPlaceholder={this.translations.label.email}
          isDisabled={this.isFormDisabled}
          validators={[
            { type: ValidatorType.REQUIRED, errorMessage: this.translations.message.error.email.required },
            { type: ValidatorType.EMAIL, errorMessage: this.translations.message.error.email.invalid },
          ]}
        />

        <gbx-input-field
          id="input-field-phone"
          value={this.registerData.phone}
          inputName="phone"
          inputId="register-phone-number"
          inputPlaceholder={this.translations.label.phone}
          inputType={InputFieldType.PHONE}
          isDisabled={this.isFormDisabled}
          validators={[
            { type: ValidatorType.REQUIRED, errorMessage: this.translations.message.error.phone.required },
          ]}
        />

        <gbx-input-field
          id="input-field-password"
          value={this.registerData.password}
          inputName="password"
          inputId="register-password"
          inputPlaceholder={this.translations.label.password}
          type="password"
          min={8}
          inputType={InputFieldType.PASSWORD}
          isDisabled={this.isFormDisabled}
          validators={[
            { type: ValidatorType.REQUIRED, errorMessage: this.translations.message.error.password.required },
            {
              type: ValidatorType.MIN_LENGTH,
              errorMessage: this.translations.message.error.password.minLength.replace('%charac%', this.minPasswordLength),
              argument: this.minPasswordLength
            },
          ]}
        />

        <gbx-input-field
          id="input-field-confirm-password"
          value={this.registerData.confirmPassword}
          inputName="confirmPassword"
          inputId="register-confirm-password"
          inputPlaceholder={this.translations.label.confirmPassword}
          type="password"
          min={8}
          inputType={InputFieldType.PASSWORD}
          isDisabled={this.isFormDisabled}
          validators={[
            { type: ValidatorType.REQUIRED, errorMessage: this.translations.message.error.confirmPassword.required },
            {
              type: ValidatorType.MIN_LENGTH,
              errorMessage: this.translations.message.error.password.minLength.replace('%charac%', this.minPasswordLength),
              argument: this.minPasswordLength
            },
            {
              type: ValidatorType.IS_SAME,
              errorMessage: this.translations.message.error.confirmPassword.notSame,
              argument: this.registerData.password
            },
          ]}
        />

        <gbx-input-field
          id="input-field-company"
          value={this.registerData.company}
          inputName="company"
          inputId="register-company"
          isDisabled={this.isFormDisabled}
          inputPlaceholder={this.translations.label.company}
        />

        <gbx-cgu
          checkboxId="register-cgu"
          onGbxCGUClick={this.cguClickHandler}
          hasAcceptedCgu={this.registerData.acceptCGU}
        />

        <div class="gbx-register-form__button">
          <gbx-button
            useSnack={true}
            buttonMods={['label', 'register', 'default']}
            buttonLevel={ButtonLevel.PRIMARY}
            onGbxButtonClick={this.registerClickHandler}
            isDisabled={!this.isValidForm || this.isRegisterProcessing}
            buttonId="register"
          >
            {this.translations.button.register}
          </gbx-button>
        </div>
      </form>
    );
  }
}
