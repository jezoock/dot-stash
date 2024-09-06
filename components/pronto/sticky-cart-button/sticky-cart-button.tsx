import { Component, h, Host, Element, Prop, State } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-sticky-cart-button',
  styleUrl: 'sticky-cart-button.scss'
})
export class DSStickyCartButton {

  @Element() host: HTMLDsStickyCartButtonElement;
  
  @Prop() offset: string | number;
  @Prop() scrollBehavior: "smooth" | "instant" | "auto" = "auto"; 

  @State() isShown: boolean = false;

  topOffset: number = 0;
  
  constructor() {
    this.windowScrollHandler = this.windowScrollHandler.bind(this);
  }

  connectedCallback() {
    window.addEventListener("scroll", this.windowScrollHandler, false);
  }

  componentWillLoad() {
    this.topOffset = _ds.props.toNumber(this.offset);
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.windowScrollHandler);
  }

  windowScrollHandler() {
    const windowScrollTopOffset = window.scrollY;
    const { topOffset } = this;
    this.isShown = windowScrollTopOffset > topOffset;
  }

  render() {
    return (
      <Host class={{
        "ds-sticky-cart-button": true,
        "--is-shown": this.isShown
      }}>
        <slot />
      </Host>
    );
  }
}
