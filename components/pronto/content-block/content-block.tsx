import { Component, Element, h, Host, Prop } from '@stencil/core';


@Component({
  tag: 'ds-content-block',
  styleUrl: 'content-block.scss'
})
export class DSContentBlock {

  @Element() container: HTMLDsContentBlockElement;
  @Prop() imagePos: 'none' | 'before' | 'center' | 'after';
  
  render() {
    return (
      <Host
        class={{
          "ds-content-block": true,
          [`--${this.imagePos}`]: true,
        }}
      >
        <div class="ds-content-block__before">
          <slot name="before" />
        </div>
        <div class="ds-content-block__content">
          <slot />
        </div>
        <div class="ds-content-block__after">
          <slot name="after" />
        </div>
      </Host>
    );
  }
}