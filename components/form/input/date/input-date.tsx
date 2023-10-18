import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import { DS_capitalizeFirstLetter } from '../../../../../utils';
import dayjs from "dayjs";

@Component({
	tag: 'ds-input-date',
	styleUrl: 'input-date.scss'
})
export class DSInputDate {
  @Prop() isMonthRequired: boolean;
  @Prop() isYearRequired: boolean;
	@Prop() inputId: string;
	@Prop() inputType: string;
	@Prop() isUsedForCreditCard: boolean = false;

	@State() year: number;
	@State() month: number;
  @State() readOnly: boolean;
  @State() isMonthInError: boolean;
  @State() isYearInError: boolean;

  minYearNumber: number;

  @Event() gbxDateInputChange: EventEmitter;

  @Listen('request_putInReadOnly_event')
  request_putInReadOnly_eventHandler({ detail: { readOnly } }) {
    this.readOnly = readOnly;
  }

	@Listen('request_clearInputs_event')
  request_clearInputs_eventHandler() {
	  this.month = null;
	  this.year = null;
  }

	constructor() {
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
		const now = dayjs();
		this.minYearNumber = parseInt(now.format('YY'));
	}

	componentDidLoad() {
    if (this.isUsedForCreditCard) {
      const monthElement: HTMLInputElement = document.getElementById("ds-input-date-month") as HTMLInputElement;
      const yearElement: HTMLInputElement = document.getElementById("ds-input-date-year") as HTMLInputElement;

      if (monthElement) {
        monthElement.autocomplete = "cc-exp-month";
      }

      if (yearElement)
        yearElement.autocomplete = "cc-exp-year";
    }
  }

	inputChangeHandler(event: any) {
		let { name, value } = event.target as HTMLInputElement;

		const intValue: number = parseInt(value, 10);

    if (isNaN(intValue)) {
      event.target.value = null;
      return;
    }

		const capitalizedName = DS_capitalizeFirstLetter(name);

    if (name === 'month' && (intValue < 0 || intValue > 12)) {
      this.isMonthInError = true;
    } else if (!value || value === '00' || value.length === 1) {
		  this[`is${capitalizedName}InError`] = true;
    } else {
      const maxLength = name === 'year' ? 4 : 2;

      if (value.length > maxLength) {
        value = value.slice(0, maxLength);
        event.target.value = value;
      }

      this[name] = value;

      this[`is${capitalizedName}InError`] = false;

      this.gbxDateInputChange.emit({
        year: this.year,
        month: this.month
      });
    }
	}

	render() {
		return (
			<div class={{
			  "ds-input-date": true,
        "--error": (this.isMonthRequired && this.isMonthInError) || (this.isYearRequired && this.isYearInError),
      }}>
				<ds-icon iconMods={['secure-field', 'date']} />
				<input
          class={{
            "ds-input-date__month": true,
            "--error": this.isMonthRequired && this.isMonthInError
          }}
          id="ds-input-date-month"
          onBlur={this.inputChangeHandler}
					onChange={this.inputChangeHandler}
					onInput={this.inputChangeHandler}
					name="month"
					type="number"
          min={0}
          max={12}
					value={this.month}
          placeholder="MM"
          readonly={this.readOnly}
					/>
				<input
          class={{
            "ds-input-date__year": true,
            "--error": this.isYearRequired && this.isYearInError
          }}
          id="ds-input-date-year"
					onBlur={this.inputChangeHandler}
					onChange={this.inputChangeHandler}
          onInput={this.inputChangeHandler}
					name="year"
					type="number"
          min={this.minYearNumber}
          value={this.year}
          placeholder="YY"
          readonly={this.readOnly}
				/>
			</div>
		);
	}
}
