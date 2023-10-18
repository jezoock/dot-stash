import {
  Component,
  Event,
  EventEmitter,
  h,
  Listen,
  Prop,
  State,
  Watch,
} from "@stencil/core";
import { AuthDisplayedView } from "./auth-displayed-view.enum";
import Fragment from "stencil-fragment";
import { Universe } from "../../../../utils/universe";
import { Translations } from "../../../interfaces";
import {
  Greenbox_getAppSettings,
  Greenbox_injectSDK,
  Greenbox_setTranslations,
  Greenbox_triggerTrackingEvent,
} from "../../../../utils";
import { translations } from "./translations";

declare var gapi;
@Component({
  tag: "gbx-auth",
  styleUrls: ["./auth.scss", "./scss/auth-content.scss"],
})
export class GbxAuth {
  @Prop() registerData: any;
  @Prop() isGrocery: Boolean = false;
  @Prop({ attribute: "shown", mutable: true }) isModalShown: boolean = false;
  @Prop({ mutable: true }) displayedView: AuthDisplayedView = AuthDisplayedView.LOGIN;
  @Prop({ mutable: true }) universe: Universe = Universe.GROCERY;

  @Prop({ mutable: true }) isRegisterProcessing: boolean;
  @Prop({ mutable: true }) hasRegistrationFailed: boolean;

  @Prop({ mutable: true }) showPhoneValidation: boolean;
  @Prop({ mutable: true }) isValidationInError: boolean;
  @Prop({ mutable: true }) isValidationProcessing: boolean;
  @Prop({ mutable: true }) isResendValidationCodeProcessing: boolean;
  @Prop({ mutable: true }) isResendValidationCodeInError: boolean;
  @Prop({ mutable: true }) isResendValidationCodeSend: boolean;
  @Prop() settings: any;
  @Prop({ mutable: true }) hasLoginFailed: boolean;
  @Prop({ mutable: true }) isModalHelpShown: boolean = false;

  @State() userFirstName: string;
  @State() previousDisplayedView: AuthDisplayedView = AuthDisplayedView.LOGIN;
  @Event() request_closeAuthModal_event: EventEmitter;
  @Event() request_resetPassword_event: EventEmitter;
  @Event() request_registerProcess_event: EventEmitter;

  private translations: Translations;

  @Watch("showPhoneValidation")
  showPhoneValidationWatcher(newValue) {
    if (this.displayedView === AuthDisplayedView.REGISTER) {
      if (newValue) {
        this.displayedView = AuthDisplayedView.ACCOUNT_VALIDATION;
      } else {
        this.displayedView = AuthDisplayedView.THANKS_FOR_REGISTER;
      }
    }
  }

  @Listen("notify_resetPassword_event")
  notify_passwordReset_eventHandler({ detail: { email } }) {
    this.request_resetPassword_event.emit({ email });
  }

  @Listen("request_changeView_event")
  request_changeView_eventHandler({ detail: { view } }) {
    this.displayedView = view;
    this.previousDisplayedView = view;
  }

  @Listen("notify_startRegisterProcess_event")
  notify_startRegisterProcess_eventHandler({ detail: registerData }) {
    this.request_registerProcess_event.emit(registerData);
    Greenbox_triggerTrackingEvent({ eventName: 'SUBMIT_SIGNUP', eventDetails: {} });
  }

  constructor() {
    this.previousButtonClickHandler = this.previousButtonClickHandler.bind(this);
    this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);

