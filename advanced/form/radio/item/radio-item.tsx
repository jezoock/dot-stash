/**
 * Vendor imports
 */
import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
/**
 * App imports
 */
import { RadioItemStyle } from './radio-item-style.enum';
import { RadioItemCheckStyle } from './radio-item-check-style.enum';

/**
 * This component define a radio item.
 */
@Component({
  tag: 'ds-radio-item',
  styleUrl: 'radio-item.scss'
})
export class DSRadioItem {

  @Prop() label: string;
  @Prop() radioId: string;
  @Prop() name: string;
  @Prop() value: string;
  @Prop() radioItemStyle: RadioItemStyle = RadioItemStyle.ROUND;
  @Prop() radioItemCheckStyle: RadioItemCheckStyle = RadioItemCheckStyle.DOT;
  @Prop() isChecked: boolean;

  @Event() notify_radioItemChecked_event: EventEmitter;

  constructor() {
    this.onSelectRadioItem = this.onSelectRadioItem.bind(this);
  }

  componentWillLoad() {
    if (!this.radioId) {
      this.radioId = this.name;
    }
  }

  /**
   * Send an event when a radio is selected
   */
  private onSelectRadioItem(): void {
    this.notify_radioItemChecked_event.emit({ selectedRadioValue: this.value });
  }

  render() {
    return (
      <div class="ds-radio-item">
        <label class="ds-radio-item-label">
          <span class="ds-radio-item-label__label">
            {this.label}
          </span>

          <input
            class="ds-radio-item-label__input"
            type="radio"
            id={this.radioId}
            name={this.name}
            value={this.value}
            onClick={this.onSelectRadioItem}
          />

          <div class={{
            'ds-radio-item-label__radio': true,
            '--checked': this.isChecked,
            '--unchecked': !this.isChecked,
            [`--${this.radioItemStyle}`]: true,
            [`--${this.radioItemCheckStyle}`]: this.isChecked,
          }} />
        </label>
      </div>
    );
  }
}
