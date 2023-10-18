import { Component, Event, EventEmitter, h, Listen, Prop } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { Greenbox_setTranslations, Greenbox_triggerTrackingEvent } from "../../../../../utils";
import { translations } from "./translations";
import { TitleType } from "../../../../ui/title/title-type.enum";
import { AlertLevel } from "../../../../ui/alert/alert-level.enum";

@Component({
  tag: 'gbx-register',
  styleUrl: 'register.scss',
})
export class GbxRegister {

  @Prop() isRegisterProcessing: boolean;
  @Prop() hasRegistrationFailed: boolean;

  @Prop() registerData: any;

  private translations: Translations;

  @Event() notify_startRegisterProcess_event: EventEmitter;

  @Listen("notify_registerFormSend_event")
  notify_registerFormSend_eventHandler({ detail: registerData }) {
    this.notify_startRegisterProcess_event.emit(registerData);
  }

  constructor() {
    this.translations = Greenbox_setTranslations(translations, ['gbx_register']);
  }

  componentDidLoad() {
    Greenbox_triggerTrackingEvent({ eventName: 'BEGIN_SIGNUP', eventDetails: {} });
  }

  render() {
    return (
      <div class="gbx-register">
        <div class="gbx-register__title">
          <gbx-title
            useSnack={true}
            titleMods={['auth', 'register']}
            titleType={TitleType.TITLE2}
            heading={2}
          >
            {this.translations.title}
          </gbx-title>
        </div>

        {this.hasRegistrationFailed && (
          <gbx-alert
            level={AlertLevel.ERROR}
            message={this.translations.error.registration}
          />
        )}

        <gbx-register-form
          registerData={this.registerData}
          isRegisterProcessing={this.isRegisterProcessing}
        />
      </div>
    );
  }
}
