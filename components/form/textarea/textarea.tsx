import { Prop, h, Component, EventEmitter, Event, State } from "@stencil/core";
import { FormValidator } from "../validator/form-validator";
import { Validator } from "../validator/validator";

const componentName = "snk-textarea";

@Component({
  tag: "snk-textarea",
  styleUrl: './textarea.scss'
})
export class SnkTextarea {
  @Prop() content!: string;
  @Prop() columns: number;
  @Prop() lines = 1;
  @Prop() disabled: boolean;
  @Prop() resizable: boolean;
  @Prop() placeholder = '';
  @Prop() validators: Validator[];
  @Prop() withCharacterCount: boolean;
  @Prop() maxLength: number;

  @Event() textAreaUpdate: EventEmitter<{ [k: string]: string }>;

  @State() errorMessage: string;
  @State() isInError: boolean;

  constructor() {
    this.textAreaUpdateHandler = this.textAreaUpdateHandler.bind(this);
    this.textAreaKeyPressHandler = this.textAreaKeyPressHandler.bind(this);
  }

  private textAreaUpdateHandler(e: InputEvent) {
    const target = e.target as HTMLTextAreaElement;
    const value = target.value.replace(/\n/g, '');
    const validationCheck = this.checkValidation(value);

    if (validationCheck) {
      const { isInError, errorMessage } = validationCheck;
      this.isInError = isInError;
      this.errorMessage = errorMessage;
    }

    if (!this.isInError) {
      this.textAreaUpdate.emit({ value });
    }
  }

  private textAreaKeyPressHandler(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  private checkValidation(value: string) {
    if (this.validators?.length) {
      const validator: Validator = FormValidator.validate(value, this.validators);
      const errorMessage: string = FormValidator.getErrorMessage({
        validatorType: validator?.type,
        validators: this.validators
      });

      return {
        errorMessage,
        isInError: Boolean(errorMessage)
      };
    }
  }

  render() {
    const classes = {
      [`${componentName}__textarea`]: true,
      '--no-resize': !this.resizable,
      '--error': this.content.length === this.maxLength || Boolean(this.isInError)
    };

    return (
      <div class={componentName}>
        <textarea
          class={classes}
          disabled={this.disabled}
          cols={this.columns}
          maxLength={this.maxLength}
          value={this.content}
          rows={this.lines}
          onKeyPress={this.textAreaKeyPressHandler}
          onInput={this.textAreaUpdateHandler}
        />
        {this.withCharacterCount && (
          <span class={`${componentName}__character-count`}>{this.maxLength - this.content.length}</span>
        )}
        {this.errorMessage && (
          <div
            id={`input-error-message`}
            class={`${componentName}__error-message`}
          >
            {this.errorMessage}
          </div>
        )}
      </div>
    );
  }
}
