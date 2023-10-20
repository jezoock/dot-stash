import { Component, h, Prop, Event, EventEmitter } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { DS_setTranslations } from "../../../../../utils";
import { translations } from "./translations";
import { ButtonLevel } from "../../../../ui/button/button-level.enum";
import { TitleType } from "../../../../ui/title/title-type.enum";
import { PageName } from "../../../../../enums/page-name.enum";
import { CguType } from "../../../../toolkit/form/checkbox/cgu/cgu-type.enum";

@Component({
  tag: 'ds-thanks-for-registering',
  styleUrl: 'thanks-for-register.scss',
})
export class DSThanksForRegistering {
  @Prop() userFirstName: string;
  @Event() request_closeModal_event: EventEmitter;
  @Event() notify_thanksForRegisterClosed_event: EventEmitter;

  private translations: Translations;

  constructor() {
    this.translations = DS_setTranslations(translations, 'ds_thanksForRegistering');
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
  }

  buttonClickHandler() {
    this.request_closeModal_event.emit();
    this.notify_thanksForRegisterClosed_event.emit();
  };

  render() {
    const greetingWithFirstName = this.translations.greeting.replace('%username%', this.userFirstName || '');
    const startExploringLabel = this.translations.startExploring.toUpperCase();

    return (
      <div class="ds-thanks-for-registering__content-wrapper">
          <ds-title
            titleType={TitleType.TITLE2}
            
            mods={['auth', 'registered']}
          >
            {this.translations.niceToMeetYou}
          </ds-title>

          <p class="ds-thanks-for-registering__text-paragraph">
            {greetingWithFirstName}
          </p>

          <div class="ds-thanks-for-registering__happy-bag" />

          <p class="ds-thanks-for-registering__text-paragraph">
            {this.translations.introduction}
          </p>
          <p class="ds-thanks-for-registering__text-paragraph">
            {this.translations.bestDealsPromise}
          </p>

          <ds-button
            
            buttonMods={["label", "registered", "default"]}
            dataCy={{ pageName: PageName.REGISTRATION, elementName: 'CloseModal' }}
            buttonLevel={ButtonLevel.PRIMARY}
            onDSButtonClick={this.buttonClickHandler}
          >
              {startExploringLabel}
            </ds-button>

          <div class="ds-thanks-for-registering__cgu-wrapper">
            <ds-cgu
              displayedView={CguType.REGISTER}
              displayCheckbox={false}
            />
          </div>

      </div>
    );
  }
};
