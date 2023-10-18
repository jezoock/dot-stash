import { Component, Prop, h, State } from "@stencil/core";
// import { DS_formatPrice } from "../../../../../../../utils";
import { Action, Store } from "@stencil/redux";
import {DS_formatPrice} from "../../../../../../../utils";
import { translations } from "./translations";
import { TransAddTranslations } from "../../../../../../../_redux/actions/localization";

@Component({
  tag: "ds-order-cart-product-substitution",
  styleUrl: "order-cart-product-substitution.scss"
})
export class DSOrderCart {
  @Prop({ mutable: true, reflect: true }) substitutedProduct: any;

  @Prop({ context: "store" }) store: Store;
  @State() settings: any;
  @State() translations: any;

  image: string;
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

    if (this.translations && this.translations.gbx_orderCartProductSubstitution === undefined) {
      this.TransAddTranslations(translations[this.settings.locale]);
    }

    this.substitutedProduct.oldProduct.image = this.getProductImage(this.substitutedProduct.oldProduct);
    this.substitutedProduct.newProduct.image = this.getProductImage(this.substitutedProduct.newProduct);
  }

  getProductImage(product: any): string {
    return product.image
      ? product.image.replace('{width}', '150').replace('{height}', '150')
      : this.settings.imagesPath + "/icon-no-product.svg";
  }

  render() {
    return (
      <div class="ds-order-cart-product-substitution__container">
        <div class="ds-order-cart-product-substitution__old-product">
          <span class="ds-order-cart-product-substitution__badge">{this.translations.gbx_orderCartProductSubstitution.unavailable}</span>
          <div class="ds-order-cart-product-substitution__image"
               style={{ "background-image": "url(" + this.substitutedProduct.oldProduct.image + ")" }}>
          </div>
          <span class="ds-order-cart-product-substitution__name">
            x{this.substitutedProduct.oldProduct.quantity} {this.substitutedProduct.oldProduct.name[this.settings.locale]}
          </span>
          <span class="ds-order-cart-product-substitution__price">
            {DS_formatPrice({ price: this.substitutedProduct.oldProduct.totalPrice })}
          </span>
        </div>
        <img src={this.settings.imagesPath + "/arrow-right.png"} class="ds-order-cart-product-substitution__arrow" />
        <div class="ds-order-cart-product-substitution__new-product">
          <div class="ds-order-cart-product-substitution__image"
               style={{ "background-image": "url(" + this.substitutedProduct.newProduct.image + ")" }}>
          </div>
          <span class="ds-order-cart-product-substitution__name">
            x{this.substitutedProduct.newProduct.quantity} {this.substitutedProduct.newProduct.name[this.settings.locale]}
          </span>
          <span class="ds-order-cart-product-substitution__price">
            {DS_formatPrice({ price: this.substitutedProduct.newProduct.totalPrice })}
          </span>
        </div>
      </div>
    );
  }
}
