import { Component, h, Event, EventEmitter } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { Greenbox_setTranslations } from "../../../../../utils";
import { translations } from "./translations";
import { ButtonLevel } from "../../../../ui/button/button-level.enum";
import { TitleType } from "../../../../ui/title/title-type.enum";
import { PageName } from "../../../../../enums/page-name.enum";

@Component({
  tag: 'gbx-b2b-success',
  styleUrl: 'b2b-success.scss',
})
export class GbxThanksForRegistering {
  @Event() request_closeModal_event: EventEmitter;

  private translations: Translations;

  constructor() {
    this.translations = Greenbox_setTranslations(translations, 'gbx_b2bSuccess');
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
  }

  buttonClickHandler() {
    this.request_closeModal_event.emit();
  };

  render() {
    const startExploringLabel = this.translations.startExploring.toUpperCase();

    return (
      <div class="gbx-b2b-success__content-wrapper">
          <gbx-title
            titleType={TitleType.TITLE2}
            useSnack
            titleMods={['auth', 'registered']}
          >
            {this.translations.title}
          </gbx-title>

          <p class="gbx-b2b-success__text-paragraph">
            {this.translations.accountStatus}
          </p>

          <div class="gbx-b2b-success__happy-bag" />

          <p class="gbx-b2b-success__text-paragraph">
            {this.translations.introduction}{' '}{this.translations.employer}
          </p>
          <p class="gbx-b2b-success__text-paragraph">
            {this.translations.enjoy}
          </p>

          <gbx-button
            useSnack
            buttonMods={["label", "registered", "default"]}
            dataCy={{ pageName: PageName.REGISTRATION, elementName: 'CloseModal' }}
            buttonLevel={ButtonLevel.PRIMARY}
            onGbxButtonClick={this.buttonClickHandler}
          >
            {startExploringLabel}
          </gbx-button>
      </div>
    );
  }
};
