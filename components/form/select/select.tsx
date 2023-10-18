import { Component, EventEmitter, h, Prop, State, Event } from '@stencil/core';
import { SelectOption } from './select-option.interface';
import { DS_getDataCy } from "../../../../utils";
import { DataCy } from "../../../../utils/data-cy";

/**
 * This component define a select form.
 */
@Component({
  tag: 'ds-select',
  styleUrl: './select.scss'
})
export class GbxSelect {

  @Prop() selectName: string;
  @Prop() selectId: string;
  @Prop() optionList: SelectOption[];
  @Prop() firstSelectOptionLabel: string;
  @Prop() isRequired: boolean;
  @Prop() isValid: boolean;
  @Prop() selectedValue: string;
  @Prop({ attribute: 'data-cy', mutable: true }) dataCy: DataCy = {
    pageName: null,
    elementName: null,
  };

  @State() isTouched: boolean;

  @Event() notify_selectInError_event: EventEmitter;
  @Event() notify_selectValueChanged_event: EventEmitter;

  optionListValues: string[];

  constructor() {
    this.onChangeValue = this.onChangeValue.bind(this);
    this.isValid = !this.isRequired;
  }

  componentWillLoad() {
    this.optionListValues = this.optionList.map(option => option.value)
  }

  onChangeValue(event: any): void {
    if (!this.isTouched) {
      this.isTouched = true;
    }

    const { value } = event.target;

    this.isValid = this.optionListValues.includes(value);

    if (this.isValid) {
      this.notify_selectValueChanged_event.emit({
        name: this.selectName,
        value: value
      });
    }
  }

  render() {
    return (
      <select
        class={{
          'ds-select': true,
          '--invalid': !this.isValid && this.isTouched,
        }}
        onChange={this.onChangeValue}
        required={this.isRequired}
        data-cy={DS_getDataCy({
          ...this.dataCy,
          elementType: "Select"
        })}
      >
        {this.firstSelectOptionLabel && (
          <option disabled={!!this.selectedValue}>
            {this.firstSelectOptionLabel}
          </option>
        )}
        {this.optionList.map((option: SelectOption) => {
          const label = option.label ? option.label : option.value;

          return (
            <option
              value={option.value}
              selected={this.selectedValue === option.value}
            >
              {label}
            </option>
          )
        })}
      </select>
    );
  }
}
