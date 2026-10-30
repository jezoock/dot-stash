import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'ds-icon',
})
export class DSIcon {
  @Prop() type: string;

  render() {
    return (
      <Host
        class={{
          'ds-icon': true,
          [`--${this.type}`]: true,
        }}
      />
    );
  }
}
