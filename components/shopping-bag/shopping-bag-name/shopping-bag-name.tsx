import { Component, h, Prop, State } from '@stencil/core';
import Fragment from "stencil-fragment";
import { translations } from "../translations";

/**
 * Component used to display and edit shopping bag name
 */
@Component({
	tag: 'gbx-shopping-bag-name',
	styleUrl: 'shopping-bag-name.scss'
})

export class GreenboxShoppingBagName {

	/**
	 * Locale used for transaltions
	 */
	@Prop() locale: string = "en";

	/**
	 * Shopping bag name to display/edit
	 */
	@Prop({ mutable: true }) name: string = "";

	/**
	 * Wether shopping bag name is editable or not
	 */
	@Prop({ attribute: 'disabled' }) isDisabled: boolean = false;

	/**
	 * Parent component method called to update shopping bag name
	 */
	@Prop() requestUpdateShoppingBag: any;
	@Prop() toggleDeleteMessage: () => void;

	@State() inputValue: string = this.name;
	@State() isEditing: boolean = false;

	translations: any = translations[this.locale].gbx_shoppingBag;

	constructor() {
		this.editButtonClickHandler = this.editButtonClickHandler.bind(this);
		this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
		this.formSubmitHandler = this.formSubmitHandler.bind(this);
	}

	componentWillLoad() {
		this.inputValue = this.name;
	}

	/**
	 * Toggle edit form display
	 */
	toggleEditForm(): void {
		const { isEditing: display } = this;
		this.isEditing = !display;
	}

	/**
	 * Display name edit form
	 */
	editButtonClickHandler(): void {
		this.toggleEditForm();
	}

	/**
	 * Hide name edit form
	 */
	cancelButtonClickHandler(): void {
		this.toggleEditForm();
	}

	/**
	 * Handle input value update
	 * @param {Event} event Input change event
	 */
	inputChangeHandler(event: Event): void {
		const { value } = event.target as any;
		this.inputValue = value;
		this.name = value;
	}

	/**
	 * Call shopping bag name update method from parent component
	 * @param {Event} event Form submit event
	 */
	formSubmitHandler(event: Event): void {
		event.preventDefault();
		this.requestUpdateShoppingBag({ name: this.inputValue });
		this.toggleEditForm();
	}

	render() {
		return (
			<form class="gbx-shopping-bag-name"
				onSubmit={this.formSubmitHandler}>

				<div class={{
					"gbx-shopping-bag-title": true,
					"--details": !this.isEditing,
					"--edit": this.isEditing
				}}>

					{this.isEditing ? (
						<Fragment>
							<input type="text"
								id="shoppingBagName"
								name="shoppingBagName"
								value={this.inputValue}
								onChange={this.inputChangeHandler}
								onKeyUp={this.inputChangeHandler} />
							<button class="gbx-shopping-bag-title__button --save"
								disabled={this.inputValue === ""}>
								<span>{this.translations.buttons.ok}</span>
							</button>
							<button class="gbx-shopping-bag-title__button --cancel"
								type="button"
								onClick={this.cancelButtonClickHandler}>
								<span>{this.translations.buttons.cancel}</span>
							</button>
						</Fragment>
					) : (
							<Fragment>
								<strong>{this.name}</strong>
								{!this.isDisabled && (
									<Fragment>
										<button type="button"
											class="gbx-shopping-bag-title__button --edit"
											onClick={this.editButtonClickHandler} />
											<button
											type="button"
											class='gbx-shopping-bag-title__delete-products'
											onClick={this.toggleDeleteMessage}
										>
											{this.translations.buttons.deleteList}
										</button>
									</Fragment>
								)}
							</Fragment>
						)}

				</div>

			</form>
		);
	}
}