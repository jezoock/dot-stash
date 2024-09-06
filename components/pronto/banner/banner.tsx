import { Component, h, Prop } from '@stencil/core';


@Component({
  tag: 'ds-banner',
  styleUrl: 'banner.scss'
})
export class DSBanner {

  @Prop() dsUrl: string;

  constructor() {
    this.bannerClickHandler = this.bannerClickHandler.bind(this);
  }

  bannerClickHandler() {
    window.location.href = this.dsUrl;
  }
  
  render() {
    return (
      <div class="ds-banner" onClick={this.bannerClickHandler}>
        <slot />
      </div>
    );
  }
}