    this.translations = Greenbox_setTranslations(translations, ["gbx_auth"]);
  }

  @Listen("request_closeModal_event")
  request_closeModal_eventHandler() {
    this.closeButtonClickHandler();
  }

  @Listen("request_firstNameUpdate_event")
  request_firstNameUpdateHandler({
    detail: { firstname },
  }: {
    detail: { firstname: string };
  }) {
    this.userFirstName = firstname;
  }

  checkLoadApple() {
    const button = document.getElementById("appleConnect");
    if (window["AppleID"] === "undefined") {
      if (button) button.setAttribute("disabled", "disabled");
      setTimeout(() => {
        this.checkLoadApple();
      }, 50);
    } else {
      if (button) button.removeAttribute("disabled");
    }
  }

  checkLoadFB() {
    const button = document.getElementById("facebookConnect");
    if (window["FB"] === "undefined") {
      if (button) button.setAttribute("disabled", "disabled");
      setTimeout(() => {
        this.checkLoadFB();
      }, 50);
    } else {
      if (button) button.removeAttribute("disabled");
    }
  }

  checkLoadGoogle() {
    const button = document.getElementById("googleConnect");
    if (!window["GoogleAuth"]) {
      if (button) button.setAttribute("disabled", "disabled");
      setTimeout(() => {
        this.checkLoadGoogle();
      }, 50);
    } else {
      if (button) button.removeAttribute("disabled");
    }
  }

  componentDidLoad() {
    const sdkFacebook = document.getElementById("facebook-jssdk");

    if (!sdkFacebook) {
      Greenbox_injectSDK("facebookConnect").then(() => {
        this.initSDK("facebook")
      });
    } else {
      const facebookConnectButton = document.getElementById(
        "facebookConnect"
      );
      if (facebookConnectButton) {
        facebookConnectButton.removeAttribute("disabled");
      }
    }

    if (this.isGrocery) {
      const sdkGoogle = document.getElementById("googleAuth");
      const sdkApple = document.getElementById("apple-sdk");

      if (!sdkGoogle) {
        Greenbox_injectSDK("googleAuth").then(() => this.initSDK("google"));
      } else if (gapi) {
        this.initSDK("google");
      }

      if (!sdkApple) {
        Greenbox_injectSDK("appleConnect").then(() =>
          this.initSDK("apple")
        );
      } else {
        const appleConnectButton = document.getElementById(
          "appleConnect"
        );
        if (appleConnectButton) {
          appleConnectButton.removeAttribute("disabled");
        }
      }

    } else {
      this.checkLoadApple();
      this.checkLoadFB();
      this.checkLoadGoogle();
    }
  }

  initSDK(type) {
    const {
      credentials: { facebook: credentials },
    } = Greenbox_getAppSettings();

    if (type === "facebook") {
      window["fbAsyncInit"] = function () {
        window["FB"].init({
          appId: credentials.appId,
          cookie: true,
          xfbml: true,
          version: "v3.1",
        });
      };
    } else if (type === "google") {
      window["GoogleScope"] =
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me";
      if (gapi) {
        gapi.load("client:auth2", () => {
          gapi.client
            .init({
              apiKey: this.settings.credentials.google.auth.key,
              clientId: this.settings.credentials.google.auth.clientId,
              scope: window["GoogleScope"],
              disoveryDocs: [],
            })
            .then(() => {
              window["GoogleAuth"] = gapi.auth2.getAuthInstance();
              const googleConnectButton = document.getElementById(
                "googleConnect"
              );
              if (googleConnectButton) {
                googleConnectButton.removeAttribute("disabled");
              }
            })
            .catch((err) => {
              console.error("Error init GoogleAuth", err);
            });
        });
      }
    } else if (type === "apple") {
        window["AppleID"].auth.init({
          clientId: 'ch.smood.service',
          scope: 'name email',
          redirectURI: window.location.href.split('/').slice(0,3).join('/'),
          usePopup: true,
        });
    }
  }

  private previousButtonClickHandler() {
    this.previousDisplayedView = this.displayedView;

    if (this.previousDisplayedView === AuthDisplayedView.ACCOUNT_VALIDATION) {
      this.previousDisplayedView = AuthDisplayedView.REGISTER;
      this.displayedView = AuthDisplayedView.REGISTER;
    } else if (
      this.previousDisplayedView === AuthDisplayedView.REGISTER ||
      this.previousDisplayedView === AuthDisplayedView.RESET_PASSWORD ||
      this.previousDisplayedView === AuthDisplayedView.B2B_SIGNUP_ERROR
    ) {
      this.displayedView = AuthDisplayedView.LOGIN;
    }

    if (this.displayedView === AuthDisplayedView.LOGIN) {
      this.previousDisplayedView = AuthDisplayedView.LOGIN;
    }
  }

  private closeButtonClickHandler() {
    this.displayedView = AuthDisplayedView.LOGIN;
    this.previousDisplayedView = AuthDisplayedView.LOGIN;
    this.request_closeAuthModal_event.emit();
  }

  render() {
    const isB2B = !!new URL(window.location.href).searchParams.get('b2bInvitationToken');

    const classes = {
      'gbx-auth-content': true,
      'gbx-auth-content-b2b': isB2B,
    };

    return (
      <Fragment>
        <gbx-modal
          shown={this.isModalShown}
          isLayoutDisabled={false}
          overlay={false}
          lightboxClass={{
            "--snack": true,
            "--dialog": false,
            "--no-layout": false,
            "--auth": true,
            "--restaurant": this.universe === Universe.RESTAURANT,
          }}
          isHeaderDisabled={false}
          isSubtitleDisabled={true}
          isFooterDisabled={true}
          isClosingDisabled={true}
          useSnack={true}
          universe={this.universe}
        >
          <div class={classes} slot="content">
            <div class="gbx-auth-content__container">
              <div class="gbx-auth-content-header">
                <div class="gbx-auth-content-header__previous-button">
                  {[
                    AuthDisplayedView.REGISTER,
                    AuthDisplayedView.ACCOUNT_VALIDATION,
                    AuthDisplayedView.RESET_PASSWORD,
                  ].includes(this.displayedView) && (
                    <gbx-button
                      buttonMods={["snack", "previous"]}
                      onGbxButtonClick={this.previousButtonClickHandler}
                    >
                      {this.translations.button.back}
                    </gbx-button>
                  )}
                </div>

                <div class="gbx-auth-content-header__close-button">
                  <gbx-button
                    useSnack={true}
                    buttonMods={["snack", "close"]}
                    onGbxButtonClick={this.closeButtonClickHandler}
                  />
                </div>
              </div>

              <div class="gbx-auth-content-components">
                {this.displayedView === AuthDisplayedView.LOGIN && (
                  <gbx-login
                    isGrocery={this.isGrocery}
                    class="gbx-auth-content-components__login"
                    hasLoginFailed={this.hasLoginFailed}
                  />
                )}

                {this.displayedView === AuthDisplayedView.REGISTER && (
                  <gbx-register
                    class="gbx-auth-content-components__register"
                    registerData={this.registerData}
                    isRegisterProcessing={this.isRegisterProcessing}
                    hasRegistrationFailed={this.hasRegistrationFailed}
                  />
                )}

                {this.displayedView === AuthDisplayedView.ACCOUNT_VALIDATION && (
                  <gbx-account-validation
                    class="gbx-auth-content-components__account-validation"
                    isValidationProcessing={this.isValidationProcessing}
                    isValidationInError={this.isValidationInError}
                    isResendValidationCodeProcessing={
                      this.isResendValidationCodeProcessing
                    }
                    isResendValidationCodeInError={
                      this.isResendValidationCodeInError
                    }
                    isResendValidationCodeSend={this.isResendValidationCodeSend}
                  />
                )}

                {this.displayedView === AuthDisplayedView.RESET_PASSWORD && (
                  <gbx-reset-password class="gbx-auth-content-components__reset-password" />
                )}

                {this.displayedView === AuthDisplayedView.THANKS_FOR_REGISTER && (
                  <gbx-thanks-for-registering
                    class="gbx-auth-content-components__thanks-for-register"
                    userFirstName={this.userFirstName}
                  />
                )}

                {this.displayedView === AuthDisplayedView.B2B_SIGNUP_SUCCESS && (
                  <gbx-b2b-success />
                )}

                {this.displayedView === AuthDisplayedView.B2B_SIGNUP_ERROR && (
                  <gbx-b2b-failure
                    tryAgainClickHandler={this.previousButtonClickHandler}
                  />
                )}

              </div>
            </div>
          </div>
        </gbx-modal>
        <gbx-registration-help isModalHelpShown={this.isModalHelpShown} />
      </Fragment>
    );
  }
}
