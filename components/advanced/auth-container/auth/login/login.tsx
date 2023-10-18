import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import { AuthDisplayedView } from "../auth-displayed-view.enum";
import { ButtonLevel } from "../../../../ui/button/button-level.enum";
import { Greenbox_setTranslations, Greenbox_triggerTrackingEvent } from "../../../../../utils";
import { ValidatorType } from "../../../../ui/form/validator/validator-type.enum";
import { translations } from "./translations";

import { PageName } from "../../../../../enums/page-name.enum";
import { AlertLevel } from "../../../../ui/alert/alert-level.enum";
import { TitleType } from "../../../../ui/title/title-type.enum";
import { CguType } from "../../../../toolkit/form/checkbox/cgu/cgu-type.enum";
import jwt from 'jwt-decode';

@Component({
  tag: "gbx-login",
  styleUrl: "login.scss",
})
export class GbxLogin {
  @Prop() isGrocery: Boolean = false;
  @Prop({ mutable: true }) hasLoginFailed: boolean;
  @State() facebookAlreadyClicked: boolean = false;
  @State() appleAlreadyClicked: boolean = false;
  @State() isHidden: boolean = true;
  @State() userToken: string;
  @State() user: {
    username: string;
    password: string;
  } = {
    username: "",
    password: "",
  }
  @State() isValidForm: boolean;

  @Event() request_changeView_event: EventEmitter;
  @Event() request_loginAuthButton_event: EventEmitter;
  @Event() request_appleAuthButton_event: EventEmitter;
  @Event() request_facebookAuthButton_event: EventEmitter;
  @Event() request_googleAuthButton_event: EventEmitter;

  translations: any;

  @Listen('notify_fieldChanged_event')
  notify_fieldChanged_eventHandler({ detail: { value, name } }) {
    this.user = {
      ...this.user,
      [name === 'email' ? 'username' : name]: value
    };

    this.isValidForm = !!(this.user.username && this.user.password);
  }

  constructor() {
    this.translations = Greenbox_setTranslations(translations, ["gbx_login"]);

    this.createAccountButtonClickHandler = this.createAccountButtonClickHandler.bind(this);
    this.loginButtonClickHandler = this.loginButtonClickHandler.bind(this);
    this.forgotPassButtonClickHandler = this.forgotPassButtonClickHandler.bind(this);
    this.handleAppleConnect = this.handleAppleConnect.bind(this);
    this.handleFacebookConnect = this.handleFacebookConnect.bind(this);
    this.handleGoogleConnect = this.handleGoogleConnect.bind(this);
    this.inputKeyPressHandler = this.inputKeyPressHandler.bind(this);
  }

  private createAccountButtonClickHandler() {
    this.request_changeView_event.emit({ view: AuthDisplayedView.REGISTER });
    Greenbox_triggerTrackingEvent({ eventName: 'REQUEST_SIGNUP', eventDetails: {} });
  }

  private forgotPassButtonClickHandler() {
    this.request_changeView_event.emit({
      view: AuthDisplayedView.RESET_PASSWORD,
    });
  }

  loginButtonClickHandler(event: Event): void {
    event.preventDefault();
    this.hasLoginFailed = this.checkLogin();
    if (!this.hasLoginFailed) {
      this.request_loginAuthButton_event.emit(this.user);
    }
  }

  checkLogin() {
    const myError: any = {
      invalidAttributes: {},
    };
    this.isHidden = false;
    if (!this.user.password || this.user.password === "") {
      this.isHidden = true;
      myError.invalidAttributes.password = [
        {
          rule: "required",
        },
      ];
    }

    if (!this.user.username || this.user.username === "") {
      this.isHidden = true;
      myError.invalidAttributes.email = [
        {
          rule: "required",
        },
      ];
    }

    if (this.isHidden) {
      return myError;
    }
    return false;
  }

  handleAppleConnect(): void {
    if (!this.isGrocery) return null;
    let button = document.getElementById("appleConnect");

    if (button) {
      button.setAttribute("disabled", "disabled");
    }  
    window["AppleID"].auth.signIn().then((response) => {
      let registerFormData = {
        appleId: response.authorization.code,
        token: response.authorization.id_token,
        email: "",
        firstname: "",
        lastname: "",
      }
      if (response.user) {
        registerFormData = {
          ...registerFormData,
          email: response.user.email,
          lastname : response.user.name.lastName,
          firstname: response.user.name.firstName,
        }
      } else {
        const decoded: { email_verified: string, email: string } = jwt(registerFormData.token);
        if (decoded.email_verified) {
          const email = decoded.email;
          registerFormData = {
            ...registerFormData,
            email: email,
          }
        }
      }
      window["AppleID"].auth.currentUser = registerFormData;
      if (response.authorization) {
        this.AppleAuthentManager(response);
        if (button) {
          button.removeAttribute("disabled");
        }
      } else if (typeof response.authorization == "undefined") {
        // If is undefined means popup apple is blocked
        if (button) {
          button.removeAttribute("disabled");
        }
        if (!this.appleAlreadyClicked) {
          // By resubmit the request the navigator allow the popup
          this.appleAlreadyClicked = true;
        } else {
          alert("error");
        }
      } else {
        // Display error message
        const appleConnectButton = document.getElementById(
          "appleConnect"
        );
        if (appleConnectButton) {
          appleConnectButton.removeAttribute("disabled");
        }

        this.request_changeView_event.emit({
          view: AuthDisplayedView.REGISTER,
        });

        if (button) {
          button.removeAttribute("disabled");
        }
      }
    });
  }

