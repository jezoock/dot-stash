import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import { Greenbox_capitalizeFirstLetter } from '../../../../../utils';
import dayjs from "dayjs";

@Component({
	tag: 'gbx-input-date',
	styleUrl: 'input-date.scss'
})
export class GreenboxInputDate {
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
      const monthElement: HTMLInputElement = document.getElementById("gbx-input-date-month") as HTMLInputElement;
      const yearElement: HTMLInputElement = document.getElementById("gbx-input-date-year") as HTMLInputElement;

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

		const capitalizedName = Greenbox_capitalizeFirstLetter(name);

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
			  "gbx-input-date": true,
        "--error": (this.isMonthRequired && this.isMonthInError) || (this.isYearRequired && this.isYearInError),
      }}>
				<gbx-icon iconMods={['secure-field', 'date']} />
				<input
          class={{
            "gbx-input-date__month": true,
            "--error": this.isMonthRequired && this.isMonthInError
          }}
          id="gbx-input-date-month"
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
            "gbx-input-date__year": true,
            "--error": this.isYearRequired && this.isYearInError
          }}
          id="gbx-input-date-year"
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
