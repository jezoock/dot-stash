import { Component, h, Event, EventEmitter } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { DS_setTranslations } from "../../../../../utils";
import { translations } from "./translations";
import { ButtonLevel } from "../../../../ui/button/button-level.enum";
import { TitleType } from "../../../../ui/title/title-type.enum";
import { PageName } from "../../../../../enums/page-name.enum";

@Component({
  tag: 'ds-b2b-success',
  styleUrl: 'b2b-success.scss',
})
export class DSThanksForRegistering {
  @Event() request_closeModal_event: EventEmitter;

  private translations: Translations;

  constructor() {
    this.translations = DS_setTranslations(translations, 'ds_b2bSuccess');
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
  }

  buttonClickHandler() {
    this.request_closeModal_event.emit();
  };

  render() {
    const startExploringLabel = this.translations.startExploring.toUpperCase();

    return (
      <div class="ds-b2b-success__content-wrapper">
          <ds-title
            titleType={TitleType.TITLE2}
            useSnack
            mods={['auth', 'registered']}
          >
            {this.translations.title}
          </ds-title>

          <p class="ds-b2b-success__text-paragraph">
            {this.translations.accountStatus}
          </p>

          <div class="ds-b2b-success__happy-bag" />

          <p class="ds-b2b-success__text-paragraph">
            {this.translations.introduction}{' '}{this.translations.employer}
          </p>
          <p class="ds-b2b-success__text-paragraph">
            {this.translations.enjoy}
          </p>

          <ds-button
            useSnack
            buttonMods={["label", "registered", "default"]}
            dataCy={{ pageName: PageName.REGISTRATION, elementName: 'CloseModal' }}
            buttonLevel={ButtonLevel.PRIMARY}
            onDSButtonClick={this.buttonClickHandler}
          >
            {startExploringLabel}
          </ds-button>
      </div>
    );
  }
};
