/**
 * Vendor imports
 */
import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import dayjs from 'dayjs';
/**
 * App imports
 */
import { Translations } from '../../../interfaces';
import { DS_setTranslations } from '../../../../utils';
import { translations } from './translations';
import { ValidatorType } from '../../../ui/form/validator/validator-type.enum';
import { Universe } from '../../../../utils/universe';
import { AlertLevel } from '../../../ui/alert/alert-level.enum';
import { TitleType } from "../../../ui/title/title-type.enum";
import { ButtonLevel } from "../../../ui/button/button-level.enum";
import { PageName } from '../../../../enums/page-name.enum';

enum PhoneView {
  VALIDATION = "validation",
  CANCEL = "cancel",
}

@Component({
  tag: 'ds-account-validation',
  styleUrl: 'account-validation.scss',
})
export class GbxModalAccountValidation {
  @Prop({ mutable: true, reflect: true }) isValidationProcessing: boolean;
  @Prop({ mutable: true, reflect: true }) isValidationInError: boolean;
  @Prop({ mutable: true, reflect: true }) isResendValidationCodeProcessing: boolean;
  @Prop({ mutable: true, reflect: true }) isResendValidationCodeSend: boolean;
  @Prop({ mutable: true, reflect: true }) isResendValidationCodeInError: boolean;
  @Prop() universe: Universe = Universe.GROCERY;

  @State() timerInMs: number;
  @State() displayedView: PhoneView = PhoneView.VALIDATION;
  @State() canUserRequestNewCode: boolean;
  @State() isValidForm: boolean;

  private translations: Translations;
  private readonly baseTimerInMs: number = 60000; // 1 min
  private timerInterval: any;
  private validationCode: string;
  private readonly codeLength: number = 6;

  @Event() request_closePhoneValidationModal_event: EventEmitter;
  @Event() request_resendValidationCode_event: EventEmitter;
  @Event() notify_sendCodeValidation_event: EventEmitter;

  @Listen('notify_fieldChanged_event')
  notify_fieldChanged_eventHandler({ detail: { value, name } }) {
    if (name === 'digits') {
      this.validationCode = value;
      this.isValidForm = this.checkIfFormIsValid();
    }
  }

  constructor() {
    this.translations = {
      phoneValidation: DS_setTranslations(translations, ['gbx_phoneNumber']),
      cancelValidation: DS_setTranslations(translations, ['gbx_cancelValidation']),
    };
    this.timerInMs = this.baseTimerInMs;

    this.resendCodeClickHandler = this.resendCodeClickHandler.bind(this);
    this.sendCodeButtonClickHandler = this.sendCodeButtonClickHandler.bind(this);
    this.redirectToHelpCenterButtonClickHandler = this.redirectToHelpCenterButtonClickHandler.bind(this);
    this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.checkIfFormIsValid = this.checkIfFormIsValid.bind(this);
  }

  componentWillLoad() {
    this.initializeCountdownCodeTimer();
  }

  disconnectedCallback() {
    clearInterval(this.timerInterval);
  }

