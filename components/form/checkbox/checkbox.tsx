import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { Greenbox_computeCSSClassList, Greenbox_getDataCy, Greenbox_uuid } from "../../../../utils";
import { DataCy } from "../../../../utils/data-cy";

@Component({
	tag: 'gbx-checkbox',
	styleUrl: 'checkbox.scss'
})
export class GbxCheckbox {

	@Prop({ attribute: "id" }) inputId: string = `gbx-checkbox-${Greenbox_uuid()}`;
	@Prop({ attribute: "name" }) inputName: string = "";
	@Prop({ attribute: "value" }) inputValue: string = "";
	@Prop({ attribute: "checked", mutable: true, reflect: true }) isChecked: boolean = false;
	@Prop({ attribute: "disabled", mutable: true, reflect: true }) isDisabled: boolean = false;
	@Prop() type: string | string[] = "default";
  @Prop({ attribute: 'data-cy', mutable: true }) dataCy: DataCy = {
    pageName: null,
    elementName: null,
  };

	CSSClassList: string[];

	@Event() gbxCheckboxClick: EventEmitter;

	constructor() {
		this.inputClickHandler = this.inputClickHandler.bind(this);
	}

	inputClickHandler(): void {
		if (!this.isDisabled) {
			const { isChecked } = this;
			this.isChecked = !isChecked;
			this.gbxCheckboxClick.emit({
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
					...Greenbox_computeCSSClassList("gbx-checkbox", this.type),
					"--checked": this.isChecked,
					"--disabled": this.isDisabled
				}}
        data-cy={Greenbox_getDataCy({
          ...this.dataCy,
          elementType: "Checkbox"
        })}
			>
				<input
					type="checkbox"
					name={this.inputName}
					id={this.inputId}
					value={this.inputValue}
					checked={this.isChecked}
					onClick={this.inputClickHandler}
          data-cy={Greenbox_getDataCy({
            ...this.dataCy,
            elementType: "InputCheckbox"
          })}
				/>
				<div
          class="gbx-checkbox__label"
          data-cy={Greenbox_getDataCy({
            ...this.dataCy,
            elementType: "InputCheckboxLabel"
          })}
        >
					<slot name="label" />
				</div>
			</div>
		);
	}
}
