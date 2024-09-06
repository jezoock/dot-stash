import { Component, h, Host, Element, Prop, Listen } from '@stencil/core';


@Component({
  tag: 'ds-product',
})
export class DSProduct {

  @Element() hostContainer: HTMLDsProductElement;

  @Prop({ reflect: true, mutable: true }) isLoading = false;
  @Prop({ reflect: true }) productId: string;

  trackingData: Record<string, any> = {};

  @Listen('requestProductTracking') 
  requestProductTrackingHandler({detail: { trackingParams }}) {
    let total = 0;

    trackingParams.items.map( item => {
      if (item.item_id === this.trackingData.id_product) {
        item.qty = this.trackingData.qty;
      } else {
        item.qty = 1;
      }
      item.price = parseFloat(item.price).toFixed(2);
      total += item.qty * item.price;
    });

    window['gtag']("event",  "add_to_cart", {
      ...trackingParams,
      value: total.toFixed(2)
    });
  }

  componentDidLoad() {
    this.initProductOptions();

    const { prestashop, $ } = (window as any);
    prestashop.on('updatedProduct', (data) => {
      $('.el-product__images .images-container').replaceWith(data.product_cover_thumbnails);
      $('.el-product__prices .product-prices').replaceWith(data.product_prices);
      this.adjustVideoDimensions();
      this.isLoading = false;
      /* if (data.product_pack) {
        $('.el-product__prices').innerHTML = data.product_pack;
      } */
    });

    /* const sizesSelect = this.hostContainer.querySelector(".el-product-option__attributes ds-select");
    if (sizesSelect) {
      sizesSelect.addEventListener("dsSelectChange", ({detail: {selectedOption: { value }}}: CustomEvent) => {
        const productPackSizesSelect = this.hostContainer.querySelector("[name='group1_4']") as HTMLSelectElement;
        if (productPackSizesSelect) {
          productPackSizesSelect.value = value;
          const changeEvent = new Event("change", { bubbles: true });
          productPackSizesSelect.dispatchEvent(changeEvent);
          (window as any).refreshPackAttributes("Refresh");
        }
      });
    } */

    const qtyButtons = Array.from(document.querySelectorAll(".el-product-quantity__container .input-group-btn"));
    qtyButtons.map( button => button.addEventListener("click", () => this.qtyInputChangeHandler()) );

    this.adjustVideoDimensions();

    const addToCartButton = document.querySelector('[data-button-action="add-to-cart"]');
    if (addToCartButton) {
      addToCartButton.addEventListener("click", this.cartButtonClickHandler);
    }
  }

  cartButtonClickHandler() {
    const jQuery = window['$'];

    this.trackingData = {
      qty: jQuery("#quantity_wanted")[0].getAttribute("value"),
      id_product: this.productId
    };
  }

  adjustVideoDimensions() {
    const videoSlide = document.querySelector(".el-product__images iframe") as HTMLIFrameElement;
    if (videoSlide) {
      const slider = document.querySelector(".el-product__images ds-slider") as HTMLDsSliderElement;
      const dimension = slider.offsetWidth.toString();
      videoSlide.height = dimension;
      videoSlide.width = dimension;
    }
  }

  qtyInputChangeHandler() {
    this.isLoading = true;
  }

  initProductOptions = () => {
    const optionsLayer = this.hostContainer.querySelector(".product-variants");
    if (optionsLayer) {
      const options = Array.from( optionsLayer.querySelectorAll(".el-product-option") ) as HTMLDivElement[];
      options.forEach( option => {
        if (option.classList.contains("--color")) {
          const colors = Array.from( option.querySelectorAll(".input-container") ) as HTMLLIElement[];
          colors.forEach( (color, index) => color.addEventListener('click', () => this.colorClickHandler(colors, index)))
        }
      })
    }
  }

  colorClickHandler(colors: HTMLLIElement[], selectedItemIndex: number) {
    colors.forEach( (color, index) => {
      color.classList[index === selectedItemIndex ? 'add' : 'remove']("--selected");
    });
  }
  
  render() {
    return (
      <Host
        class={{
          "--is-loading": this.isLoading
        }}
      >
        <slot />
      </Host>
    );
  }
}