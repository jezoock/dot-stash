import { Component, h, State, Listen, Prop, Watch } from '@stencil/core';
import { Store } from '@stencil/redux';
import { translations } from './translations';
import {
  GetProfileAction,
  PutProfileAction,
  ChangePasswordAction,
  DeleteAddressAction,
  GetUserCreditCardsAction,
  DeletePaymentCardAction,
  ClearUserMessageAction,
  SetDataransDefaultCardAction,
  SetCheckoutDefaultCardAction,
  DeleteDatatransCardAction,
  AccountValidationAction
} from '../../../../_redux/actions/user';
import { ErrorCodeList, EventDetails, Translations } from '../../../interfaces';
import { Greenbox_eventDispatch, Greenbox_setTranslations, Greenbox_getInputValue } from '../../../../utils';
import GreenboxAPI from "../../../../_redux/services";
import { InputFieldType } from '../../../ui/form/field/input/input-field-type.enum';
import { ValidatorType } from '../../../ui/form/validator/validator-type.enum';
import { notifyFieldsError } from '../../../ui/form/utils';
import { PhoneValidation } from '../../../../utils/phone-validation';
import { AlertLevel } from '../../../ui/alert/alert-level.enum';
import { default as Cookies } from "js-cookie";

@Component({
  tag: 'gbx-profile',
  styleUrl: 'profile.scss',
})
export class GreenboxProfile {
  
  @Prop() isValidationProcessCanceled: boolean;
  @Prop({ context: 'store' }) store: Store;

  @State() settings: any;
  @State() user: any;
  @State() loading: boolean = true;
  @State() apiMessage: any;
  @State() hasMessage: boolean = false;
  @State() formCheckMessage: ErrorCodeList;
  @State() subscribeNewsletter: boolean = false;
  @State() allowPushNotifications: boolean = false;
  /**
   * TODO : Uniquement Phone pour l'instant, mais le reste sera à migrer plus tard
   * TODO : lors d'une refonte du profil
   */
  @State() userData: {
    phone: string;
  } = {
    phone: null,
  }

  @State() showPhoneValidation: boolean;
  @State() validation: PhoneValidation;
  @State() isValidationInError: boolean;
  @State() isValidationProcessing: boolean;
  @State() isResendValidationCodeProcessing: boolean;
  @State() isResendValidationCodeInError: boolean;
  @State() isResendValidationCodeSend: boolean;
  @State() mustDisplayPaymentMethodsBlock: boolean = true;
  @State() isAddressesPageActive: boolean;

  translations: Translations = Greenbox_setTranslations(translations, ['gbx_profile']);

  GetProfileAction: typeof GetProfileAction;
  PutProfileAction: typeof PutProfileAction;
  ChangePasswordAction: typeof ChangePasswordAction;
  DeletePaymentCardAction: typeof DeletePaymentCardAction;
  DeleteAddressAction: typeof DeleteAddressAction;
  ClearUserMessageAction: typeof ClearUserMessageAction;
  SetDataransDefaultCardAction: typeof SetDataransDefaultCardAction;
  GetUserCreditCardsAction: typeof GetUserCreditCardsAction;
  SetCheckoutDefaultCardAction: typeof SetCheckoutDefaultCardAction;
  DeleteDatatransCardAction: typeof DeleteDatatransCardAction;
  AccountValidationAction: typeof AccountValidationAction;

  //#region WATCHERS

  @Watch('user')
  userWatcher(newUser) {
    this.subscribeNewsletter = newUser.newsletter || false;
    this.allowPushNotifications = newUser.allowPushNotifications || false;
  }

  @Watch('validation')
  validationRequiredWatcher(newValidation) {
    this.showPhoneValidation = newValidation.isRequired;
    this.isValidationInError = newValidation.isInError;
    this.isValidationProcessing = newValidation.isProcessing;
  }

  @Watch('apiMessage')
  apiMessageWatcher(newMessage) {
    if (newMessage?.for) {
      switch (newMessage.for) {
        case "CHANGE_PASSWORD":
          Greenbox_eventDispatch(
            'gbx-password-change-block',
            'request_passwordDisplayMessage_event',
            { success: newMessage.success }
          );
          break;
        case "PUT_PROFILE":
          this.hasMessage = true;
          if (newMessage.error) {
            notifyFieldsError(newMessage.error, this.translations.message);
          }
          break;
      }
    }
  }

