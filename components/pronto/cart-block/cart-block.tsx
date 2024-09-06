import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

declare global {
  interface Window {
    prestashop: any;
    $: any;
  }
}

@Component({
  tag: 'ds-cart-block',
  styleUrl: 'cart-block.scss'
})
export class DSCartBlock {

  @Prop({ mutable: true }) dsCartUrl: string;
  @Prop({ mutable: true }) dsRefreshUrl: string;
  @Prop({ mutable: true, reflect: true }) dsProductsCount: number | string = 0;

  productCount: number = 0;

  @Watch("dsProductsCount")
  productCountChangeHandler( newCount ) {
    this.productCount = _ds.props.toNumber( newCount );
  }

  constructor() {
    this.linkClickHandler = this.linkClickHandler.bind(this);
  }

  componentWillLoad() {
    this.productCount = _ds.props.toNumber( this.dsProductsCount );
  }

  showModal(modal) {
    window.$("#blockcart-modal").remove();
    window.$(".modal-backdrop").remove();
    const $body = window.$('body');
    $body.append(window.$(modal));
    window.$("#blockcart-modal").modal("show");
    $body.one('click', '#blockcart-modal', function (event) {
      if (event.target.id === 'blockcart-modal') {
        window.$(".modal-backdrop").remove();
        window.$("#blockcart-modal").remove();
      }
    });
  }

  componentDidLoad() {

    window.prestashop.on(
      'updateCart',
      async (event) => {
        var requestData = {};
        const { resp } = event;
        if (event && event.reason && typeof event.resp !== 'undefined' && !event.resp.hasError) {
          requestData = {
            id_customization: event.reason.idCustomization,
            id_product_attribute: event.reason.idProductAttribute,
            id_product: event.reason.idProduct,
            action: event.reason.linkAction
          };
        }
        if (event && event.resp && event.resp.hasError) {
          window.prestashop.emit('showErrorNextToAddtoCartButton', { errorMessage: event.resp.errors.join('<br/>')});
        }

        if(resp.cart.products_count) {
          this.dsProductsCount = resp.cart.products_count;
        }

        try {
          const resp: any = await _ds.ajax.post(this.dsRefreshUrl, requestData);
          if (resp.modal) {
            this.showModal(resp.modal);
          }
        } catch( err ) {
          window.prestashop.emit('handleError', { eventType: 'updateShoppingCart', resp: err });
        }
      }
    );
  }

  linkClickHandler( event ) {
    if(this.productCount === 0) {
      event.preventDefault();
    }
  }

  render() {
    return (
      <div class="ds-cart-block">
        <a
          class="ds-cart-block__link"
          href={this.dsCartUrl}
          onClick={this.linkClickHandler}
          title="Voir ton panier"
        >
          {this.productCount > 0 && (
            <span class="ds-cart-block__products-count">
              {this.productCount}
            </span>
          )}
        </a>
      </div>
    );
  }
}