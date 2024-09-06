import { Component, h, Element, Host, Prop, State } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';


@Component({
  tag: 'ds-ajax',
})
export class DSAjax {

  url: string;

  @Element() hostContainer: HTMLElement;

  @Prop({ reflect: true }) on: 'load' | 'click';
  @Prop({ reflect: true }) target: 'self' | string = 'self';

  @State() isLoading: boolean = false;
  
  constructor() {
    this.eventHandler = this.eventHandler.bind(this);
  }

  componentDidLoad() {
    const link = this.hostContainer.querySelector("a");
    console.log(link);
    if (link) {
      this.url = link.getAttribute("href");
      if (this.on === "load") {
        this.eventHandler();
      } else {
        this.hostContainer.addEventListener(this.on, this.eventHandler)
      }
    } else {
      console.log("[ Error ] DSLink - no anchor found")
    }
  }

  eventHandler = async (event?: Event) => {
    event?.preventDefault();
    if (this.target === 'self') {
      this.isLoading = true;
      const markup = await _ds.ajax.get(this.url + '?isAjax=true');
      const content = (new DOMParser()).parseFromString(markup, 'text/html');
      
      this.hostContainer.innerHTML = content.querySelector(".ds-ajax-content").innerHTML;
      this.isLoading = false;
    }
  }

  render() {
    return (
      <Host
        class={{
          "ds-ajax": true,
          "--is-loading": this.isLoading,
        }}
      >
        <slot />
      </Host>
    );
  }
}