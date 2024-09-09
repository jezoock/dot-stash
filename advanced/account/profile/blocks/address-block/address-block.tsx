import { Component, h, Prop, Event, EventEmitter, Listen } from '@stencil/core';
import { UserAddress } from "../../../../../interfaces";
import { DS_setTranslations } from "../../../../../../utils";
import { translations } from "./translations";
import { EventDetails } from "../../../../../interfaces";

@Component({
	tag: 'ds-address-block',
	styleUrls: [
		'address-block.scss'
	]
})
export class DSAddressBlock {

	@Prop() defaultAddress: UserAddress;
	@Prop() addresses: UserAddress[] = [];
	@Prop() isModalShown = false;

	translations: any;
	removedAddress: { index: number, address: string };

	@Event() request_addressDelete_event: EventEmitter;

	@Listen('request_addressDelete_event')
	request_addressDelete_eventHandler( event: Event ) {
		if (!this.removedAddress) {
			event.preventDefault();
			event.stopPropagation();

			const { detail: { index, address } }: EventDetails = event;
		
			this.removedAddress = { index, address };
			this.isModalShown = true;
		}
	}


	constructor() {
		this.translations = DS_setTranslations(translations, ["ds_addressBlock"]);
		this.okButtonClickHandler = this.okButtonClickHandler.bind(this);
		this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
		this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);
		this.onModalCloseHandler = this.onModalCloseHandler.bind(this);
	}

	toggleModalDisplay( mustShow?: boolean ): void {
		if (typeof mustShow === "boolean") {
			this.isModalShown = mustShow;
		} else {
			const { isModalShown } = this;
			this.isModalShown = !isModalShown;
		}
	}

	closeModal(): void {
		this.toggleModalDisplay(false);
		this.removedAddress = null;
	}
	
	//#region EVENT HANDLERS
	
	okButtonClickHandler(): void {
		const { removedAddress: { index, address } }: { removedAddress: { index: number, address: string } } = this;
		
		if (!!address && index > -1) {
			this.request_addressDelete_event.emit({ index });
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
					{this.translations.title.addresses}
				</ds-title>

				<ds-address-list
					defaultAddress={this.defaultAddress}
					addresses={this.addresses}
				/>

				{this.isModalShown && (
          <ds-modal
						shown={this.isModalShown}
						onDSModalClose={this.onModalCloseHandler}
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
								onDSButtonClick={this.closeButtonClickHandler}
							/>

							<p>{this.translations.text.confirmDelete}</p>
							<p>{this.removedAddress.address}</p>

							<menu slot="footer">
								<ds-button
									buttonMods={["medium", "gray"]}
									onDSButtonClick={this.cancelButtonClickHandler}
								>
									{this.translations.button.cancel}
								</ds-button>
								<ds-button
									buttonMods={["medium", "color-2"]}
									onDSButtonClick={this.okButtonClickHandler}
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