import { Component, h, Prop, Event, EventEmitter, Watch } from "@stencil/core";
import { DS_computeCSSClassList, DS_setTranslations } from "../../../../../../../utils";
import { Translations, CreditCard } from "../../../../../../interfaces";
import { translations } from "./translations";

@Component({
  tag: "ds-credit-card-list",
  styleUrl: "credit-card-list.scss"
})
export class DSCreditCardList {

  @Prop({ mutable: true, reflect: true }) mods: string[]|string = ['default'];
  @Prop({ mutable: true, reflect: true }) creditCards: any[]|string = [];

  translations: Translations = DS_setTranslations(translations, ["ds_paymentCard"]);
  CSSClassList: any;

  @Event() request_creditCardSetAsDefault_event: EventEmitter;
  @Event() request_creditCardDelete_event: EventEmitter;

  @Watch('mods')
  modsWatcher(newMods) {
    this.CSSClassList = DS_computeCSSClassList('ds-credit-card-list', newMods);
  }

  componentWillLoad() {
    this.CSSClassList = DS_computeCSSClassList('ds-credit-card-list', this.mods);
    if (typeof this.creditCards === 'string') {
      const creditCards = JSON.parse(this.creditCards);
      this.creditCards = creditCards;
    }
  }

  /**
   * Send an event to delete a card
   * @param {string} cardId
   * @param {string} cardType
   */
  deleteButtonClickHandler({id: cardId, cardType}: CreditCard): void {
    this.request_creditCardDelete_event.emit({ cardId, cardType });
  }

  radioButtonClickHandler({id: cardId, cardType, isDefaultCard }: CreditCard): void {
    if(!isDefaultCard) {
      this.request_creditCardSetAsDefault_event.emit({ cardId, cardType });
    }
  }

  renderCards() {
    return (this.creditCards as []).map((card: CreditCard) => {
      // TODO : TEMPORARY : Do not display tokenized payments if method !== card
      // https://pronto1.atlassian.net/browse/CUST-2323
      if (card.method === 'card') {
        return (
          <li
            key={`card-${card.id}`}
            class="ds-credit-card-list__item"
          >
            <div class="ds-credit-card-list__card">
              <ds-credit-card card={card} />
              <ds-button
                buttonMods={["trash"]}
                onDSButtonClick={() => this.deleteButtonClickHandler(card)}
              />
            </div>

            <ds-checkbox
              type={["default", "list-default"]}
              isChecked={card.isDefaultCard}
              onDSCheckboxClick={() => this.radioButtonClickHandler(card)}
            >
          <span slot="label">
            {this.translations.labels.default}
          </span>
            </ds-checkbox>
          </li>
        );
      }
    });
  }

  render() {
    return (
      <ul class={{
        ...this.CSSClassList,
        "--empty": this.creditCards?.length === 0
      }}>
        {this.creditCards?.length > 0 ? (
          this.renderCards()
        ) : (
          <li class="ds-credit-card-list__item" id="no-cards">
            {this.translations.noCard}
          </li>
        )}
      </ul>
    );
  }
}
