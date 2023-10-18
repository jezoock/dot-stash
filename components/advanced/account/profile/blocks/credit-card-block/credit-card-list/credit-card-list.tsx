import { Component, h, Prop, Event, EventEmitter, Watch } from "@stencil/core";
import { Greenbox_computeCSSClassList, Greenbox_setTranslations } from "../../../../../../../utils";
import { Translations, CreditCard } from "../../../../../../interfaces";
import { translations } from "./translations";

@Component({
  tag: "gbx-credit-card-list",
  styleUrl: "credit-card-list.scss"
})
export class GbxCreditCardList {

  @Prop({ mutable: true, reflect: true }) mods: string[]|string = ['default'];
  @Prop({ mutable: true, reflect: true }) creditCards: any[]|string = [];

  translations: Translations = Greenbox_setTranslations(translations, ["gbx_paymentCard"]);
  CSSClassList: any;

  @Event() request_creditCardSetAsDefault_event: EventEmitter;
  @Event() request_creditCardDelete_event: EventEmitter;

  @Watch('mods')
  modsWatcher(newMods) {
    this.CSSClassList = Greenbox_computeCSSClassList('gbx-credit-card-list', newMods);
  }

  componentWillLoad() {
    this.CSSClassList = Greenbox_computeCSSClassList('gbx-credit-card-list', this.mods);
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
      // https://smood1.atlassian.net/browse/CUST-2323
      if (card.method === 'card') {
        return (
          <li
            key={`card-${card.id}`}
            class="gbx-credit-card-list__item"
          >
            <div class="gbx-credit-card-list__card">
              <gbx-credit-card card={card} />
              <gbx-button
                buttonMods={["trash"]}
                onGbxButtonClick={() => this.deleteButtonClickHandler(card)}
              />
            </div>

            <gbx-checkbox
              type={["default", "list-default"]}
              isChecked={card.isDefaultCard}
              onGbxCheckboxClick={() => this.radioButtonClickHandler(card)}
            >
          <span slot="label">
            {this.translations.labels.default}
          </span>
            </gbx-checkbox>
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
          <li class="gbx-credit-card-list__item" id="no-cards">
            {this.translations.noCard}
          </li>
        )}
      </ul>
    );
  }
}
