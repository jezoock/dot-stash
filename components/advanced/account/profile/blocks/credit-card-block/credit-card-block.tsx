import { Component, h, Prop, Listen, Event, EventEmitter, State } from '@stencil/core';
import { translations } from "./translations";
import { EventDetails, Translations } from "../../../../../interfaces";
import { DS_setTranslations } from "../../../../../../utils";

@Component({
	tag: 'ds-credit-card-block',
	styleUrls: [
		'credit-card-block.scss',
	]
})
export class DSCreditCardBlock {

	@Prop({ mutable: true, reflect: true}) creditCards: any;
	
	@State() isModalShown: boolean;

	translations: Translations;
	removedCardId = "";
  removedCardType = "";

	@Event() request_creditCardDelete_event: EventEmitter;

	@Listen('request_creditCardDelete_event')
	request_creditCardDelete_eventHandler( event: Event ) {
		if (!this.removedCardId) {
			event.preventDefault();
			event.stopPropagation();

			const { detail: { cardId, cardType } }: EventDetails = event;

			this.removedCardId = cardId;
			this.removedCardType = cardType;
			this.isModalShown = true;
		}
	}

	constructor() {
		this.translations = DS_setTranslations(translations, ['gbx_creditCardBlock']);

		this.onModalCloseHandler = this.onModalCloseHandler.bind(this);
		this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
		this.okButtonClickHandler = this.okButtonClickHandler.bind(this);
		this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);
	}

	toggleModalDisplay( mustShow?: boolean ): void {
		if (typeof mustShow === "boolean") {
			this.isModalShown = mustShow;
		} else {
			const { isModalShown } = this;
			this.isModalShown = !isModalShown;
		}
	}

	componentWillLoad() {}

	closeModal(): void {
		this.toggleModalDisplay(false);
		this.removedCardId = null;
	}

	//#region EVENT HANDLERS

	okButtonClickHandler(): void {
		const { removedCardId: cardId }: { removedCardId: string } = this;
		if (cardId) {
			this.request_creditCardDelete_event.emit({ cardId, cardType: this.removedCardType });
		}
		this.closeModal();
	}

	cancelButtonClickHandler(): void {
		this.closeModal();
	}

	closeButtonClickHandler(): void {
		this.closeModal();
	}

	onModalCloseHandler(): void {
		this.closeModal();
	}

	//#endregion

	render() {
		return (
			<ds-block
				blockTag="section"
				blockMods={["account","credit-cards"]}
			>

				<ds-title
					slot="header"
					heading={3}
					mods={["block", "main"]}
				>
					{this.translations.title.paymentCard}
				</ds-title>

				<ds-credit-card-list creditCards={this.creditCards} />

				{this.isModalShown && (
          <ds-modal
						shown={this.isModalShown}
						onGbxModalClose={this.onModalCloseHandler}
						overlay={true}
						isLayoutDisabled={true}
						lightboxClass={{
							"--delete-confirm": true,
            }}
					>
						<ds-block
							slot="content"
							blockMods={["modal"]}
						>

							<ds-title
								slot="header"
								mods={["modal", "sub"]}
							>
								{this.translations.title.confirmDelete}
							</ds-title>

							<ds-button
								slot="header"
								buttonMods={["modal-close", "sm"]}
								onGbxButtonClick={this.closeButtonClickHandler}
							/>

              <p>
                {this.translations.text.confirmDelete}
              </p>

							<menu slot="footer">
								<ds-button
									buttonMods={["medium", "gray"]}
									onGbxButtonClick={this.cancelButtonClickHandler}
								>
									{this.translations.button.cancel}
								</ds-button>
								<ds-button
									buttonMods={["medium", "color-2"]}
									onGbxButtonClick={this.okButtonClickHandler}
								>
									{this.translations.button.ok}
								</ds-button>
							</menu>

						</ds-block>

          </ds-modal>
        )}

			</ds-block>
		);
	}
}
