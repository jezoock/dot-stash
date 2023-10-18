import { Component, h, Prop, State, Listen } from "@stencil/core";

@Component({
  tag: "ds-orders",
  styleUrl: "orders.scss"
})
export class DSAccountOrder {
  @Prop({ mutable: true, reflect: true }) orderId = "";
  @Prop() fromCheckout: boolean;

  @State() currentPage = 0;
  @State() pages: number[] = [];
  @State() limitPerPage = 25;
  @State() settings: any;
  @State() loading = true;
  @State() orders: any[];
  @State() page = 1;
  @State() limit: number;
  @State() nbPages: number;
  @State() userToken: string;
  @State() isNewOrderExist = false;


  @Listen("orderDetails_request_dismissDetails_event")
  orderDetails_request_dismissDetails_eventHandler() {
    this.orderId = null;
    this.loadPage(this.page);
    /* DS_eventDispatch(
      ["ds-account"],
      "orders_request_accountPageDisplay_event",
      { page: "orders" }
    ); */
  }

  @Listen("orderDetails_notice_componentInitialized_event")
  orderDetails_notice_componentInitialized_eventHandler() {
    this.loading = false;
  }

  @Listen("orderDetails_notice_ordered_event")
  orderDetails_notice_ordered_eventHandler() {
    this.orders = null;
  }


  loadPage(pageNumber) {
    this.loading = true;
    /* this.OrdersFetchAllAction(this.userToken, pageNumber, this.limitPerPage); */
  }

  getOrderDetails(orderIndex) {
    const order = this.orders[orderIndex];
    this.orderId = order.id;
    this.loading = true;
    /* DS_eventDispatch(
      ["ds-account"],
      "orders_request_accountPageDisplay_event",
      { page: "order" }
    ); */
  }

  render() {
    return (
      <div
        class={{
          "ds-account-order": true,
          "--details-mode": this.orderId && !this.loading
        }}>

        {this.orderId ? (
          <ds-order-details orderId={this.orderId} fromCheckout={this.fromCheckout} />
        ) : (
            <table cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th>{"this.translations.table.restaurant"}</th>
                  <th>
                    {"this.translations.table.dropoffDeadline"}
                  </th>
                  <th>{"this.translations.table.number"}</th>
                  <th>{"this.translations.table.totalPaid"}</th>
                  <th>{"this.translations.table.status"}</th>
                  <th>{"this.translations.table.actions"}</th>
                </tr>
              </thead>
              {this.nbPages > 1 && (
                <tfoot>
                  <tr>
                    <td colSpan={8}>
                      <ul class="ds-order-pages">
                        {this.nbPages > 1 &&
                          [...Array(this.nbPages)].map((_x, i) => {
                            const currentPage = i + 1;
                            return (
                              <li
                                class={{
                                  "ds-order-page": true,
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
                      <ds-loader />
                    </td>
                  </tr>
                ) : (
                    this.orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} class="ds-account-order__empty">
                          {"this.translations.noOrder"}
                        </td>
                      </tr>
                    ) : (
                        this.orders.map((order, index) => {
                          return (
                            <tr>
                              <td class="ds-account-order__restaurant">
                                <img
                                  src={this.settings.cdnURL + order.restaurant.logo}
                                  alt={order.restaurantName}
                                />
                                {order.restaurantName}
                              </td>
                              <td>
                                {"dayjs(order.dropoffDeadline).format('DD/MM/YYYY HH:mm')"}
                              </td>
                              <td>{order.number}</td>
                              <td>
                                {"DS_formatPrice({ price: order.totalPaid })"}
                              </td>
                              <td>{"this.translations.status[order.status]"}</td>
                              <td class="ds-account-order__actions">
                                <button
                                  class="ds-account-order__detail-button"
                                  onClick={evt => {
                                    evt.preventDefault();
                                    this.getOrderDetails(index);
                                  }}
                                  title={"this.translations.buttons.detail"}
                                >
                                </button>
                                {order.status === "complete" && (
                                  <ds-get-invoice-button orderId={order.id} />
                                )}
                                <ds-reorder-button
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
