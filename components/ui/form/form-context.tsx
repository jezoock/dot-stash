import { Component, h, Prop } from '@stencil/core';
import formContext from './form-store';

@Component({
  tag: 'ds-form-context',
})
export class DSFormContext {
  @Prop() name: string;
  @Prop() values: any = {};

  componentWillLoad() {
    const formData = {
      values: this.values,
      hasError: false,
    };
    formContext.forms[this.name] = formData;
  }

  render() {
    return <slot />;
  }
}
