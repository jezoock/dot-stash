import { Component, h, Prop } from "@stencil/core";
import { Greenbox_eventDispatch } from "../../../../utils";

/**
 * Simple button component displaying the shopping list modal
 */
@Component({
	tag: 'gbx-shopping-bag-button'
})

export class GreenboxShoppingBagButton {

	/**
	 * Displayed button label
	 */
	@Prop() label: string = "Shopping list";

	constructor() {
		this.handleButtonClick = this.handleButtonClick.bind(this);
	}

	/**
	 * Request shopping maodal display
	 */
	handleButtonClick(): void {
		Greenbox_eventDispatch(
			["gbx-shopping-bag"],
			"request_shoppingbag_open"
		);
	}

	render() {
		return (
			<button class={{
				"gbx-button": true,
				"--color-1": true,
				"--medium": true,
				"--banner-act": true
			}}
				onClick={this.handleButtonClick}>
				{this.label}
			</button>
		);
	}

}