  @Watch("settings")
  settingsHandler(newSettings) { 
    if (newSettings?.smoodSettings?.customerWebsiteConfig?.account?.pages?.paymentMethods) {
      const { smoodSettings: { customerWebsiteConfig: { account: { pages: { paymentMethods: { isActive, featureFlagCookieName } } } } } } = newSettings;
      const featureFlagCookie = Cookies.get(featureFlagCookieName);
      this.mustDisplayPaymentMethodsBlock = !(isActive || featureFlagCookie);
    }
    this.checkIfAddressesPageIsActive()
  }

  //#endregion

  //#region LISTENERS

  @Listen('notify_fieldChanged_event')
  notify_fieldChanged_eventHandler({ detail: { value, name } }) {
    this.updateData({ value, name })
  }

  @Listen('request_addressSetAsDefault_event')
  address_request_addressSetAsDefault_eventHandler({detail: {address}}: EventDetails) {
    this.PutProfileAction({ defaultAddress: address });
  }

  @Listen('request_addressDelete_event')
  address_request_addressDelete_eventHandler({ detail: { index } }: EventDetails) {
    const { addresses } = this.user;
    addresses.splice(index, 1);

    const userData: any = {
      id: this.user.id,
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      addresses,
    };
    if (this.user.defaultAddress) {
      userData.defaultAddress = { ...this.user.defaultAddress };
    }
    this.PutProfileAction(userData);
  }

  @Listen('request_creditCardDelete_event')
  async request_creditCardDelete_eventHandler({ detail: { cardId, cardType } }: EventDetails) {
    if (cardType === 'datatrans') {
      try {
        await this.DeleteDatatransCardAction(cardId);

        Greenbox_eventDispatch(
          ['body'], 'toaster_show_event',
          {
            type: 'valid',
            innerJSX: [
              <span>{this.translations.cards.success}</span>
            ],
            closingDelay: 4000
          }
        );
      } catch (e) {
        Greenbox_eventDispatch(
          ['body'],
          'toaster_show_event',
          {
            type: 'error',
            innerJSX: [
              <span>{this.translations.cards.error}</span>
            ],
            closingDelay: 4000
          }
        );
      }
    } else if (cardType === 'checkout') {
      this.DeletePaymentCardAction({ cardId });
    }
  }

  @Listen('request_creditCardSetAsDefault_event')
  request_creditCardSetAsDefault_eventHandler({ detail: { cardId, cardType: cardProvider } }: EventDetails) {
    if (cardProvider === 'datatrans') {
      this.SetDataransDefaultCardAction(cardId);
    } else {
      this.SetCheckoutDefaultCardAction(cardId);
    }
  }

  @Listen('notify_passwordChange_event')
  notify_passwordChange_eventHandler({ detail: { password } }: EventDetails) {
    this.ChangePasswordAction(password);
  }

  @Listen('notify_messageTimerEnd_event')
  notify_messageTimerEnd_eventHandler() {
    this.hasMessage = false;
  }

  @Listen('request_closePhoneValidationModal_event')
  request_closePhoneValidationModal_eventHandler() {
    this.showPhoneValidation = false;
    this.isValidationProcessCanceled = true;
  }

  @Listen('notify_sendCodeValidation_event')
  async notify_sendCodeValidation_eventHandler({ detail: { code } }) {
    await this.AccountValidationAction({ code, to: this.validation?.to, from: 'profile' });
  }

  @Listen('request_resendValidationCode_event')
  async request_resendValidationCode_eventHandler() {
    this.isResendValidationCodeProcessing = true;
    this.isResendValidationCodeSend = false;

    try {
      await GreenboxAPI.resendValidationCode(this.validation?.to);
      this.isResendValidationCodeProcessing = false;
      this.isResendValidationCodeInError = false;
      this.isResendValidationCodeSend = true;
    } catch (e) {
      this.isResendValidationCodeProcessing = false;
      this.isResendValidationCodeInError = true;
      this.isResendValidationCodeSend = false;
    }
  }

  //#endregion

  constructor() {
    this.toggleNewsletter = this.toggleNewsletter.bind(this);
    this.toggleAllowPushNotifications = this.toggleAllowPushNotifications.bind(this);
  }

  //#region LIFECYCLE CALLBACKS

