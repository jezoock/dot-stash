//#region Vendor imports
import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
//#endregion
//#region App imports
import { RadioItem } from './item/radio-item.interface';
import { RadioItemCheckStyle } from './item/radio-item-check-style.enum';
import { RadioItemStyle } from './item/radio-item-style.enum';
import { Validator } from '../validator/validator';
import { ValidatorType } from '../validator/validator-type.enum';
import { isFieldRequired } from '../utils';
import _ds from '../../../../typescript/dot-stash';
//#endregion

@Component({
  tag: 'ds-radio',
  styleUrl: 'radio.scss'
})
export class DSRadio {
  @Prop({ attribute: 'mods' }) mods: string[] = [];

  @Prop() label: string;
  @Prop() radioId: string;
  @Prop() itemList: RadioItem[] = [];
  @Prop() radioItemStyle: RadioItemStyle;
  @Prop() radioItemCheckStyle: RadioItemCheckStyle;
  /**
   * A table of validators to validate the form field and theirs error messages.
   * The error messages from the component implementing the form field.
   * If no error messages are passed, default values will be used from the translations
   * Can be empty
   * @type {ValidatorType[]}
   */
  @Prop() validators: Validator[] = [];

  @State() fieldErrorMessage: string;
  @State() selectedRadioValue: string;
  @State() isRequired: boolean;

  @Event() notify_radioValueSelected_event: EventEmitter;

  private CSSClasses: any;

  @Listen("notify_radioItemSelected_event")
  notify_radioItemSelected_eventHandler({ detail: { selectedRadioValue } }) {
    if (selectedRadioValue) {
      this.selectedRadioValue = selectedRadioValue;
      this.fieldErrorMessage = null;
      this.notify_radioValueSelected_event.emit({ selectedRadioValue });
    }
  }

  componentWillLoad() {
    this.CSSClasses = _ds.props.toClassList("ds-radio", this.mods);
    this.isRequired = isFieldRequired(this.validators);
    this.onClickLabel = this.onClickLabel.bind(this);
  }

  /**
   * If the label is clicked, display an error message if they have validator REQUIRED
   */
  private onClickLabel(): void {
    if (this.validators?.length && !this.fieldErrorMessage) {
      const requiredValidator: Validator = this.validators
        .find((validator) => validator.type === ValidatorType.REQUIRED);

      if (requiredValidator?.errorMessage) {
        this.fieldErrorMessage = requiredValidator.errorMessage;
      }
    }
  }

  private isFieldInError(): boolean {
    return !!(!this.selectedRadioValue && this.fieldErrorMessage);
  }

  render() {
    const isInError: boolean = this.isFieldInError();

    return (
      <div class={this.CSSClasses}>
        <ds-form-label
          fieldLabel={this.label}
          onClickLabel={this.onClickLabel}
          isInError={isInError}
          isRequired={this.isRequired}
        />

        <div class="ds-radio__list">
          <ds-radio-list
            itemList={this.itemList}
            radioItemStyle={this.radioItemStyle}
            radioItemCheckStyle={this.radioItemCheckStyle}
          />
        </div>

        {isInError && (
          <div class="ds-radio__feedback">
            <ds-field-feedback message={this.fieldErrorMessage} />
          </div>
        )}
      </div>
    );
  }
}
