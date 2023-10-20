import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/**
 * This component define a form label (for input, select etc..)
 */
@Component({
  tag: 'ds-form-label',
  styleUrl: './label.scss'
})
export class DSFormLabel {

  @Prop() fieldLabel: string;
  @Prop() isInError: boolean;
  @Prop() isRequired: boolean;

  @Event() private clickLabel: EventEmitter;

  constructor() {
    this.clickLabelHandler = this.clickLabelHandler.bind(this);
  }

  private clickLabelHandler() {
    if (this.clickLabel) {
      this.clickLabel.emit();
    }
  }

  render() {
    return (
      <label
        class={{
          "ds-form-label": true,
          "--error": this.isInError,
          "--required": this.isRequired,
        }}
        onClick={this.clickLabelHandler}
      >
        {this.fieldLabel}
      </label>
    );
  }
}
