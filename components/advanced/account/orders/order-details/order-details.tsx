import { Component, h, State, Prop, Event, EventEmitter } from "@stencil/core";
import { Store } from "@stencil/redux";
import { translations } from "./translations";
import { OrdersFetchOneAction } from "../../../../../_redux/actions/orders";
import dayjs from "dayjs";
import { Greenbox_eventDispatch, Greenbox_getAppSettings, Greenbox_setTranslations, Greenbox_triggerTrackingEvent } from '../../../../../utils';
import { Translations } from "../../../../interfaces";

@Component({
  tag: "gbx-order-details",
  styleUrls: [
    "./order-details.scss",
    "./scss/modal.scss"
  ]
})
export class GreenboxOrderDetails {
  @Prop() orderId: string = null;
  @Prop({ mutable: true }) fromCheckout: boolean = false;
  @Prop() datalayerPushed: boolean = false;
  @Prop({ context: "store" }) store: Store;

  @State() order: any = null;
  @State() status: string;
  @State() loading: boolean = true;
  @State() loadingOrderMessages: boolean = true;

  translations: Translations = Greenbox_setTranslations(translations, "gbx_orderDetails");

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
    Greenbox_eventDispatch(
      ["gbx-orders"],
      "orderDetails_request_dismissDetails_event"
    );
  }

  async trackOrder() {
    this.datalayerPushed = true;

    const { userId: customerId, locale } = Greenbox_getAppSettings();

    const orderForTracking = {
      ...this.order,
      customerId,
      locale,
      "createdAt": dayjs(this.order.createdAt).format('HH:mm'),
      "dropoffDeadline": dayjs(this.order.dropoffDeadline).format('HH:mm'),
      firstOrderForCustomer: this.order.firstOrderForCustomer?.toString(),
    };

    Greenbox_triggerTrackingEvent({ eventName: 'VIEW_ORDER_CONFIRMATION', eventDetails: orderForTracking });

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
      <div class="gbx-order-details">
        <button
          onClick={() => this.dismiss()}
          class={{
            "gbx-order-details__return": true,
            "gbx-button": true,
            "--back": true
          }}>
          {this.translations.buttons.back}
        </button>
        {!this.loading && this.order && (
          <div class="gbx-order-details__content">
            <div class="gbx-order-details__top-content">
              <div class="gbx-order-details__steps">
                <gbx-order-step
                  status={this.order.status}
                  takeaway={this.order.takeaway}
                />
              </div>
              <div class="gbx-order-details__informations">
                <gbx-order-informations order={this.order} />
              </div>
            </div>
            {!this.loading && this.order.takeawayCode && (
              <div class="gbx-order-details__takeaway-label">
                {this.translations.cart.header.takeawayCode} <span class="gbx-order-details__takeaway-code"> {this.order.takeawayCode}</span>
              </div>
            )}
            <div class="gbx-order-details__bottom-content">
              <div class="gbx-order-details__cart">
                <gbx-order-cart order={this.order} />
              </div>
              <div class="gbx-order-details__messages">
                {!this.loadingOrderMessages && (
                  <gbx-order-messages
                    status={this.order.status}
                    orderId={this.order.id}
                    messages={this.order.messages}
                  />
                )}
                {this.loadingOrderMessages && (
                  <gbx-loader
                    message={this.translations.loading}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {this.loading && (
          <gbx-loader message={this.translations.loading} />
        )}
      </div>
    );
  }
}
