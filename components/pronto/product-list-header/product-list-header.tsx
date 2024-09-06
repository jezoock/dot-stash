import { Component, h, Host, Prop, Element, Fragment } from '@stencil/core';

@Component({
  tag: 'ds-product-list-header',
})
export class DSProductListHeader {

  @Element() hostContainer: HTMLElement;

  @Prop() labels: Record<string, string>;
  
  hasShortDesc: boolean;
  hasLongDesc: boolean;

  connectedCallback() {
    this.hasShortDesc = this.hostContainer.querySelector("[slot='short-desc']") !== null;
    this.hasLongDesc = this.hostContainer.querySelector("[slot='long-desc']") !== null;
  }

  componentWillLoad() {
  }


  render() {
    return (
      <Host class="ds-product-list-header">

        <div class="ds-product-list-header__cover">
          <slot name="cover" />
          
          <ds-title page class="ds-product-list-header__cover-title">
            <slot name="title" />
          </ds-title>
        </div>
        
        {this.hasShortDesc && (
          <Fragment>
            <div class="ds-product-list-header__description">
              <ds-text content>
                <slot name="short-desc" />
              </ds-text>
              <a href="#category-faq">En savoir plus</a>
            </div>
            <div class="ds-product-list-header__long-description">
              <ds-text content>
                <slot name="long-desc" />
              </ds-text>
            </div>
          </Fragment>
        )}

      </Host>
    );
  }
}