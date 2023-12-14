import { Component, Element, h, Prop, State } from '@stencil/core';
/* import context from './form-store';

const { formContext, formContextChange } = context; */

@Component({
  tag: 'ds-input',
  /* styleUrl: 'ds-input.css' */
})
export class DSInput {
  @Element() host: HTMLDivElement;
  @Prop() name: string;
  @Prop() useForm: string;
  @Prop({ mutable: true }) renderMethod: any;

  inputProps: any = {};
  @State() formContext: any;

  async componentWillLoad() {
    let inputProps = {};

    if (this.useForm) {
      const importedContext = await import('./form-store').then(module => module.default);
      this.formContext = importedContext;
      inputProps = {
        name: this.name,
        onBlur: this.eventHandler,
        onChange: this.eventHandler,
        onInput: this.eventHandler,
        defaultValue: this.formContext.forms[this.useForm].values[this.name].value,
      };
    }
    this.inputProps = inputProps;
  }

  eventHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    const {
      type,
      target: { value },
    } = event;
    if (this.formContext.validateOn.includes(type)) {
      this.formContext.eventHandler(this.name, value, this.useForm);
    }
    this[type].emit({ name: this.name });
  };

  render() {
    return (
      <div>
        <input style={{ border: '1px solid red' }} {...this.inputProps} />
        {this.formContext?.forms[this.useForm].hasError && <div>sfdlkgjdklfghdlfgdjfgjk</div>}
      </div>
    );
  }
}