  AppleAuthentManager(response) {
    let appleAuthResponse = response.authorization;
    const data = {
      appleId: appleAuthResponse.code,
      token: appleAuthResponse.id_token,
    };
    this.request_appleAuthButton_event.emit(data);

    this.userToken = appleAuthResponse.id_token;
  }

  handleFacebookConnect(): void {
    if (!this.isGrocery) return null;
    let button = document.getElementById("facebookConnect");

    if (button) {
      button.setAttribute("disabled", "disabled");
    }
    window["FB"].getLoginStatus((response) => {
      // Try authenticate from Smood Api
      if (response.status == "connected") {
        this.facebookAuthentManager(response);
        if (button) {
          button.removeAttribute("disabled");
        }
      } else if (typeof response.authResponse == "undefined") {
        // If is undefined means popup facebook is blocked
        if (button) {
          button.removeAttribute("disabled");
        }
        if (!this.facebookAlreadyClicked) {
          // By resubmit the request the navigator allow the popup
          this.facebookAlreadyClicked = true;
        } else {
          alert("error");
        }
      } else {
        window["FB"].login(
          (response) => {
            if (response.status == "connected") {
              this.facebookAuthentManager(response);
              if (button) {
                button.removeAttribute("disabled");
              }
            } else if (response.authResponse == null) {
              if (button) {
                button.removeAttribute("disabled");
              }
            } else {
              // Display error message
              const facebookConnectButton = document.getElementById(
                "facebookConnect"
              );
              if (facebookConnectButton) {
                facebookConnectButton.removeAttribute("disabled");
              }

              this.request_changeView_event.emit({
                view: AuthDisplayedView.REGISTER,
              });

              if (button) {
                button.removeAttribute("disabled");
              }
            }
          },
          { scope: "public_profile,email" }
        );
      }
    });
  }

  facebookAuthentManager(response) {
    let fbAuthResponse = response.authResponse;
    const data = {
      facebookId: fbAuthResponse.userID,
      token: fbAuthResponse.accessToken,
    };
    this.request_facebookAuthButton_event.emit(data);

    this.userToken = fbAuthResponse.accessToken;
  }

  handleGoogleConnect(): void {
    if (!this.isGrocery) return null;
    const button = document.getElementById("googleConnect");
    const _this = this;

    if (button) {
      button.setAttribute("disabled", "disabled");
    }
    window["GoogleAuth"].isSignedIn.listen(() => {
      _this.handleGoogleConnect();
    });

    const user = window["GoogleAuth"].currentUser.get();

    if (!user.hasGrantedScopes(window["GoogleScope"])) {
      window["GoogleAuth"]
        .signIn()
        .then(() => {
          _this.onGoogleSignedIn(true);
          
        })
        .catch(() => {
          button.removeAttribute("disabled");
        });
    } else {
      _this.googleAuthentManager(user);
    }
  }

  googleAuthentManager(user) {
    const data = {
      googleId: user.getId(),
      token: user.getAuthResponse().id_token,
      email: user.getBasicProfile().getEmail(),
    };
    this.request_googleAuthButton_event.emit(data);
  }

