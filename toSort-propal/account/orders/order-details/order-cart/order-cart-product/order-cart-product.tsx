import { Component, Prop, h, State } from "@stencil/core";
import { DS_formatPrice, DS_getImage } from "../../../../../../../utils";
import { Action, Store } from "@stencil/redux";
import { translations } from "./translations";
import { TransAddTranslations } from "../../../../../../../_redux/actions/localization";

@Component({
  tag: "ds-order-cart-product",
  styleUrl: "order-cart-product.scss"
})
export class DSOrderCart {
  @Prop({ mutable: true, reflect: true }) product: any;

  @Prop({ context: "store" }) store: Store;
  @State() settings: any;
  @State() translations: any;

  TransAddTranslations: Action;

  constructor() { }

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      const {
        app: { settings },
        localization: translations
      } = state;
      return {
        settings: settings,
        translations: translations
      };
    });

    this.store.mapDispatchToProps(this, {
      TransAddTranslations
    });

    if (this.translations && this.translations.ds_orderCartProduct === undefined) {
      this.TransAddTranslations(translations[this.settings.locale]);
    }
  }

  render() {
    return (
      <div class="ds-order-cart-product__container">
        <div class={{
          "ds-order-cart-item": true,
          "ds-order-cart-item--readonly": true,
          "ds-order-cart-item--checkout": true
        }}>
          <div class="ds-order-cart-item__firstline">
            <div class={{
              "ds-order-cart-item__image": true,
              "ds-order-cart-item__image--no-pic": this.product.noPic
            }}>
              <img src={DS_getImage(this.product.image || "unavailable", 120)} />
            </div>
            <div class="ds-order-cart-item__quantity">
              <span>
                x{this.product.quantity}
              </span>
              {this.product.oldQuantity && this.product.oldQuantity !== this.product.quantity && (
                <div>
                  <span class="ds-order-cart-item__quantity--old-quantity">
                    x{this.product.oldQuantity}
                  </span>
                </div>
              )}
            </div>
            <div class="ds-order-cart-item__name">
              <span>
                {this.product.name[this.settings.locale]}
              </span>
              {this.product.unavailable && (
                <small class="ds-order-cart-item__state ds-order-cart-item__state--unavailable">
                  {this.translations.ds_orderCartProduct.unavailable}
                </small>
              )}
              {!this.product.unavailable && this.product.insufficientStock && (
                <small class="ds-order-cart-item__state ds-order-cart-item__state--insufficient-stock">
                  {this.translations.ds_orderCartProduct.insufficientStock}
                </small>
              )}
              {!this.product.unavailable && !this.product.insufficientStock && this.product.adjustedPrice && (
                <small class="ds-order-cart-item__state ds-order-cart-item__state--adjusted">
                  {this.translations.ds_orderCartProduct.adjustedPrice}
                </small>
              )}
              {this.product.quantityDisplay && !this.product.unavailable && !this.product.insufficientStock && !this.product.adjustedPrice && (
                <small>
                  {this.product.quantityDisplay}
                </small>
              )}
            </div>
            <div class={
              "ds-order-cart-item__price" +
              (this.product.unavailable ? " ds-order-cart-item__price--strike" : "")
            }>
              {(!this.product.promotionTotalPrice || this.product.promotionTotalPrice == 0) && (
                <span>
                  {DS_formatPrice({ price: this.product.totalPrice })}
                </span>
              )}
              {this.product.oldTotalPrice && this.product.oldTotalPrice !== this.product.totalPrice && (
                <div>
                  <span class="ds-order-cart-item__price--old-price">
                    {DS_formatPrice({ price: this.product.oldTotalPrice })}
                  </span>
                </div>
              )}
              {!this.product.oldTotalPrice && this.product.promotionTotalPrice && this.product.promotionTotalPrice > 0 && (
                <div>
                  <span>{DS_formatPrice({ price: this.product.promotionTotalPrice / 100 })}</span><br />
                  <span class="ds-order-cart-item__price--old-price">
                    {DS_formatPrice({ price: this.product.totalPrice / 100, currency: false })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
