import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
	tag: 'ds-checkbox',
	styleUrl: 'checkbox.scss'
})
export class DSCheckbox {

	@Prop({ attribute: "id" }) inputId = `ds-checkbox`;
	@Prop({ attribute: "name" }) inputName = "";
	@Prop({ attribute: "value" }) inputValue = "";
	@Prop({ attribute: "checked", mutable: true, reflect: true }) isChecked = false;
	@Prop({ attribute: "disabled", mutable: true, reflect: true }) isDisabled = false;
	@Prop() type: string | string[] = "default";

	CSSClassList: string[];

	@Event() dsCheckboxClick: EventEmitter;

	constructor() {
		this.inputClickHandler = this.inputClickHandler.bind(this);
	}

	inputClickHandler(): void {
		if (!this.isDisabled) {
			const { isChecked } = this;
			this.isChecked = !isChecked;
			this.dsCheckboxClick.emit({
				checked: this.isChecked,
				id: this.inputId,
				name: this.inputName,
				value: this.inputValue
			});
		}
	}

	render() {
		return (
			<div
				class={{
					"ds-checkbox": true,
					[`--${this.type}`]: true,
					"--checked": this.isChecked,
					"--disabled": this.isDisabled
				}}
			>
				<input
					type="checkbox"
					name={this.inputName}
					id={this.inputId}
					value={this.inputValue}
					checked={this.isChecked}
					onClick={this.inputClickHandler}
				/>
				<div
          class="ds-checkbox__label"
        >
					<slot name="label" />
				</div>
			</div>
		);
	}
}
