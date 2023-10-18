import { Component, h, Prop, Event, EventEmitter, Listen } from '@stencil/core';
import { UserAddress } from "../../../../../interfaces";
import { Greenbox_setTranslations } from "../../../../../../utils";
import { translations } from "./translations";
import { EventDetails } from "../../../../../interfaces";

@Component({
	tag: 'gbx-address-block',
	styleUrls: [
		'address-block.scss'
	]
})
export class GreenboxAddressBlock {

	@Prop() defaultAddress: UserAddress;
	@Prop() addresses: UserAddress[] = [];
	@Prop() isModalShown: boolean = false;

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
		this.translations = Greenbox_setTranslations(translations, ["gbx_addressBlock"]);
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

			<gbx-block
				blockTag="section"
				blockMods={["account","credit-cards"]}
			>
				
				<gbx-title
					slot="header"
					heading={3}
					titleMods={["block", "main"]}
				>
					{this.translations.title.addresses}
				</gbx-title>

				<gbx-address-list
					defaultAddress={this.defaultAddress}
					addresses={this.addresses}
				/>

				{this.isModalShown && (
          <gbx-modal
						shown={this.isModalShown}
						onGbxModalClose={this.onModalCloseHandler}
						overlay={true}
						isLayoutDisabled={true}
						lightboxClass={{
							"--delete-confirm": true,
            }}
					>

						<gbx-block
							slot="content"
							blockMods={["modal"]}
						>

							<gbx-title
								slot="header"
								titleMods={["modal", "sub"]}
							>
								{this.translations.title.confirmDelete}
							</gbx-title>

							<gbx-button
								slot="header"
								buttonMods={["modal-close", "sm"]}
								onGbxButtonClick={this.closeButtonClickHandler}
							/>

							<p>{this.translations.text.confirmDelete}</p>
							<p>{this.removedAddress.address}</p>

							<menu slot="footer">
								<gbx-button
									buttonMods={["medium", "gray"]}
									onGbxButtonClick={this.cancelButtonClickHandler}
								>
									{this.translations.button.cancel}
								</gbx-button>
								<gbx-button
									buttonMods={["medium", "color-2"]}
									onGbxButtonClick={this.okButtonClickHandler}
								>
									{this.translations.button.ok}
								</gbx-button>
							</menu>

						</gbx-block>

          </gbx-modal>
        )}

			</gbx-block>
		);
	}
}