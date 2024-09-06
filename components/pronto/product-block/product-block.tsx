import { Component, Element, h, Prop } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

declare global {
  interface Window {
    prestashop: any;
    $: any;
  }
}

export interface ProductBlockParams {
  id: string;
  attributeId: string;
  customizationId: string;
  hasVariants: boolean;
  fullSizeImage: string;
  stock: number;
  name?: string;
  packPrice?: number;
  packLabel?: string;
  capacity?: string;
  attributeGroupId?: string;
  isLogged?: boolean;
  displayPrices: boolean;
  imgAlt?: string;
}

const defaultProductBlockParams = {
  id: '',
  name: '',
  attributeId: '',
  customizationId: '',
  hasVariants: false,
  fullSizeImage: '',
  stock: 0,
  isLogged: false,
  displayPrices: false,
  imgAlt: "",
}

@Component({
  tag: 'ds-product-block',
})
export class DSProductBlock {

  @Element() container: HTMLElement;

  @Prop() size: string = 'md';
  @Prop() params: string | ProductBlockParams = defaultProductBlockParams;

  productParams: ProductBlockParams;

  constructor() {
    this.addToCartButtonClickHandler = this.addToCartButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    const paramsFromProp = _ds.props.fromJSON(this.params);
    this.productParams = paramsFromProp;
  }

  componentDidLoad() {
    const productImage = this.container.querySelector(".ds-product-block__image img:not(.ds-product-block__image-over)");

    if (productImage) {
      const productImageAlt = productImage.getAttribute("alt");
      const productImageHover = this.container.querySelector(".ds-product-block__image-over")
      productImageHover.setAttribute("alt", productImageAlt);
    }
  }

  async addToCartButtonClickHandler( event: Event ) {
    event.preventDefault();
    event.stopPropagation();

    const { id, attributeId, attributeGroupId, customizationId } = this.productParams;
    _ds.app.addToCart(id, attributeId, attributeGroupId, customizationId);
  }

  render() {
    return (
      <div
        class={{
          "ds-product-block": true,
          "--out-of-stock": this.productParams.stock === 0,
          [`--${this.size}`]: true,
        }}
      >
        <div class="ds-product-block__image">
          {this.productParams["image-over"] && (
            <img class="ds-product-block__image-over" src={this.productParams['image-over']} loading="lazy" />
          )}

          <slot name="image" />

          <div class="ds-product-block__actions">
            <slot name="actions" />
          </div>
        </div>

        <div class="ds-product-block__infos">

          <div class="ds-product-block__name">
            <slot />
          </div>

          <div class="ds-product-block__brand">
            <slot name="brand" />
          </div>

          <div class="ds-product-block__description">
            <slot name="description" />
          </div>

          <div class="ds-product-block__features">
            <slot name="features" />
          </div>
          
          <div class="ds-product-block__price">
            <slot name="price" />
          </div>

          <ds-trigger
            class="ds-product-block__quick-buy-button"
            type="button"
            mods={['xl', 'stl-1']}
            disabled={this.productParams.stock <= 0}
            onClick={ this.addToCartButtonClickHandler }
          >
            <slot name="button-label" />
          </ds-trigger>
          
          <div class="ds-product-block__reviews">
            <slot name="reviews" />
          </div>
          
        </div>
        
      
      </div>
    );
  }
}