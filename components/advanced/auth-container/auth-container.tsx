import {
  Component,
  EventEmitter,
  h,
  Listen,
  Prop,
  State,
  Watch,
  Event,
} from "@stencil/core";
import { Unsubscribe } from "redux";
import { Action, Store } from "@stencil/redux";
import { DSCredentials } from "../../interfaces";
import {
  DS_closeModal,
  DS_eventDispatch,
  DS_getAppLocale,
  DS_setTranslations,
  DS_triggerTrackingEvent,
} from '../../../utils';
import { AskResetPasswordAction } from "../../../_redux/actions/user";
import { default as Cookies } from "js-cookie";
import { PhoneValidation } from "../../../utils/phone-validation";
import { DSUserProfile, Translations } from "../../interfaces";
import {
  AccountValidationAction,
  RegisterAction,
  AppleAuthAction,
  FacebookAuthAction,
  GoogleAuthAction,
  UserLoginAction,
  RemoveLoginErrorAction,
  RemoveRegisterErrorAction,
} from "../../../_redux/actions/user";
import { notifyFieldsError } from "../../ui/form/utils";
import DSAPI from "../../../_redux/services";
import { translations as RegisterTranslations } from "./auth/register/form/translations";
import { AuthDisplayedView } from "./auth/auth-displayed-view.enum";
import { redirectToCheckout } from '../../../utils/redirect-to-checkout';

declare var gapi;
@Component({
  tag: "ds-auth-container",
})
export class GbxAuthContainer {
  @Prop({ context: "store" }) store: Store;
  @Prop() redirectToCheckout: boolean = false;
  @Prop() cartId: string;

  @State() settings: any;
  @State() userToken: string;
  @State() isGrocery: boolean = true;
  @State() loading: boolean = false;
  @State() hasMessage: boolean = false;
  @State() view: AuthDisplayedView = undefined;
  @State() apiMessage: any;

  @State() user: DSUserProfile;

  //#region Registration
  @State() registerData: any;
  @State() registerError: any;
  @State() isRegisterInError: boolean;
  @State() registerRedirect: any;
  @State() isRegisterProcessing: boolean;
  @State() hasRegistrationFailed: boolean;
  @State() isModalHelpShown: boolean = false;

  @State() showPhoneValidation: boolean;
  @State() validation: PhoneValidation;
  @State() isValidationInError: boolean;
  @State() isValidationProcessing: boolean;
  @State() isResendValidationCodeProcessing: boolean;
  @State() isResendValidationCodeInError: boolean;
  @State() isResendValidationCodeSend: boolean;
  //#endregion

  //#region Events
  @Event() notify_resetPasswordOutcome_event: EventEmitter;
  //#endregion

  //#region Actions
  RegisterAction: Action;
  AccountValidationAction: Action;
  AskResetPasswordAction: Action;
  UserLoginAction: Action;
  RemoveLoginErrorAction: Action;
  RemoveRegisterErrorAction: Action;
  GoogleAuthAction: Action;
  FacebookAuthAction: Action;
  AppleAuthAction: Action;
  //#endregion

  private translations: Translations;
  private unsubscribe!: Unsubscribe;
  @Event() request_authFormDisplay_event: EventEmitter;
  @Event() request_errorLogin_event: EventEmitter;

  @Prop() notRegistered: any;

  @State() credentials: DSCredentials = { username: "", password: "" };
  @State() message: string = "";
  @State() error: boolean = false;
  @State() hasLoginFailed: boolean = false;

  @Watch("apiMessage")
  handlePasswordResetFeedback() {
    if (this.apiMessage?.success) {
      const { success }: { success: boolean } = this.apiMessage;
      DS_eventDispatch(
        "ds-reset-password",
        "notify_resetPasswordOutcome_event",
        { success }
      );
    }
  }

  @Watch("registerError")
  registerErrorWatcher() {
    this.isRegisterProcessing = false;

    if (
      this.registerError &&
      !this.registerError.success &&
      this.registerError.error
    ) {
      const { error } = this.registerError;
      if (Object.keys(error).length) {
        if (error.data) {
          for (const attr in error?.data?.invalidAttributes) {
            if (attr) {
              const rule = error?.data?.invalidAttributes[attr][0]?.rule;
              if (attr === "phone" && rule === "uniquePhone") {
                this.isModalHelpShown = true;
              }
           }
          }
        }
        if (error.code !== "E_BAD_REQUEST") {
          this.hasRegistrationFailed = true;
        } else {
          notifyFieldsError(error, this.translations.registerForm.message);
        }
      }
    }
  }

  @Watch("validation")
  validationRequiredWatcher(updatedValidation) {
    this.showPhoneValidation = updatedValidation?.isRequired;
    this.isValidationInError = updatedValidation?.isInError;
    this.isValidationProcessing = updatedValidation?.isProcessing;
  }

