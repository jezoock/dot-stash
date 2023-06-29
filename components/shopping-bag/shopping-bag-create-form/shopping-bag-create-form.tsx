import { Component, h, Prop, State } from '@stencil/core';
import { translations } from "../translations";

/**
 * Create shopping bag form
 */
@Component({
	tag: 'gbx-shopping-bag-create-form',
	styleUrl: 'shopping-bag-create-form.scss'
})
export class GreenboxShoppingBagCreateForm {

	/**
	 * Locale used for translations
	 */
	@Prop() locale: string = 'en';

	/**
	 * Parent component method called when form is submitted
	 */
	@Prop() requestCreateShoppingBag: any;

	/**
	 * Parent component method called to hide creation form
	 */
	@Prop() requestHideCreateForm: any;

	@State() inputValue: string = "";

	translations: any = translations[this.locale].gbx_shoppingBag;

	constructor() {
		this.formSubmitHandler = this.formSubmitHandler.bind(this);
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
	}

	/**
	 * Handle input value update
	 * @param {Event} event Input change event
	 */
	inputChangeHandler(event: Event): void {
		const { value } = event.target as any;
		this.inputValue = value;
	}

	/**
	 * Call shopping bag creation method from parent component
	 * @param {Event} event Form submit event
	 */
	formSubmitHandler(event: Event): void {
		event.preventDefault();
		this.requestCreateShoppingBag(this.inputValue);
	}

	render() {
		return (
			<form class={{
				"gbx-shopping-bag-create-form": true,
				"gbx-form": true,
				"--default": true
			}}
				onSubmit={this.formSubmitHandler}>
				<div class={{
					"gbx-shopping-bag-title": true,
					"--create": true
				}}>
					{this.translations.createForm.title}
				</div>
				<fieldset
					class={{
						"gbx-form__input": true
					}}
				>
					<label htmlFor="shoppingBagName">
						{this.translations.createForm.content}
					</label>
					<input type="text"
						id="shoppingBagName"
						name="shoppingBagName"
						value={this.inputValue}
						onChange={this.inputChangeHandler}
						onKeyUp={this.inputChangeHandler} />
				</fieldset>
				<menu>
					<button class={{
						"gbx-shopping-bag-button": true,
						"--back": true
					}}
						type="button"
						onClick={this.requestHideCreateForm}>
						{this.translations.buttons.cancel}
					</button>
					<button class={{
						"gbx-shopping-bag-button": true,
						"--create": true
					}}
						disabled={this.inputValue === ""}>
						{this.translations.buttons.add}
					</button>
				</menu>
			</form>
		);
	}
}