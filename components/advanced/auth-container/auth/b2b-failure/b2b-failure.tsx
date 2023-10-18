import { Component, h, Event, EventEmitter, Prop } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { Greenbox_getAppLocale, Greenbox_setTranslations } from "../../../../../utils";
import { translations } from "./translations";
import { ButtonLevel } from "../../../../ui/button/button-level.enum";
import { PageName } from "../../../../../enums/page-name.enum";
import { SmoodLocale } from "../../../../../types/locale";

const SUPPORT_BASE_URL = "https://support.smood.ch";

@Component({
  tag: 'gbx-b2b-failure',
  styleUrl: 'b2b-failure.scss',
})
export class GbxThanksForRegistering {
  @Prop() tryAgainClickHandler: () => void;

  @Event() request_closeModal_event: EventEmitter;

  private translations: Translations;
  private locale: SmoodLocale;

  constructor() {
    this.translations = Greenbox_setTranslations(translations, 'gbx_b2bFailure');
    this.locale = Greenbox_getAppLocale();
  }

  render() {
    return (
      <div class="gbx-b2b-failure__content-wrapper">
          <p class="gbx-b2b-failure__text-paragraph">
            {this.translations.invalidLink}{' '}{this.translations.persistingIssue}
            <a href='mailto:corporate@smood.ch'>corporate@smood.ch</a>.
          </p>

          <gbx-button
            useSnack
            buttonMods={["label", "registered", "default"]}
            class='gbx-b2b-failure__try-again'
            dataCy={{ pageName: PageName.REGISTRATION, elementName: 'CloseModal' }}
            buttonLevel={ButtonLevel.PRIMARY}
            onGbxButtonClick={this.tryAgainClickHandler}
          >
            {this.translations.tryAgain.toUpperCase()}
          </gbx-button>

          <a href={`${SUPPORT_BASE_URL}/${this.locale}`}>
            <gbx-button
              useSnack
              buttonMods={["label", "registered", "default"]}
              dataCy={{ pageName: PageName.REGISTRATION, elementName: 'CloseModal' }}
              buttonLevel={ButtonLevel.SECONDARY}
              onGbxButtonClick={() => {}}
            >
              {this.translations.support.toUpperCase()}
            </gbx-button>
          </a>
      </div>
    );
  }
};