  async componentWillLoad() {
    this.store.mapStateToProps(this, ({
      app: { settings },
      user: { loading, user, message, validation },
    }) => ({
      settings,
      user,
      loading,
      apiMessage: message,
      validation
    }));

    this.store.mapDispatchToProps(this, {
      GetProfileAction,
      PutProfileAction,
      ChangePasswordAction,
      DeleteAddressAction,
      DeletePaymentCardAction,
      ClearUserMessageAction,
      SetDataransDefaultCardAction,
      SetCheckoutDefaultCardAction,
      GetUserCreditCardsAction,
      DeleteDatatransCardAction,
      AccountValidationAction,
    });

    await this.GetProfileAction();
    this.GetUserCreditCardsAction(this.user.defaultCardId);
  }

  disconnectedCallback() {
    this.ClearUserMessageAction();
  }

  //#endregion

  toggleNewsletter() {
    this.subscribeNewsletter = !this.subscribeNewsletter;
  }

  toggleAllowPushNotifications() {
    this.allowPushNotifications = !this.allowPushNotifications;
  }

  /**
   * Update the register data
   * @param {string} value  the new field value
   * @param {string} name   the field needed to be updated in 'registerData'
   */
  private updateData({ value, name }): void {
    if (name) {
      this.userData = { ...this.userData, [name]: value };
    }
  }

  checkPutProfile(data) {
    let hasError: boolean = false;
    const errorMessages: ErrorCodeList = {};

    if (!data.firstname || data.firstname === '') {
      hasError = true;
      errorMessages.firstname = [{ rule: 'required' }];
    }

    if (!data.lastname || data.lastname === '') {
      hasError = true;
      errorMessages.lastname = [{ rule: 'required' }];
    }

    this.displayMessage(hasError ? errorMessages : null);

    return hasError;
  }

  async putProfileForm(event: Event): Promise<void> {
    this.isValidationProcessCanceled = false;
    event.preventDefault();

    const data: {
      firstname: string;
      lastname: string;
      company: string;
      phone?: string;
      newsletter: boolean;
      email?: string;
      cumulusNumber?: string;
      allowPushNotifications: boolean;
    } = {
      firstname: Greenbox_getInputValue('profileForm', 'firstname').trim(),
      lastname: Greenbox_getInputValue('profileForm', 'lastname').trim(),
      company: Greenbox_getInputValue('profileForm', 'company'),
      newsletter: this.subscribeNewsletter,
      allowPushNotifications: this.allowPushNotifications,
    };

    if (this.userData.phone !== this.user.phones[0]) {
      data.phone = this.userData.phone;
    }

    const profileEmail = Greenbox_getInputValue('profileForm', 'email');
    if (profileEmail !== this.user.email) {
      data.email = profileEmail;
    }

    const profileCumulus = Greenbox_getInputValue('profileForm', 'cumulus');
    if (profileCumulus !== this.user.cumulNumber) {
      data.cumulusNumber = profileCumulus;
    }

    if (!this.checkPutProfile(data)) {
      await this.PutProfileAction(data);
      // Because API not return all data on PUT profile
      await this.GetProfileAction();
    }
  }

  displayMessage( message: any ): void {
		this.formCheckMessage = message;
  }


  checkIfAddressesPageIsActive() : boolean{
    const addressesPageFeatureFlagCookieName = this.settings?.smoodSettings?.customerWebsiteConfig?.account?.pages?.addresses?.featureFlagCookieName
    const doesCookieAddressesPageFeatureFlagExists = Cookies.get(addressesPageFeatureFlagCookieName) !== undefined;
    this.isAddressesPageActive = this.settings?.smoodSettings?.customerWebsiteConfig?.account?.pages?.addresses?.isActive || doesCookieAddressesPageFeatureFlagExists;
    return this.isAddressesPageActive
  }