  /**
   * Initialize the timer who determine when customer can
   * send a request to renew the code
   * @private
   */
  private initializeCountdownCodeTimer(): void {
    this.timerInterval = setInterval(() => {
      this.canUserRequestNewCode = this.timerInMs === 0;

      if (this.timerInMs > 0) {
        this.timerInMs = this.timerInMs - 1000;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  /**
   * Format the code expiration time with format mm:ss (ex: 09:21)
   * @return {string}
   * @private
   */
  private formatCodeExpirationTime(): string {
    return dayjs(this.timerInMs).format('mm:ss');
  }

  private resendCodeClickHandler(): void {
    this.request_resendValidationCode_event.emit();
    clearInterval(this.timerInterval);
    this.timerInMs = this.baseTimerInMs;
    this.initializeCountdownCodeTimer();
  }

  private sendCodeButtonClickHandler(): void {
    this.notify_sendCodeValidation_event.emit({ code: this.validationCode });
  }

  private redirectToHelpCenterButtonClickHandler(): void {
    window.open('https://support.dot-jez.com/', '_blank');
  }

  /**
   * Change the state of the cancel button, to display the close content or the phone validation content
   * @param {boolean} needToClose
   * @private
   */
  private cancelButtonClickHandler(needToClose: boolean): void {
    this.displayedView = needToClose ? PhoneView.CANCEL : PhoneView.VALIDATION;
  }

  /**
   * Send an event to close the phone validation modal
   * @private
   */
  private closeModal(): void {
    this.request_closePhoneValidationModal_event.emit();
  }

  private checkIfFormIsValid(): boolean {
    return Boolean(this.validationCode);
  }

  render() {
    return (
      <div class="ds-account-validation">
        {this.isValidationProcessing && (
          <ds-loader message={this.translations.phoneValidation.messages.validationInProgress}/>
        )}

        {this.isResendValidationCodeProcessing && (
          <ds-loader message={this.translations.phoneValidation.messages.resendValidationCodeInProgress}/>
        )}

        <ds-title
          titleType={TitleType.TITLE2}
          
          mods={['auth', 'registered']}
        >
          {this.translations.phoneValidation.title}
          </ds-title>

        <p class="ds-phone-validation-content">
          <span>{this.translations.phoneValidation.paragraph.or}</span>

          <span class="ds-phone-validation-content__resend-code">
            <ds-button
              onClick={this.resendCodeClickHandler}
              
              buttonLevel={ButtonLevel.LINK}
              isDisabled={!this.canUserRequestNewCode}
            >
              {this.translations.phoneValidation.paragraph.resend}
            </ds-button>
          </span>

          <span class="ds-phone-validation-content__countdown">
              ({this.formatCodeExpirationTime()})
            </span>
        </p>

        {(this.isResendValidationCodeInError || this.isResendValidationCodeSend) && (
          <div class="ds-phone-validation-alert-message">
            {this.isResendValidationCodeInError && (
              <ds-alert
                level={AlertLevel.ERROR}
                message={this.translations.phoneValidation.messages.errors.resendCode}
              />
            )}

            {this.isResendValidationCodeSend && (
              <ds-alert
                level={AlertLevel.VALID}
                message={this.translations.phoneValidation.messages.valid.resendCode}
              />
            )}

          </div>
        )}

        <form novalidate>
          <ds-input-field
            inputPlaceholder={this.translations.phoneValidation.input.placeholder.replace('%charac%', this.codeLength)}
            inputId="register-phone-validation-digits"
            inputName="digits"
            isInError={this.isValidationInError}
            errorMessage={this.isValidationInError ? this.translations.phoneValidation.messages.errors.phoneValidation : null}
            validators={[
              {
                type: ValidatorType.REQUIRED,
                errorMessage: this.translations.phoneValidation.input.errors.required.replace('%charac%', this.codeLength)
              },
              {
                type: ValidatorType.MIN_LENGTH,
                errorMessage: this.translations.phoneValidation.input.errors.length.replace('%charac%', this.codeLength),
                argument: this.codeLength,
              },
              {
                type: ValidatorType.MAX_LENGTH,
                errorMessage: this.translations.phoneValidation.input.errors.length.replace('%charac%', this.codeLength),
                argument: this.codeLength,
              },
            ]}
          />
        </form>

        <div class="ds-account-validation__button">
          <ds-button
            
            buttonLevel={ButtonLevel.PRIMARY}
            buttonMods={["label", "phone-validation", "default"]}
            dataCy={{ pageName: PageName.REGISTRATION, elementName: 'PhoneValidationOK' }}
            isDisabled={!this.validationCode}
            onGbxButtonClick={this.sendCodeButtonClickHandler}
          >
            {this.translations.phoneValidation.buttons.register}
          </ds-button>
        </div>

        <div class="ds-account-validation__button">
          <ds-button
            
            buttonMods={['link', 'dotted']}
            buttonLevel={ButtonLevel.LINK}
            onGbxButtonClick={this.redirectToHelpCenterButtonClickHandler}
          >
            {this.translations.phoneValidation.buttons.help}
          </ds-button>
        </div>
      </div>
    );
  }
}
