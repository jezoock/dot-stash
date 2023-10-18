import { Component, Prop, h, State } from "@stencil/core";
import { Action, Store } from "@stencil/redux";
import Fragment from "stencil-fragment";
import { translations } from "./translations";
import { TransAddTranslations } from "../../../../../../_redux/actions/localization";

@Component({
  tag: "ds-order-informations",
  styleUrl: "order-informations.scss"
})
export class DSOrderInformations {
  @Prop({ mutable: true, reflect: true }) order: any;

  @Prop({ context: "store" }) store: Store;
  @State() settings: any;
  @State() translations: any;

  TransAddTranslations: Action;

  constructor() {}

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

    if (
      this.translations &&
      this.translations.gbx_orderInformations === undefined
    ) {
      this.TransAddTranslations(translations[this.settings.locale]);
    }
  }

  render() {
    return (
      <header class="ds-order-cart__header">
        <div class="ds-order-cart__line-information">
          <div>{this.translations.gbx_orderInformations.orderNumber}:</div>
          <div>{this.order.number}</div>
        </div>
        <div class="ds-order-cart__line-information">
          <div>
            {
              this.translations.gbx_orderInformations[
                `${this.order.deliveryMode}`
              ]
            }
          </div>
          <div>
            <greenbox-datetime
              datetime={this.order.dropoffDeadline}
              mode="verbose"
            />
          </div>
        </div>
        <div class="ds-order-cart__line-information">
          <div>
            {
              this.translations.gbx_orderInformations.address[
                `${this.order.deliveryMode}`
              ]
            }
          </div>
          <div>
            {this.order.dropoffAddress && this.order.dropoffAddress.formatted}
          </div>
        </div>
        <div class="ds-order-cart__line-information">
          {this.order.deliveryMode === "takeaway" ? (
            <Fragment>
              <div>
                {this.translations.gbx_orderInformations.pickupAddress}:
              </div>
              <div class="ds-order-cart-pickup-address">
                <div class="ds-order-cart-pickup-address__shop-name">
                  {this.order.restaurantName}
                </div>
                <div class="ds-order-cart-pickup-address__google-link">
                  <a
                    href={`https://www.google.fr/maps/place/${this.order.pickupAddress.formatted}`}
                    target="_blank"
                    title={`${this.translations.gbx_orderInformations.googleMapsLinkTitle.replace(
                      "%shopName%",
                      this.order.restaurantName
                    )}`}
                  >
                    {this.order.pickupAddress.formatted}
                  </a>
                </div>
              </div>
              {
                this.order.shopInShopChildrenOrders?.map(childOrder => {
                  return (
                  <div class="ds-order-cart-pickup-address">
                    <div class="ds-order-cart-pickup-address__shop-name">
                      {childOrder.restaurantName}
                    </div>
                    <div class="ds-order-cart-pickup-address__google-link">
                      <a
                        href={`https://www.google.fr/maps/place/${childOrder.pickupAddress.formatted}`}
                        target="_blank"
                        title={`${this.translations.gbx_orderInformations.googleMapsLinkTitle.replace(
                          "%shopName%",
                          childOrder.restaurantName
                        )}`}
                      >
                        {childOrder.pickupAddress.formatted}
                      </a>
                    </div>
                  </div>
                )})
              }
            </Fragment>
          ) : (
            <Fragment>
              <div>{this.translations.gbx_orderInformations.grocery}:</div>
              <div>{this.order.restaurantName}</div>
            </Fragment>
          )}
        </div>
      </header>
    );
  }
}
