import { Component, Element, h, Prop, State } from '@stencil/core';

declare global {
  interface Window {
    productsAlreadyTagged: any
  }
}

@Component({
  tag: 'ds-wishlist-button',
  styleUrl: 'wishlist-button.scss'
})
export class DSWishlistButton {

  @Element() container;
  
  @Prop({ mutable: true, reflect: true }) dsUrl: string;
  @Prop({ mutable: true, reflect: true }) dsProductId: string;
  @Prop({ mutable: true, reflect: true }) dsProductAttributeId: string;
  @Prop({ mutable: true, reflect: true }) dsIsLogged: string;

  @State() isReady: boolean = false;
  @State() isFavorited: boolean = false;
  isRemoved: boolean = false;

  constructor() {
    this.clickButtonHandler = this.clickButtonHandler.bind(this);
  }

  componentWillLoad() {
    this.isFavorited = this.getIsFavorited();
  }

  componentDidLoad() {
    this.container.classList.add("thumbnail-container");
    this.isReady = true;
  }

  getIsFavorited() {
    return window.productsAlreadyTagged.filter(
      (e) => e.id_product === this.dsProductId.toString() && e.id_product_attribute === this.dsProductAttributeId.toString()
    ).length > 0;
  }

  clickButtonHandler( event ) {
    event.stopPropagation();
    event.preventDefault();
    
    if(this.isFavorited) {
      this.isRemoved = true;
      this.isFavorited = false;
    } else {
      this.isRemoved = false;
      this.isFavorited = true;
    }
  }

  render() {
    return (
      <div
        class={{
          "ds-wishlist-button": true
        }}
        onClick={this.clickButtonHandler}
      >
        <div
          class={{
            "ds-wishlist-button__icon": true,
            "--favorited": this.isFavorited,
            "--removed": this.isRemoved
          }}
        />
          {this.isReady && (
            <div
              class="wishlist-button"
              data-url={this.dsUrl}
              data-product-id={this.dsProductId}
              data-product-attribute-id={this.dsProductAttributeId}
              data-is-logged={this.dsIsLogged}
              data-list-id="1"
              data-checked="true"
              data-is-product="true"
            />
          )}
      </div>
    );
  }
}