  render() {
    return (
      <div class="gbx-profile">

        {this.loading && (
          <gbx-loader message="Loading" />
        )}

        {this.showPhoneValidation && (
          <gbx-account-validation
            isValidationProcessing={this.isValidationProcessing}
            isValidationInError={this.isValidationInError}
            isResendValidationCodeProcessing={this.isResendValidationCodeProcessing}
            isResendValidationCodeInError={this.isResendValidationCodeInError}
            isResendValidationCodeSend={this.isResendValidationCodeSend}
          />
        )}

        <div class="gbx-profile__form">

          <gbx-block
            blockTag="section"
            blockMods={['account', 'user-info']}
          >
            <gbx-title
              slot="header"
              heading={3}
              titleMods={['block', 'main']}
            >
              {this.translations.title.personalInfos}
            </gbx-title>

            {this.isValidationProcessCanceled && (
              <gbx-alert
                level={AlertLevel.INFO}
                message={this.translations.message.error.phone.notUpdated}
              />
            )}

            <form
              class={{
                'gbx-form': true,
                '--default': true,
              }}
              id="profileForm"
              onSubmit={(e) => this.putProfileForm(e)}
            >
              {this.formCheckMessage && (
                <gbx-message
                  messages={this.formCheckMessage}
                  messageMods={['error']}
                  messageTimer={3000}
                  messageGetFocus={true}
                  messageFocusElement={'.gbx-lightbox.--profile .gbx-modal__content'}
                />
              )}

              {this.hasMessage && this.apiMessage?.for === 'PUT_PROFILE' && (
                <gbx-message
                  messages={this.translations.updateProfile[ this.apiMessage.success ? 'success' : 'error' ]}
                  messageMods={[this.apiMessage.success ? 'valid' : 'error']}
                  messageTimer={3000}
                  messageGetFocus={true}
                  messageFocusElement={'.gbx-lightbox.--profile .gbx-modal__content'}
                />
              )}

              <fieldset class="gbx-form__input">
                <label htmlFor="profileFormFirstname">
                  {this.translations.settings.firstname}
                </label>
                <input
                  type="text"
                  name="firstname"
                  id="profileFormFirstname"
                  value={this.user.firstname} />
              </fieldset>

              <fieldset class="gbx-form__input">
                <label htmlFor="profileFormLastname">
                  {this.translations.settings.lastname}
                </label>
                <input
                  type="text"
                  name="lastname"
                  id="profileFormLastname"
                  value={this.user.lastname}
                />
              </fieldset>

              <fieldset class="gbx-form__input">
                <label htmlFor="profileFormEmail">
                  {this.translations.settings.email}
                </label>
                <input
                  type="email"
                  name="email"
                  id="profileFormEmail"
                  value={this.user.email}
                />
              </fieldset>

              <fieldset class="gbx-form__input">
                <gbx-input-field
                  id="profile-input-field-phone"
                  value={this.user.phones && this.user.phones[0]}
                  inputName="phone"
                  inputId="profile-phone-number"
                  label={this.translations.settings.phones}
                  inputType={InputFieldType.PHONE}
                  validators={[
                    { type: ValidatorType.REQUIRED, errorMessage: this.translations.message.error.phone.required },
                  ]}
                />
              </fieldset>

              <fieldset class="gbx-form__input">
                <label htmlFor="profileFormCompany">
                  {this.translations.settings.company}
                </label>
                <input
                  type="text"
                  name="company"
                  id="profileFormCompany"
                  value={this.user.company}
                />
              </fieldset>

              <fieldset class="gbx-form__input">
                <label htmlFor="profileFormCumulus">
                  {this.translations.settings.cumulus}
                </label>
                <input
                  type="text"
                  name="cumulus"
                  id="profileFormCumulus"
                  value={this.user.cumulusNumber}
                />
                <span
                  class="gbx-profile__cumulus-info"
                  innerHTML={this.translations.settings.cumulusInfo}
                />
              </fieldset>

              <fieldset class="gbx-form__checkbox">
                <gbx-checkbox
                  inputId="profileFormNewsletter"
                  isChecked={this.subscribeNewsletter}
                  onClick={this.toggleNewsletter}
                />

                <label htmlFor="profileFormNewsletter">
                  {this.translations.settings.newsletter}
                </label>
              </fieldset>

              <fieldset class="gbx-form__checkbox">
                <gbx-checkbox
                  inputId="allowPushNotifications"
                  isChecked={this.user.allowPushNotifications}
                  onClick={this.toggleAllowPushNotifications}
                />

                <label htmlFor="allowPushNotifications">
                  {this.translations.settings.notification}
                </label>
              </fieldset>

              <fieldset class="gbx-form__input">
                <button
                  type="submit"
                  class={{
                    'gbx-button': true,
                    '--profile': true,
                    '--color-2': true,
                  }}>
                  {this.translations.buttons.update}
                </button>
              </fieldset>
            </form>
          </gbx-block>

          <gbx-password-change-block />
          
          {!this.isAddressesPageActive && (
            <gbx-address-block
              defaultAddress={this.user.defaultAddress}
              addresses={this.user.addresses}
            />
          )}
          
          {this.mustDisplayPaymentMethodsBlock && (
            <gbx-credit-card-block creditCards={this.user.creditCards} />
          )}

        </div>
      </div>   
    );
  }
}
