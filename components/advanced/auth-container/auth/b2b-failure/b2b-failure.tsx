import { Component, h, Event, EventEmitter, Prop } from "@stencil/core";
import { Translations } from "../../../../interfaces";
import { DS_getAppLocale, DS_setTranslations } from "../../../../../utils";
import { translations } from "./translations";
import { ButtonLevel } from "../../../../ui/button/button-level.enum";
import { PageName } from "../../../../../enums/page-name.enum";
import { Locale } from "../../../../../types/locale";

const SUPPORT_BASE_URL = "https://support.dot-jez.com";

@Component({
  tag: 'ds-b2b-failure',
  styleUrl: 'b2b-failure.scss',
})
export class GbxThanksForRegistering {
  @Prop() tryAgainClickHandler: () => void;

  @Event() request_closeModal_event: EventEmitter;

  private translations: Translations;
  private locale: Locale;

  constructor() {
    this.translations = DS_setTranslations(translations, 'gbx_b2bFailure');
    this.locale = DS_getAppLocale();
  }

  render() {
    return (
      <div class="ds-b2b-failure__content-wrapper">
          <p class="ds-b2b-failure__text-paragraph">
            {this.translations.invalidLink}{' '}{this.translations.persistingIssue}
            <a href='mailto:corporate@dot-jez.com'>corporate@dot-jez.com</a>.
          </p>

          <ds-button
            useSnack
            buttonMods={["label", "registered", "default"]}
            class='ds-b2b-failure__try-again'
            dataCy={{ pageName: PageName.REGISTRATION, elementName: 'CloseModal' }}
            buttonLevel={ButtonLevel.PRIMARY}
            onGbxButtonClick={this.tryAgainClickHandler}
          >
            {this.translations.tryAgain.toUpperCase()}
          </ds-button>

          <a href={`${SUPPORT_BASE_URL}/${this.locale}`}>
            <ds-button
              useSnack
              buttonMods={["label", "registered", "default"]}
              dataCy={{ pageName: PageName.REGISTRATION, elementName: 'CloseModal' }}
              buttonLevel={ButtonLevel.SECONDARY}
              onGbxButtonClick={() => {}}
            >
              {this.translations.support.toUpperCase()}
            </ds-button>
          </a>
      </div>
    );
  }
};
