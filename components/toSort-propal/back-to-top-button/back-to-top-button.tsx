import { Component, h, Host, Element, Prop, State } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-back-to-top-button',
  styleUrl: 'back-to-top-button.scss'
})
export class DSBackToTopButton {

  @Element() host: HTMLDsBackToTopButtonElement;
  
  @Prop() offset: string | number;
  @Prop() scrollBehavior: "smooth" | "instant" | "auto" = "auto"; 

  @State() isShown: boolean = false;

  topOffset: number = 0;
  
  constructor() {
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
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

  buttonClickHandler() {
    window.scrollTo({
      top: 0,
      behavior: this.scrollBehavior
    });
  }

  render() {
    return (
      <Host class={{
        "ds-back-to-top-button": true,
        "--is-shown": this.isShown
      }}>
        <ds-trigger
          class="ds-back-to-top-button__trigger"
          type="button" 
          mods="back-to-top" 
          onClick={this.buttonClickHandler}
        >
          <slot />
        </ds-trigger>
      </Host>
    );
  }
}
