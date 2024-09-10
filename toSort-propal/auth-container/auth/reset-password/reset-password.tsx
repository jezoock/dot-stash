import { Component, Event, EventEmitter, h, Listen, State } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { DS_eventDispatch, DS_isMobile, DS_setTranslations } from "../../../../../utils";
import { translations } from "./translations";
import { ValidatorType } from "../../../../ui/form/validator/validator-type.enum";
import { InputFieldType } from "../../../../ui/form/field/input/input-field-type.enum";
import { ButtonLevel } from "../../../../ui/button/button-level.enum";
import { PageName } from "../../../../../enums/page-name.enum";
import { TitleType } from "../../../../ui/title/title-type.enum";
import { FormValidator } from "../../../../ui/form/validator/form-validator";
import { Validator } from "../../../../ui/form/validator/validator";
import { AuthDisplayedView } from "../auth-displayed-view.enum";

@Component({
  tag: 'ds-reset-password',
  styleUrl: 'reset-password.scss',
})
export class DSResetPassword {

  @State() userEmail: string;
  @State() isButtonDisabled: boolean;

  // @ts-ignore
  private translations: Translations;
  private emailValidator: Validator;

  @Event() notify_resetPassword_event: EventEmitter;
  @Event() request_changeView_event: EventEmitter;

  @Listen('notify_resetPasswordOutcome_event')
  notify_resetPassword_outcome_eventHandler({ detail: { success } }: { detail: { success: boolean } }) {
    const toasterPosition = DS_isMobile() ? "top" : "bottom";
    const toasterSettings = {
      innerJSX: <span>{this.translations[success ? 'sentLink' : 'serverError']}</span>,
      closingDelay: 4000,
      type: success ? 'valid' : 'warning',
      position: [toasterPosition, 'right']
    };
    DS_eventDispatch('body', 'toaster_show_event', toasterSettings);
  }

  constructor() {
    this.translations = DS_setTranslations(translations, 'ds_resetPassword');

    this.emailValidator = {
      type: ValidatorType.EMAIL,
      errorMessage: this.translations.invalidEmail
    };

    this.isButtonDisabled = this.buttonShouldBeDisabled();
    // since the email field is empty by default, the button should be disabled
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.passwordResetHandler = this.passwordResetHandler.bind(this);
    this.cancelToLoginViewHandler = this.cancelToLoginViewHandler.bind(this);
  }

  private buttonShouldBeDisabled() {
    const validator = FormValidator.validate(this.userEmail, [this.emailValidator]);
    return Boolean(validator?.errorMessage);
    // if there's an error message, that means something went wrong
    // and the button should be disabled
  }

  //#region HANDLERS

  private inputChangeHandler(e: any) {
    const value = e.target.value;
    this.userEmail = value;
    this.isButtonDisabled = this.buttonShouldBeDisabled();
  }

  private passwordResetHandler() {
    this.notify_resetPassword_event.emit({ email: this.userEmail });
  }

  private cancelToLoginViewHandler() {
    this.request_changeView_event.emit({ view: AuthDisplayedView.LOGIN });
  }

  //#endregion

  render() {
    return (
      <div class="ds-forgot-password__container">
        <ds-title
          
          mods={['auth', 'reset-password']}
          titleType={TitleType.TITLE2}
          heading={4}
        >
          {this.translations.forgotPassword}
        </ds-title>

        <ds-input-field
          id="input-field-forgot-password"
          inputName="forgot-password"
          value={this.userEmail}
          inputPlaceholder={this.translations.email}
          inputId="forgot-password"
          inputType={InputFieldType.INPUT}
          onKeyUp={this.inputChangeHandler}
          validators={[this.emailValidator]}
          dataCy={{ pageName: PageName.REGISTRATION, elementName: "email-field" }}
        />

        <ds-button
          
          class="ds-forgot-password__request-password-reset"
          buttonMods={["label", "password-reset", "default"]}
          buttonLevel={ButtonLevel.PRIMARY}
          dataCy={{ pageName: PageName.REGISTRATION, elementName: 'send-reset-request-button' }}
          isDisabled={this.isButtonDisabled}
          onDSButtonClick={this.passwordResetHandler}
        >
          {this.translations.recoverPassword}
        </ds-button>

        <div class="ds-forgot-password__cancel-button-container">
          <ds-button
            
            buttonMods={['link', 'dotted']}
            buttonLevel={ButtonLevel.LINK}
            onDSButtonClick={this.cancelToLoginViewHandler}
            dataCy={{ pageName: PageName.REGISTRATION, elementName: 'cancel-to-login' }}
          >
            {this.translations.cancel}
          </ds-button>
        </div>
      </div>
    );
  }
}
