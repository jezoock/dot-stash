/**
 * Vendor imports
 */
import { Component, h, Prop } from '@stencil/core';
/**
 * App imports
 */
import { FeedbackLevel } from './feedback-level';

/**
 * This component display a message with a level for the input forms
 */
@Component({
  tag: "ds-field-feedback",
  styleUrl: "./feedback.scss",
})
export class GbxFieldFeedback {
  @Prop() message: string;
  @Prop() level: FeedbackLevel = FeedbackLevel.ERROR;

  constructor() {
  }

  componentWillLoad() {
  }


  render() {
    return (
      <div class={{
        "ds-field-feedback": true,
        [`--${this.level}`]: true,
      }}>
        {this.message}
      </div>
    );
  }
}
