import { Component, h, State, Prop, Event, EventEmitter } from "@stencil/core";
import { Store } from "@stencil/redux";
import { translations } from "./translations";
import { OrdersFetchOneAction } from "../../../../../_redux/actions/orders";
import dayjs from "dayjs";
import { DS_eventDispatch, DS_getAppSettings, DS_setTranslations, DS_triggerTrackingEvent } from '../../../../../utils';
import { Translations } from "../../../../interfaces";

@Component({
  tag: "ds-order-details",
  styleUrls: [
    "./order-details.scss",
    "./scss/modal.scss"
  ]
})
export class DSOrderDetails {
  @Prop() orderId: string = null;
  @Prop({ mutable: true }) fromCheckout: boolean = false;
  @Prop() datalayerPushed: boolean = false;
  @Prop({ context: "store" }) store: Store;

  @State() order: any = null;
  @State() status: string;
  @State() loading: boolean = true;
  @State() loadingOrderMessages: boolean = true;

  translations: Translations = DS_setTranslations(translations, "ds_orderDetails");

  @Event() orderDetails_request_dismissDetails_event: EventEmitter;
  @Event() orderDetails_notice_componentInitialized_event: EventEmitter;

  OrdersFetchOneAction: typeof OrdersFetchOneAction;

  constructor() { }

  componentWillLoad() {
    this.store.mapStateToProps(this, ({
      orders: { order, loading, loadingOrderMessages },
    }) => ({
      loadingOrderMessages,
      loading,
      order,
    }));

    this.store.mapDispatchToProps(this, {
      OrdersFetchOneAction,
    });
    this.OrdersFetchOneAction(this.orderId);
  }

  componentDidLoad() {
    this.orderDetails_notice_componentInitialized_event.emit();
  }

  componentWillRender() {
    if (!this.loading && this.order && this.fromCheckout && !this.datalayerPushed) {
      this.trackOrder();
    }
  }

  dismiss() {
    DS_eventDispatch(
      ["ds-orders"],
      "orderDetails_request_dismissDetails_event"
    );
  }

  async trackOrder() {
    this.datalayerPushed = true;

    const { userId: customerId, locale } = DS_getAppSettings();

    const orderForTracking = {
      ...this.order,
      customerId,
      locale,
      "createdAt": dayjs(this.order.createdAt).format('HH:mm'),
      "dropoffDeadline": dayjs(this.order.dropoffDeadline).format('HH:mm'),
      firstOrderForCustomer: this.order.firstOrderForCustomer?.toString(),
    };

    DS_triggerTrackingEvent({ eventName: 'VIEW_ORDER_CONFIRMATION', eventDetails: orderForTracking });

    /* TO KEEP - Need confirmation conversion will still be handled by gtm before removing */
    /* if (typeof window.gtag === 'function' && typeof window.GOOGLE_ADWORDS_ID !== 'undefined' && typeof window.GOOGLE_ADWORDS_LABEL !== 'undefined') {
      DataLayer.triggerGtagEvent('conversion', {
        'send_to': window.GOOGLE_ADWORDS_ID + '/' + window.GOOGLE_ADWORDS_LABEL,
        'value': this.order.totalPaid,
        'currency': this.order.currency.toUpperCase()
      });
    } */
  }

  render() {
    return (
      <div class="ds-order-details">
        <button
          onClick={() => this.dismiss()}
          class={{
            "ds-order-details__return": true,
            "ds-button": true,
            "--back": true
          }}>
          {this.translations.buttons.back}
        </button>
        {!this.loading && this.order && (
          <div class="ds-order-details__content">
            <div class="ds-order-details__top-content">
              <div class="ds-order-details__steps">
                <ds-order-step
                  status={this.order.status}
                  takeaway={this.order.takeaway}
                />
              </div>
              <div class="ds-order-details__informations">
                <ds-order-informations order={this.order} />
              </div>
            </div>
            {!this.loading && this.order.takeawayCode && (
              <div class="ds-order-details__takeaway-label">
                {this.translations.cart.header.takeawayCode} <span class="ds-order-details__takeaway-code"> {this.order.takeawayCode}</span>
              </div>
            )}
            <div class="ds-order-details__bottom-content">
              <div class="ds-order-details__cart">
                <ds-order-cart order={this.order} />
              </div>
              <div class="ds-order-details__messages">
                {!this.loadingOrderMessages && (
                  <ds-order-messages
                    status={this.order.status}
                    orderId={this.order.id}
                    messages={this.order.messages}
                  />
                )}
                {this.loadingOrderMessages && (
                  <ds-loader
                    message={this.translations.loading}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {this.loading && (
          <ds-loader message={this.translations.loading} />
        )}
      </div>
    );
  }
}
