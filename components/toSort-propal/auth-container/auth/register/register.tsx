import { Component, Event, EventEmitter, h, Listen, Prop } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { DS_setTranslations, DS_triggerTrackingEvent } from "../../../../../utils";
import { translations } from "./translations";
import { TitleType } from "../../../../ui/title/title-type.enum";
import { AlertLevel } from "../../../../ui/alert/alert-level.enum";

@Component({
  tag: 'ds-register',
  styleUrl: 'register.scss',
})
export class DSRegister {

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
    this.translations = DS_setTranslations(translations, ['ds_register']);
  }

  componentDidLoad() {
    DS_triggerTrackingEvent({ eventName: 'BEGIN_SIGNUP', eventDetails: {} });
  }

  render() {
    return (
      <div class="ds-register">
        <div class="ds-register__title">
          <ds-title
            
            mods={['auth', 'register']}
            titleType={TitleType.TITLE2}
            heading={2}
          >
            {this.translations.title}
          </ds-title>
        </div>

        {this.hasRegistrationFailed && (
          <ds-alert
            level={AlertLevel.ERROR}
            message={this.translations.error.registration}
          />
        )}

        <ds-register-form
          registerData={this.registerData}
          isRegisterProcessing={this.isRegisterProcessing}
        />
      </div>
    );
  }
}
