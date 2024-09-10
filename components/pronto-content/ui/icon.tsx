import { Component, h, Host, Prop } from '@stencil/core';


@Component({
  tag: 'pronto-icon',
  styleUrl: 'icon.scss'
})
export class ProntoIcon {
  
  @Prop() type: string;
  
  render() {
    return (
      <Host 
        class={{
          "pronto-icon": true,
          [`--${this.type}`]: true
        }}
      />
    );
  }
}