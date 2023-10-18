import { Component, Event, EventEmitter, h, Listen, Prop } from '@stencil/core';
import { RadioItem } from '../item/radio-item.interface';
import { RadioItemCheckStyle } from '../item/radio-item-check-style.enum';
import { RadioItemStyle } from '../item/radio-item-style.enum';

/**
 * This component define a list of radio items.
 */
@Component({
  tag: 'ds-radio-list',
  styleUrl: 'radio-list.scss'
})
export class DSRadioList {

  @Prop() itemList: RadioItem[] = [];
  @Prop() radioItemStyle: RadioItemStyle;
  @Prop() radioItemCheckStyle: RadioItemCheckStyle;

  @Event() notify_radioItemSelected_event: EventEmitter;

  @Listen('notify_radioItemChecked_event')
  notify_radioItemChecked_eventHandler({ detail: { selectedRadioValue } }) {
    this.itemList = this.itemList.map(item => {
      return {
        ...item,
        isChecked: item.value === selectedRadioValue
      };
    });

    this.notify_radioItemSelected_event.emit({ selectedRadioValue });
  }

  render() {
    return (
      <div class="ds-radio-list">
        {this.itemList.map((item) => {
          return (
            <ds-radio-item
              label={item.label}
              radioId={item.id}
              name={item.name}
              value={item.value}
              radioItemStyle={this.radioItemStyle}
              radioItemCheckStyle={this.radioItemCheckStyle}
              isChecked={item.isChecked}
            />
          )
        })}
      </div>
    );
  }
}
