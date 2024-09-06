import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'ds-lang',
})
export class DSLang {
  
  @Prop({ reflect: true }) dsIsSelected: boolean = false;
  @Prop({ reflect: true }) dsIsoCode: string;

  render() {
    return (
      <div
        class={{
          "ds-lang": true,
          "--selected": this.dsIsSelected
        }}
      >
        <slot name="link" />
      </div>
    );
  }
}