  @Watch("registerRedirect")
  registerRedirectWatcher() {
    if (this.registerRedirect) {
      DS_triggerTrackingEvent({ eventName: 'SUCCESS_SIGNUP', eventDetails: { customerId: this.user.id } });
      
      DS_eventDispatch(["ds-auth"], "request_changeView_event", {
        view: AuthDisplayedView.THANKS_FOR_REGISTER,
      });

      if (this.user?.firstname) {
        DS_eventDispatch(["ds-auth"], "request_firstNameUpdate_event", {
          firstname: this.user.firstname,
        });
      }
    }
  }

  @Listen("request_closeRegistrationHelp_event")
  request_closeRegistrationHelp_eventHandler() {
    this.RemoveRegisterErrorAction();
  }

  @Listen("request_closeAuthModal_event")
  request_closeAuthModal_eventHandler() {
    if (this.hasLoginFailed) {
      this.RemoveLoginErrorAction();
    }
    DS_closeModal("authLightbox");
  }

  @Listen("request_resetPassword_event")
  request_resetPassword_eventHandler({ detail: { email } }) {
    this.AskResetPasswordAction(email);
  }


  @Listen("notify_thanksForRegisterClosed_event")
  async notify_thanksForRegisterClosed_eventHandler() {
    await this.redirectToCheckoutIfNeeded();
  }

  @Listen("request_loginAuthButton_event")
  async request_loginAuthButton_eventHandler({ detail }) {
    const e = await this.UserLoginAction(detail);

    if (e) {
      DS_triggerTrackingEvent({
        eventName: 'SUCCESS_LOGIN',
        eventDetails: {
          login_type: 'Email',
          customerId: this.user.id
        }
      });

      const url = new URL(window.location.href);
      const b2bInvitationToken = url.searchParams.get("b2bInvitationToken");
      
      if (b2bInvitationToken) {
        DS_eventDispatch(window, 'request_continueB2BLoginFlow_event');
      } else {
        DS_closeModal("authLightbox");
      }
    }

    const url = new URL(window.location.href);
    const b2bInvitationToken = url.searchParams.get("b2bInvitationToken");

    if (b2bInvitationToken) {
      DS_eventDispatch(window, 'request_continueB2BLoginFlow_event');
    } else {
      DS_closeModal("authLightbox");
    }

    await this.redirectToCheckoutIfNeeded();
  }

  @Listen("request_facebookAuthButton_event")
  async request_facebookAuthButton_eventHandler({ detail }) {
    DS_triggerTrackingEvent({
      eventName: 'SUCCESS_LOGIN',
      eventDetails: {
        login_type: 'Facebook',
        customerId: this.user.id
      }
    });

    await this.FacebookAuthAction(detail);
    await this.redirectToCheckoutIfNeeded();
  }

  @Listen("request_appleAuthButton_event")
  async request_appleAuthButton_eventHandler({ detail }) {
    DS_triggerTrackingEvent({
      eventName: 'SUCCESS_LOGIN',
      eventDetails: {
        login_type: 'Apple',
        customerId: this.user.id
      }
    });

    await this.AppleAuthAction(detail);
    await this.redirectToCheckoutIfNeeded();
  }

  @Listen("request_googleAuthButton_event")
  async request_googleAuthButton_eventHandler({ detail }) {
    DS_triggerTrackingEvent({
      eventName: 'SUCCESS_LOGIN',
      eventDetails: {
        login_type: 'Google',
        customerId: this.user.id
      }
    });

    await this.GoogleAuthAction(detail);
    await this.redirectToCheckoutIfNeeded();
  }

  @Listen("request_registerProcess_event")
  async request_registerProcess_eventHandler({ detail: registerData }) {
    this.registerData = registerData;
    await this.register();
  }

  @Listen("request_closePhoneValidationModal_event")
  request_closePhoneValidationModal_eventHandler() {
    this.showPhoneValidation = false;
    this.isRegisterInError = false;
    this.isRegisterProcessing = false;
  }

  @Listen("notify_sendCodeValidation_event")
  async notify_sendCodeValidation_eventHandler({ detail: { code } }) {
    await this.AccountValidationAction({
      code,
      to: this.validation?.to,
      from: "register",
    });
  }

  @Listen("request_resendValidationCode_event")
  async request_resendValidationCode_eventHandler() {
    this.isResendValidationCodeProcessing = true;
    this.isResendValidationCodeSend = false;

    try {
      await DSAPI.resendValidationCode(this.validation?.to);
      this.isResendValidationCodeProcessing = false;
      this.isResendValidationCodeInError = false;
      this.isResendValidationCodeSend = true;
    } catch (e) {
      if (e.code === "E_TOO_MANY_REQUESTS") {
        this.isModalHelpShown = true;
      }
      this.isResendValidationCodeProcessing = false;
      this.isResendValidationCodeInError = true;
      this.isResendValidationCodeSend = false;
    }
  }

