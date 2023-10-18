import { Component, Prop, h, State } from "@stencil/core";
import Fragment from "stencil-fragment";
import { Greenbox_formatPrice } from "../../../../../../utils";
import { Action, Store } from "@stencil/redux";
import { translations } from "./translations";
import { TransAddTranslations } from "../../../../../../_redux/actions/localization";

@Component({
  tag: "gbx-order-cart",
  styleUrl: "order-cart.scss"
})
export class GreenboxOrderCart {
  @Prop({ mutable: true, reflect: true }) order: any;

  @Prop({ context: "store" }) store: Store;
  @State() settings: any;
  @State() translations: any;

  private productsList: any[];
  private substitutedProductsList: any[];

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

    if (this.translations && this.translations.gbx_orderCart === undefined) {
      this.TransAddTranslations(translations[this.settings.locale]);
    }

    this.buildProductsLists();
  }

  buildProductsLists() {
    if (this.order && this.order.products) {
      this.productsList = [];
      this.substitutedProductsList = [];

      this.order.products.forEach(product => {
        if (this.order.type === 'restaurant' && product.image) {
          product.image = `${this.settings.cdnURL}${product.image}`;
        }

        if (['cancelled'].indexOf(product.state) > -1) {
          let productParent = this.order.products.find(p => p.id === product.parent);
          if (productParent) {
            this.productsList.push({
              ...productParent,
              adjustedPrice: false,
              insufficientStock: false,
              oldQuantity: null,
              oldTotalPrice: null,
              unavailable: true,
            });
          } else {
            this.productsList.push({
              ...product,
              adjustedPrice: false,
              insufficientStock: false,
              oldQuantity: null,
              oldTotalPrice: null,
              unavailable: true,
            });
          }
        } else if (['new', 'validationRequired', 'validated', 'collected'].indexOf(product.state) > -1) {
          const productReplaced = this.order.products.find(p => p.id === product.parent);
          if (productReplaced) {
            if (productReplaced.state === 'adjusted') {
              this.productsList.push({
                ...product,
                adjustedPrice: true,
                insufficientStock: false,
                oldQuantity: productReplaced.quantity,
                oldTotalPrice: productReplaced.totalPrice,
                unavailable: false,
              });
            } else if (productReplaced.state === 'replaced' && productReplaced.refProduct === product.refProduct) {
              // Same Product
              if (productReplaced.quantity !== product.quantity) {
                // Quantity changed
                this.productsList.push({
                  ...product,
                  adjustedPrice: false,
                  insufficientStock: productReplaced.quantity < product.quantity,
                  oldQuantity: productReplaced.quantity,
                  oldTotalPrice: productReplaced.totalPrice,
                  unavailable: false,
                });
              } else {
                // Quantity unchanged (same as collected)
                this.productsList.push({
                  ...product,
                  adjustedPrice: false,
                  insufficientStock: false,
                  oldQuantity: null,
                  oldTotalPrice: null,
                  unavailable: false,
                });
              }
            } else {
              // Different products
              this.substitutedProductsList.push({
                newProduct: {
                  ...product,
                },
                oldProduct: {
                  ...productReplaced,
                },
              });
            }
          } else {
            // Product not replaced
            this.productsList.push({
              ...product,
              adjustedPrice: false,
              insufficientStock: false,
              oldQuantity: null,
              oldTotalPrice: null,
              unavailable: false,
            });
          }
        }
      });
    }
  }

  isSmallFeeShown(): boolean {
    return (
      this.order?.fees &&
      this.order.fees.smallFee > 0 &&
      this.order.totalProducts < this.order.fees.minTotalProducts
    );
  }

  render() {
    return (
      <div class="gbx-order-cart__container">
        <div class="gbx-order-cart__content">
          <div class="gbx-order-cart__price-adjustment-info" innerHTML={this.translations.gbx_orderCart.priceAdjustmentInfo} />
          <ul class="gbx-order-cart__item-list">
            {
              (!this.productsList || !this.productsList.length) &&
              (!this.substitutedProductsList || !this.substitutedProductsList.length) &&
              <li class="gbx-order-cart__empty" />
            }
            {
              this.productsList &&
              this.productsList.length > 0 &&
              this.productsList.map(product => {
                return (
                  <li class="gbx-order-cart__product">
                    <gbx-order-cart-product product={product} />
                  </li>
                );
              })
            }
          </ul>
          {
            this.substitutedProductsList &&
            this.substitutedProductsList.length > 0 && (
              <div class="gbx-order-cart__substituted-products">
                <h4>{this.translations.gbx_orderCart.substitutedProducts}</h4>
                <ul>
                  {
                    this.substitutedProductsList.map(substitutedProduct => {
                      return (
                        <li class="gbx-order-cart__product-substitution">
                          <gbx-order-cart-product-substitution substitutedProduct={substitutedProduct} />
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
            )
          }
        </div>
        <footer class="gbx-order-cart__footer">
          <div class="gbx-order-cart-footer-summary">
            {this.order.deliveryMode !== "takeaway" && (
              <Fragment>
                <span class="gbx-order-cart-footer-summary__label">{this.translations.gbx_orderCart.deliveryFees}</span>
                {this.isSmallFeeShown() && !isNaN(this.order.fees.shipping) ? (
                  <span class="gbx-order-cart-footer-summary__price">
                    {Greenbox_formatPrice({ price: this.order.fees.shipping })}
                  </span>
                ) : (
                  <span class="gbx-order-cart-footer-summary__price">
                    {Greenbox_formatPrice({ price: this.order.totalShipping })}
                  </span>
                )}
              </Fragment>
            )}
            {this.order.tips?.driver?.amount && (
              <Fragment>
                <span class="gbx-order-cart-footer-summary__label">{this.translations.gbx_orderCart.driverTips}</span>
                <span class="gbx-order-cart-footer-summary__price">{Greenbox_formatPrice({ price: this.order.tips.driver.amount })}</span>
              </Fragment>
            )}
            {this.order?.serviceFee && this.order.serviceFee > 0 && (
              <Fragment>
                <span class="gbx-order-cart-footer-summary__label">{this.translations.gbx_orderCart.serviceFee}</span>
                <span class="gbx-order-cart-footer-summary__price">{Greenbox_formatPrice({ price: this.order.serviceFee })}</span>
              </Fragment>
            )}
            {this.isSmallFeeShown() && !isNaN(this.order.fees.smallFee) && (
              <Fragment>
                <span class="gbx-order-cart-footer-summary__label">{this.translations.gbx_orderCart.smallFee}</span>
                <span class="gbx-order-cart-footer-summary__price">{Greenbox_formatPrice({ price: this.order.fees.smallFee })}</span>
              </Fragment>
            )}
            <span class="gbx-order-cart-footer-summary__label">{this.translations.gbx_orderCart.totalOrder}</span>
            <span class="gbx-order-cart-footer-summary__price --highlight"> {Greenbox_formatPrice({ price: this.order.totalPaid })} </span>
          </div>
        </footer>
      </div>
    );
  }
}
