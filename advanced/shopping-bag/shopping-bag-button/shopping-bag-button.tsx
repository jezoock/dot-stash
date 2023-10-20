import { Component, h, Prop } from "@stencil/core";

/**
 * Simple button component displaying the shopping list modal
 */
@Component({
	tag: 'ds-shopping-bag-button'
})

export class DSShoppingBagButton {

	/**
	 * Displayed button label
	 */
	@Prop() label = "Shopping list";

	constructor() {
		this.handleButtonClick = this.handleButtonClick.bind(this);
	}

	/**
	 * Request shopping maodal display
	 */
	handleButtonClick(): void {
		/* DS_eventDispatch(
			["ds-shopping-bag"],
			"request_shoppingbag_open"
		); */
		console.log("here")
	}

	render() {
		return (
			<button class={{
				"ds-button": true,
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
