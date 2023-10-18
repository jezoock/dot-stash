import { Component, h, Prop, State, Listen } from "@stencil/core";
import { Store } from "@stencil/redux";
import { translations } from "./translations";
import { OrdersFetchAllAction } from "../../../../_redux/actions/orders";
import {Greenbox_eventDispatch, Greenbox_formatPrice, Greenbox_setTranslations} from "../../../../utils";
import dayjs from "dayjs";
import { Translations } from "../../../interfaces";

@Component({
  tag: "gbx-orders",
  styleUrl: "orders.scss"
})
export class GreenboxAccountOrder {
  @Prop({ mutable: true, reflect: true }) orderId: string = "";
  @Prop({ context: "store" }) store: Store;
  @Prop() fromCheckout: boolean;

  @State() currentPage: number = 0;
  @State() pages: number[] = [];
  @State() limitPerPage: number = 25;
  @State() settings: any;
  @State() loading: boolean = true;
  @State() orders: any[];
  @State() page: number = 1;
  @State() limit: number;
  @State() nbPages: number;
  @State() userToken: string;
  @State() isNewOrderExist: boolean = false;

  translations: Translations = Greenbox_setTranslations(translations, "gbx_accountOrder");
  OrdersFetchAllAction: typeof OrdersFetchAllAction;

  @Listen("orderDetails_request_dismissDetails_event")
  orderDetails_request_dismissDetails_eventHandler() {
    this.orderId = null;
    this.loadPage(this.page);
    Greenbox_eventDispatch(
      ["gbx-account"],
      "orders_request_accountPageDisplay_event",
      { page: "orders" }
    );
  }

  @Listen("orderDetails_notice_componentInitialized_event")
  orderDetails_notice_componentInitialized_eventHandler() {
    this.loading = false;
  }

  @Listen("orderDetails_notice_ordered_event")
  orderDetails_notice_ordered_eventHandler() {
    this.orders = null;
  }

  constructor() { }

  async componentWillLoad() {
    this.store.mapStateToProps(this, ({
      app: { settings },
      user: {
        user: { token }
      },
      orders: { orders, nbPages, page, limit, loading, isNewOrderExist }
    }) => ({
      settings,
      orders,
      nbPages,
      page,
      limit,
      loading,
      userToken: token,
      isNewOrderExist,
    }));

    this.store.mapDispatchToProps(this, {
      OrdersFetchAllAction
    });

    if ((this.orders && this.orders.length === 0 && !this.orderId) || this.isNewOrderExist) {
      await this.OrdersFetchAllAction(this.userToken, 1, this.limitPerPage);
    }
  }

  loadPage(pageNumber) {
    this.loading = true;
    this.OrdersFetchAllAction(this.userToken, pageNumber, this.limitPerPage);
  }

  getOrderDetails(orderIndex) {
    const order = this.orders[orderIndex];
    this.orderId = order.id;
    this.loading = true;
    Greenbox_eventDispatch(
      ["gbx-account"],
      "orders_request_accountPageDisplay_event",
      { page: "order" }
    );
  }

  render() {
    return (
      <div
        class={{
          "gbx-account-order": true,
          "--details-mode": this.orderId && !this.loading
        }}>

        {this.orderId ? (
          <gbx-order-details orderId={this.orderId} fromCheckout={this.fromCheckout} />
        ) : (
            <table cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th>{this.translations.table.restaurant}</th>
                  <th>
                    {this.translations.table.dropoffDeadline}
                  </th>
                  <th>{this.translations.table.number}</th>
                  <th>{this.translations.table.totalPaid}</th>
                  <th>{this.translations.table.status}</th>
                  <th>{this.translations.table.actions}</th>
                </tr>
              </thead>
              {this.nbPages > 1 && (
                <tfoot>
                  <tr>
                    <td colSpan={8}>
                      <ul class="gbx-order-pages">
                        {this.nbPages > 1 &&
                          [...Array(this.nbPages)].map((_x, i) => {
                            let currentPage = i + 1;
                            return (
                              <li
                                class={{
                                  "gbx-order-page": true,
                                  "--active": this.page == currentPage
                                }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    this.loadPage(currentPage);
                                  }}>
                                  {currentPage}
                                </button>
                              </li>
                            );
                          })}
                      </ul>
                    </td>
                  </tr>
                </tfoot>
              )}
              <tbody>
                {this.loading ? (
                  <tr>
                    <td colSpan={8}>
                      <gbx-loader />
                    </td>
                  </tr>
                ) : (
                    this.orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} class="gbx-account-order__empty">
                          {this.translations.noOrder}
                        </td>
                      </tr>
                    ) : (
                        this.orders.map((order, index) => {
                          return (
                            <tr>
                              <td class="gbx-account-order__restaurant">
                                <img
                                  src={this.settings.cdnURL + order.restaurant.logo}
                                  alt={order.restaurantName}
                                />
                                {order.restaurantName}
                              </td>
                              <td>
                                {dayjs(order.dropoffDeadline).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </td>
                              <td>{order.number}</td>
                              <td>
                                {Greenbox_formatPrice({ price: order.totalPaid })}
                              </td>
                              <td>{this.translations.status[order.status]}</td>
                              <td class="gbx-account-order__actions">
                                <button
                                  class="gbx-account-order__detail-button"
                                  onClick={evt => {
                                    evt.preventDefault();
                                    this.getOrderDetails(index);
                                  }}
                                  title={this.translations.buttons.detail}
                                >
                                </button>
                                {order.status === "complete" && (
                                  <gbx-get-invoice-button orderId={order.id} />
                                )}
                                <gbx-reorder-button
                                  storeFullUrl={order.storeFullUrl}
                                  storeId={order.restaurant.id}
                                  orderId={order.id}
                                  mode="font"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )
                  )}
              </tbody>
            </table>
          )}
      </div>
    );
  }
}