  @Watch("user")
  watchUser() {
    if (this.user?.id) {
      DS_eventDispatch("ds-cart-block", "request_cartStepSet_event", {
        step: 0,
      });
    }
  }

  @Watch("apiMessage")
  apiMessageWatcher(newMessage) {
    if (newMessage?.for) {
      switch (newMessage.for) {
        case "USER_LOGIN":
          if (newMessage.code && newMessage.code === "E_UNAUTHORIZED") {
            this.hasLoginFailed = true;
          } else {
            DS_eventDispatch("request_authFormDisplay_event", {
              success: newMessage.success,
            });
          }
          break;
      }
    }
  }

  @Watch("notRegistered")
  watchHandler(newValue: any) {
    if (newValue == "google") {
      const user = window["GoogleAuth"].currentUser.get();
      const registerFormData = {
        googleId: user.getId(),
        token: user.getAuthResponse().id_token,
        firstname: user.getBasicProfile().getGivenName(),
        lastname: user.getBasicProfile().getFamilyName(),
        email: user.getBasicProfile().getEmail(),
      };

      const googleConnectButton = document.getElementById("googleConnect");
      if (googleConnectButton) {
        googleConnectButton.removeAttribute("disabled");
      }

      this.registerData = registerFormData;
      this.view = AuthDisplayedView.REGISTER;
    } else if (newValue == "facebook") {
      window["FB"].api(
        "/me?fields=id,first_name,last_name,email",
        (response) => {
          const registerFormData = {
            facebookId: response.id,
            firstname: response.first_name,
            lastname: response.last_name,
            email: response.email,
            token: this.userToken,
          };
          const facebookConnectButton = document.getElementById(
            "facebookConnect"
          );
          if (facebookConnectButton) {
            facebookConnectButton.removeAttribute("disabled");
          }

          this.registerData = registerFormData;
          this.view = AuthDisplayedView.REGISTER;
        },
        { scope: "public_profile,email" }
      );
    } else if (newValue == "apple") {
      if(window["AppleID"].auth.currentUser) {
        const user = window["AppleID"].auth.currentUser;
        const registerFormData = {
          appleId: user.appleId,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          token: user.token,
        };
        this.registerData = registerFormData;
      }
      this.view = AuthDisplayedView.REGISTER;
    }
  }

  constructor() {
    this.translations = {
      registerForm: DS_setTranslations(RegisterTranslations, [
        "gbx_registerForm",
      ]),
    };
  }

  componentWillLoad() {
    this.unsubscribe = this.store?.mapStateToProps(this, (state) => {
      const {
        app: { settings },
        user: {
          user,
          message,
          error,
          registerRedirect,
          loading,
          validation,
          notRegistered,
        },
      } = state;
      return {
        user,
        registerError: message,
        isRegisterInError: error,
        isRegisterProcessing: loading,
        registerRedirect,
        validation,
        apiMessage: message,
        settings,
        message,
        error,
        notRegistered,
        loading,
      };
    });

    this.store.mapDispatchToProps(this, {
      UserLoginAction,
      AppleAuthAction,
      GoogleAuthAction,
      FacebookAuthAction,
      RegisterAction,
      AccountValidationAction,
      AskResetPasswordAction,
      RemoveLoginErrorAction,
      RemoveRegisterErrorAction,
    });
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  private async register(): Promise<void> {
    this.isResendValidationCodeSend = false;
    this.isValidationInError = false;
    this.isValidationProcessing = false;
    this.isResendValidationCodeProcessing = false;
    this.isResendValidationCodeInError = false;

    if (this.registerData.confirmPassword) {
      delete this.registerData.confirmPassword;
    }

    const sponsorKey = Cookies.get("SponsorKey");

    const finalData = {
      ...this.registerData,
      sponsorKey,
      locale: DS_getAppLocale(),
    };

    await this.RegisterAction(finalData);
  }

  private async redirectToCheckoutIfNeeded(): Promise<void> {
    if (this.redirectToCheckout && this.cartId) {
      await redirectToCheckout(this.cartId);
    }
  }

  render() {
    return (
      <ds-auth
        displayedView={this.view}
        isGrocery={this.isGrocery}
        settings={this.settings}
        registerData={this.registerData}
        hasLoginFailed={this.hasLoginFailed}
        isRegisterProcessing={this.isRegisterProcessing}
        hasRegistrationFailed={this.hasRegistrationFailed}
        isModalHelpShown={this.isModalHelpShown}
        showPhoneValidation={this.showPhoneValidation}
        isValidationInError={this.isValidationInError}
        isValidationProcessing={this.isValidationProcessing}
        isResendValidationCodeProcessing={this.isResendValidationCodeProcessing}
        isResendValidationCodeInError={this.isResendValidationCodeInError}
        isResendValidationCodeSend={this.isResendValidationCodeSend}
      />
    );
  }
}
