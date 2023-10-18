import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { DS_computeCSSClassList, DS_getDataCy, DS_uuid } from "../../../../utils";
import { DataCy } from "../../../../utils/data-cy";

@Component({
	tag: 'ds-checkbox',
	styleUrl: 'checkbox.scss'
})
export class GbxCheckbox {

	@Prop({ attribute: "id" }) inputId: string = `ds-checkbox-${DS_uuid()}`;
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
					...DS_computeCSSClassList("ds-checkbox", this.type),
					"--checked": this.isChecked,
					"--disabled": this.isDisabled
				}}
        data-cy={DS_getDataCy({
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
          data-cy={DS_getDataCy({
            ...this.dataCy,
            elementType: "InputCheckbox"
          })}
				/>
				<div
          class="ds-checkbox__label"
          data-cy={DS_getDataCy({
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
