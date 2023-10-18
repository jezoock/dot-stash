import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { DataCy } from "../../../../utils/data-cy";
import { Greenbox_getDataCy } from "../../../../utils";

/**
 * This component define a form label (for input, select etc..)
 */
@Component({
  tag: 'gbx-form-label',
  styleUrl: './label.scss'
})
export class GbxFormLabel {

  @Prop() fieldLabel: string;
  @Prop() isInError: boolean;
  @Prop() isRequired: boolean;
  @Prop({ attribute: 'data-cy', mutable: true }) dataCy: DataCy = {
    pageName: null,
    elementName: null,
  };

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
          "gbx-form-label": true,
          "--error": this.isInError,
          "--required": this.isRequired,
        }}
        data-cy={Greenbox_getDataCy({
          ...this.dataCy,
          elementType: "Label"
        })}
        onClick={this.clickLabelHandler}
      >
        {this.fieldLabel}
      </label>
    );
  }
}
