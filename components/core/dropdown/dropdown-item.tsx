import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'ds-dropdown-item',
})
export class DSDropdownItem {
  @Prop() name: string;
  @Prop() value: string | number | boolean;

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
