import { Component, Prop, h, State } from "@stencil/core";
import { Greenbox_formatPrice, Greenbox_getImage } from "../../../../../../../utils";
import { Action, Store } from "@stencil/redux";
import { translations } from "./translations";
import { TransAddTranslations } from "../../../../../../../_redux/actions/localization";

@Component({
  tag: "gbx-order-cart-product",
  styleUrl: "order-cart-product.scss"
})
export class GreenboxOrderCart {
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

    if (this.translations && this.translations.gbx_orderCartProduct === undefined) {
      this.TransAddTranslations(translations[this.settings.locale]);
    }
  }

  render() {
    return (
      <div class="gbx-order-cart-product__container">
        <div class={{
          "gbx-order-cart-item": true,
          "gbx-order-cart-item--readonly": true,
          "gbx-order-cart-item--checkout": true
        }}>
          <div class="gbx-order-cart-item__firstline">
            <div class={{
              "gbx-order-cart-item__image": true,
              "gbx-order-cart-item__image--no-pic": this.product.noPic
            }}>
              <img src={Greenbox_getImage(this.product.image || "unavailable", 120)} />
            </div>
            <div class="gbx-order-cart-item__quantity">
              <span>
                x{this.product.quantity}
              </span>
              {this.product.oldQuantity && this.product.oldQuantity !== this.product.quantity && (
                <div>
                  <span class="gbx-order-cart-item__quantity--old-quantity">
                    x{this.product.oldQuantity}
                  </span>
                </div>
              )}
            </div>
            <div class="gbx-order-cart-item__name">
              <span>
                {this.product.name[this.settings.locale]}
              </span>
              {this.product.unavailable && (
                <small class="gbx-order-cart-item__state gbx-order-cart-item__state--unavailable">
                  {this.translations.gbx_orderCartProduct.unavailable}
                </small>
              )}
              {!this.product.unavailable && this.product.insufficientStock && (
                <small class="gbx-order-cart-item__state gbx-order-cart-item__state--insufficient-stock">
                  {this.translations.gbx_orderCartProduct.insufficientStock}
                </small>
              )}
              {!this.product.unavailable && !this.product.insufficientStock && this.product.adjustedPrice && (
                <small class="gbx-order-cart-item__state gbx-order-cart-item__state--adjusted">
                  {this.translations.gbx_orderCartProduct.adjustedPrice}
                </small>
              )}
              {this.product.quantityDisplay && !this.product.unavailable && !this.product.insufficientStock && !this.product.adjustedPrice && (
                <small>
                  {this.product.quantityDisplay}
                </small>
              )}
            </div>
            <div class={
              "gbx-order-cart-item__price" +
              (this.product.unavailable ? " gbx-order-cart-item__price--strike" : "")
            }>
              {(!this.product.promotionTotalPrice || this.product.promotionTotalPrice == 0) && (
                <span>
                  {Greenbox_formatPrice({ price: this.product.totalPrice })}
                </span>
              )}
              {this.product.oldTotalPrice && this.product.oldTotalPrice !== this.product.totalPrice && (
                <div>
                  <span class="gbx-order-cart-item__price--old-price">
                    {Greenbox_formatPrice({ price: this.product.oldTotalPrice })}
                  </span>
                </div>
              )}
              {!this.product.oldTotalPrice && this.product.promotionTotalPrice && this.product.promotionTotalPrice > 0 && (
                <div>
                  <span>{Greenbox_formatPrice({ price: this.product.promotionTotalPrice / 100 })}</span><br />
                  <span class="gbx-order-cart-item__price--old-price">
                    {Greenbox_formatPrice({ price: this.product.totalPrice / 100, currency: false })}
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
