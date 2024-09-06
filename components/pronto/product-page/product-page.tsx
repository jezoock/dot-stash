import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'ds-product-page',
})
export class DSProductPage {

  @State() isLoading: boolean = false;

  selectedOption: number;

  displayAttributePrice(option) {
    const [before, after] = option.getAttribute("data-price").split('.');
    return `${before},${(after||'').padEnd(2,'0')} €`;
  }

  constructor() {
    this.optionClickHandler = this.optionClickHandler.bind(this);
  }

  optionClickHandler(selectedIndex: number, event) {
    const options = Array.from(document.querySelectorAll(".ds-product-attribute input"));
    options.map( (option, index) => {
      if (selectedIndex === index) {
        option.setAttribute("checked", "checked");
      } else {
        option.removeAttribute("checked");
      }
    });

    this.isLoading = true;
    window["prestashop"].emit('updateProduct', {
      eventType: 'updatedProductCombination',
      event
    });
  }

  componentDidLoad() {
    const options = Array.from(document.querySelectorAll(".ds-product-attribute input"));
    /* const priceContainer = document.querySelector(".product-total-price");
 */
    if (options?.length > 0) {
      options.map( (option, index) => {
        option.addEventListener("click", (event) => this.optionClickHandler(index, event))
      });
      
      /* const [defaultAttribute] = Array.from(attributes.querySelectorAll("option"));
      if (defaultAttribute && priceContainer) {
        priceContainer.innerHTML = this.displayAttributePrice(defaultAttribute);
      } */
    }

    const productImageSlider = document.querySelector(".ds-product-images__main ds-slider") as HTMLDsSliderElement;
    const productThumbnailsSlider = document.querySelector(".ds-product-images__menu ds-slider") as HTMLDsSliderElement;
    const productThumbnails = Array.from(productThumbnailsSlider.querySelectorAll(".ds-slider-item"));
    if (productThumbnails.length) {
      productThumbnails.map( (thumbnail, index) => {
        thumbnail.addEventListener("click", () => {
          productImageSlider.goTo(index);
        })
      })
    }

    window["prestashop"].on('updatedProduct', (data: {
        product_add_to_cart: string; 
        product_prices: string;
        product_cover_thumbnails: string;
        product_variants: string;
        product_url: string;
        product_title: string;
      }) => {
      console.log(data);
      /* $('.el-product__images .images-container').replaceWith(data.product_cover_thumbnails);
      $('.el-product__prices .product-prices').replaceWith(data.product_prices); */
      
      $('.ds-product-page__slider').html(data.product_cover_thumbnails);
      $('.ds-product-page__price').html(data.product_prices);
      $('.ds-product-page__add-to-cart').html(data.product_add_to_cart);
      this.isLoading = false;
    });

    document.querySelector("[data-button-action='add-to-cart']").addEventListener("click", (_) => {
      /* event.preventDefault();
      event.stopPropagation();
       console.log(window["$"](event["currentTarget"]["form"]).serialize()); */
    })
  }
  
  render() {
    return (
      <div class={{
        "ds-product-page": true,
        "--is-loading": this.isLoading
      }}>
        <slot />
      </div>
    );
  }
}