  inputKeyPressHandler(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      this.loginButtonClickHandler(e);
    }
  }

  onGoogleSignedIn(isSignedIn) {
    if (isSignedIn) {
      const user = window["GoogleAuth"].currentUser.get();

      this.googleAuthentManager(user);
    } else {
      const googleConnectButton = document.getElementById("googleConnect");
      if (googleConnectButton) {
        googleConnectButton.removeAttribute("disabled");
      }
    }
  }

  render() {
    return (
      <div class="gbx-login">
        <gbx-title
          titleType={TitleType.TITLE2}
          titleMods="auth, login"
          heading={2}
          useSnack={true}
          dataCy={{
            pageName: PageName.LOGIN,
            elementName: "loginTitle",
          }}
        >
          {this.translations.title}
        </gbx-title>

        <div class="gbx-login-form" id="LoginForm">
          {this.hasLoginFailed && this.isGrocery && (
            <gbx-alert
              level={AlertLevel.ERROR}
              message={this.translations.common.emailNotMatching}
            />
          )}
          <div class="errors"></div>
          <fieldset>
            <gbx-input-field
              id="input-field-email"
              inputName="email"
              onKeyPress={this.inputKeyPressHandler}
              inputId="login-email"
              inputPlaceholder={this.translations.label.email}
              dataCy={{
                pageName: PageName.LOGIN,
                elementName: "loginInputEmail",
              }}
              validators={[
                {
                  type: ValidatorType.REQUIRED,
                  errorMessage: this.translations.message.error.email.required,
                },
                {
                  type: ValidatorType.EMAIL,
                  errorMessage: this.translations.message.error.email.invalid,
                },
              ]}
            />
          </fieldset>

          <fieldset>
            <gbx-input-field
              id="input-field-password"
              inputName="password"
              inputId="login-password"
              onKeyPress={this.inputKeyPressHandler}
              inputPlaceholder={this.translations.label.password}
              dataCy={{
                pageName: PageName.LOGIN,
                elementName: "loginInputPassword",
              }}
              type="password"
              min={8}
              validators={[
                {
                  type: ValidatorType.REQUIRED,
                  errorMessage: this.translations.message.error.password
                    .required,
                },
              ]}
            />
          </fieldset>

          <gbx-button
            buttonType="button"
            buttonMods={["forgotPass"]}
            dataCy={{
              pageName: PageName.LOGIN,
              elementName: "loginButtonForgotPass",
            }}
            onGbxButtonClick={this.forgotPassButtonClickHandler}
          >
            <span>{this.translations.links.resetPassword}</span>
          </gbx-button>

          <gbx-button
            buttonType="submit"
            buttonMods={["label", "login", "default"]}
            buttonId="loginButton"
            isDisabled={!this.isValidForm}
            useSnack={true}
            dataCy={{
              pageName: PageName.LOGIN,
              elementName: "loginButtonLogin",
            }}
            buttonLevel={ButtonLevel.PRIMARY}
            onGbxButtonClick={this.loginButtonClickHandler}
          >
            {this.translations.button.login}
          </gbx-button>

          <gbx-button
            buttonType="button"
            buttonMods={["label", "createAccount", "default"]}
            buttonId="createAccountButton"
            useSnack={true}
            dataCy={{
              pageName: PageName.LOGIN,
              elementName: "loginButtonCreateAccount",
            }}
            buttonLevel={ButtonLevel.SECONDARY}
            onGbxButtonClick={this.createAccountButtonClickHandler}
          >
            {this.translations.button.createAccount}
          </gbx-button>
        </div>

        <div class="gbx-login-social">
          <span>{this.translations.label.socialLogin}</span>
          <div class="gbx-login-social-buttons">
            <gbx-button
              buttonType="button"
              buttonMods={["facebook"]}
              buttonId="facebookConnect"
              dataCy={{
                pageName: PageName.LOGIN,
                elementName: "loginButtonFacebook",
              }}
              onGbxButtonClick={this.handleFacebookConnect}
            />

            <gbx-button
              buttonType="button"
              buttonMods={["apple"]}
              buttonId="appleConnect"
              dataCy={{
                pageName: PageName.LOGIN,
                elementName: "loginButtonApple",
              }}
              onGbxButtonClick={this.handleAppleConnect}
            />

            <gbx-button
              buttonType="button"
              buttonMods={["google"]}
              buttonId="googleConnect"
              dataCy={{
                pageName: PageName.LOGIN,
                elementName: "loginButtonGoogle",
              }}
              onGbxButtonClick={this.handleGoogleConnect}
            />
          </div>
        </div>

        <div class="gbx-login-app">
          <span>{this.translations.label.app}</span>
          <div class="gbx-login-app-buttons">
            <gbx-button
              buttonType="button"
              buttonMods={["appstore"]}
              dataCy={{
                pageName: PageName.LOGIN,
                elementName: "loginButtonAppstore",
              }}
              onGbxButtonClick={() => {
                window.open(
                  "https://itunes.apple.com/app/id1227720412",
                  "_blank",
                  "noopener"
                );
              }}
            />

            <gbx-button
              buttonType="button"
              buttonMods={["playstore"]}
              dataCy={{
                pageName: PageName.LOGIN,
                elementName: "loginButtonPlaystore",
              }}
              onGbxButtonClick={() => {
                window.open(
                  "https://play.google.com/store/apps/details?id=com.jamtech.marabel.smood",
                  "_blank",
                  "noopener"
                );
              }}
            />
          </div>
          <div class="gbx-login-cgu">
            <gbx-cgu displayCheckbox={false} displayedView={CguType.LOGIN} />
          </div>
        </div>
      </div>
    );
  }
}
