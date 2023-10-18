import { Component, Event, EventEmitter, h, Prop, State, Watch } from '@stencil/core';
import { translations } from "./translations";
import { Greenbox_formatPrice, Greenbox_isMobile, Greenbox_setTranslations } from "../../../../utils";
import { TooltipPosition } from "../../../ui/tooltip/tooltip-position.enum";

@Component({
  tag: 'gbx-cart-summary',
  styleUrls: [
    'scss/cart-summary.scss',
    'scss/prices-block.scss',
    'scss/tooltip.scss',
    'scss/button.scss',
    'scss/loader.scss'
  ]
})
export class GreenboxCartSummary {
  /**
   * @type {any} Cart informations
   */
  @Prop() public cart: any = {};
  /**
   * @type {any} Request edit cart method
   */
  @Prop() public requestEditCart: any;
  @Prop({reflect: true}) public extraAuthorization: number = 0;
  @Prop({reflect: true}) public isDatatransEnabled: boolean = false;

  @State() private isWalletRemoved: boolean = false;
  @State() private voucherStates: any = [];

  private translations: any;

  @Event() private request_voucherRemove_event: EventEmitter;
  @Event() private request_walletRemove_event: EventEmitter;

  @Watch("cart")
  cartWatcher() {
    if (this.cart) {
      this.isWalletRemoved = this.cart.totalWalletUsage === 0;
      if (this.cart.vouchers) {
        this.voucherStates = this.cart.vouchers.map((voucher) => {
          return {
            isRemoved: false,
            code: voucher.code
          };
        });
      }
    }
  }

  constructor() {
    this.removeVoucherButtonClickHandler = this.removeVoucherButtonClickHandler.bind(this);
    this.removeWalletButtonClickHandler = this.removeWalletButtonClickHandler.bind(this);
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);

    this.translations = this.translations = Greenbox_setTranslations(translations, ['gbx_cartSummary']);
  }

  /**
   * Remove the voucher from click button
   * @param {{code, freeDelivery, id, includeDelivery, storeCharge, discount}} voucher
   */
  removeVoucherButtonClickHandler(voucher): void {
    const button = document.querySelector(`#voucher-${voucher.code}`) as HTMLButtonElement;
    if (button) {
      voucher.isDisabled = true;
      const voucherStates = [];
      this.voucherStates.map((v) => {
        const newVoucher = { ...voucher };
        newVoucher.isRemoved = v.code === voucher.code;
        voucherStates.push(newVoucher);
      });
      this.voucherStates = voucherStates;
      this.request_voucherRemove_event.emit(voucher);
    }
  }

  /**
   * Remove the wallet from clikc button
   */
  removeWalletButtonClickHandler(): void {
    const button = document.querySelector(`#wallet-button`) as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      this.isWalletRemoved = true;
      this.request_walletRemove_event.emit();
    }
  }

  /**
   * Handle the edit button by a click
   */
  handleEditButtonClick(): void {
    this.requestEditCart();
  }

  /**
   * Display small fee
   */
   isSmallFeeShown(): boolean {
    return (
      this.cart?.fees &&
      this.cart.fees.smallFee > 0 &&
      this.cart.totalProducts < this.cart.fees.minTotalProducts
    );
  }

  /**
   * Render the cart summary
   */
  renderCartSummary() {
    let totalOrder;
    if (this.extraAuthorization > 0 && this.isDatatransEnabled) {
      totalOrder = Math.round((this.cart.totalOrder * ((100 + this.extraAuthorization) / 100))) / 100;
    } else {
      totalOrder = this.cart.totalOrder / 100;
    }

    const amount = this.cart.tips?.driver?.amount || null;
    return (
      <div>
        <div class="gbx-cart-summary__products">
          {this.cart.products.length !== 0
            ? (
              <ul>
                {this.cart.products.map(product => {
                  return (
                    <li class="gbx-price-row">
                      <span>{product.quantity} x {product.name}</span>
                      <strong>{Greenbox_formatPrice({ price: product.totalPrice / 100, isFrCurrency: true })}</strong>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{this.translations.emptyCart}</p>
            )}
        </div>

        <footer class="gbx-cart-summary__footer">
          <ul class="gbx-cart-summary__sub-total">
            <li class="gbx-price-row --sub-total">
              <span>{this.translations.subTotal}</span>
              <strong>{Greenbox_formatPrice({ price: this.cart.totalProducts / 100, isFrCurrency: true })}</strong>
            </li>

            <li class="gbx-price-row --sub-total">
              <gbx-button buttonMods={["checkout", "link", "underline", "no-padding"]}>
                <gbx-tooltip position={TooltipPosition[Greenbox_isMobile() ? "TOP" : "RIGHT"]}>
                  <span>{this.translations.deliveryFee}</span>
                  <div slot="message">{this.translations.deliveryFeeMessage}</div>
                </gbx-tooltip>
              </gbx-button>
              <strong>
                {Greenbox_formatPrice({
                  price: (this.isSmallFeeShown() && !isNaN(this.cart.fees.shipping) ? this.cart.fees.shipping : this.cart.totalShipping) / 100,
                  isFrCurrency: true,
                })}
              </strong>
            </li>

            {this.cart?.serviceFee > 0 && !isNaN(this.cart.serviceFee) && (
              <li class="gbx-price-row --sub-total">
                <span>
                  {this.translations.serviceFee}
                  <gbx-tooltip
                    icon="info"
                    position={TooltipPosition[Greenbox_isMobile() ? "TOP" : "RIGHT"]}
                  >
                    <div slot="message">
                      {this.translations.serviceFeeMessage}
                    </div>
                  </gbx-tooltip>
                </span>
                <strong>{Greenbox_formatPrice({ price: this.cart.serviceFee / 100, isFrCurrency: true })}</strong>
              </li>
            )}

            {this.isSmallFeeShown() && !isNaN(this.cart.fees.smallFee) && (
              <li class="gbx-price-row --sub-total">
                <span>
                  {this.translations.smallFee}
                  <gbx-tooltip
                    icon="info"
                    position={TooltipPosition[Greenbox_isMobile() ? "TOP" : "RIGHT"]}
                  >
                    <div slot="message">
                      {this.translations.smallFeeMessage}
                    </div>
                  </gbx-tooltip>
                </span>
                <strong>
                  {Greenbox_formatPrice({
                    price: this.cart.fees.smallFee / 100,
                    isFrCurrency: true,
                  })}
                </strong>
              </li>
            )}

            {amount && (
              <li class="gbx-price-row --sub-total">
                <span>{this.translations.driverTipsCart}</span>
                <strong>{Greenbox_formatPrice({ price: amount / 100, isFrCurrency: true })}</strong>
              </li>
            )}

            {((this.voucherStates && this.voucherStates.length > 0) || (this.cart.totalWalletUsage > 0)) && <hr />}

            {this.cart.vouchers.map((voucher, index) => {
              return (
                <li class={{
                  "gbx-price-row": true,
                  "--sub-total": true
                }}>
                  <span>
                    {voucher.code}
                    {this.voucherStates[index] && this.voucherStates[index].isRemoved ? (
                      <gbx-loader
                        mode={["inline", "bold"]}
                        id={`loader-voucher-${voucher.code}`}
                        class="gbx-cart-summary__loader"
                      />
                    ) : (
                      <button
                        class={{
                          "gbx-button": true,
                          "--remove": true
                        }}
                        id={`voucher-${voucher.code}`}
                        onClick={() => {
                          this.removeVoucherButtonClickHandler(voucher);
                        }}
                      />
                    )}
                  </span>
                  <strong>{Greenbox_formatPrice({ price: (-1 * voucher.discount) / 100, isFrCurrency: true })} </strong>
                </li>
              );
            })}

            {this.cart.totalWalletUsage > 0 && (
              <li class="gbx-price-row">
                <span>
                  {this.translations.wallet}
                  {!this.isWalletRemoved && (
                    <button
                      class={{
                        "gbx-button": true,
                        "--remove": true
                      }}
                      id="wallet-button"
                      onClick={this.removeWalletButtonClickHandler}
                    />
                  )}
                  {this.isWalletRemoved && (
                    <gbx-loader
                      mode={["inline", "bold"]}
                      class="gbx-cart-summary__loader"
                    />
                  )}
                </span>
                <strong>{Greenbox_formatPrice({ price: (-1 * this.cart.totalWalletUsage) / 100, isFrCurrency: true })}</strong>
              </li>
            )}
          </ul>

          <hr />

          <div class="gbx-cart-summary__total">
            <ul>
              <li class="gbx-price-row --total">
                {this.extraAuthorization > 0 && this.isDatatransEnabled ? (
                  <span>
                    {this.translations.estimatedTotalOrder}
                    <gbx-tooltip icon="info" position={Greenbox_isMobile() ? TooltipPosition.TOP : TooltipPosition.RIGHT}>
                      <div slot="message">{this.translations.preAuthorization}</div>
                    </gbx-tooltip>
                  </span>
                ) : (
                  <span>
                    {this.translations.totalOrder}
                  </span>
                )}
                <strong>{Greenbox_formatPrice({ price: totalOrder, isFrCurrency: true })}</strong>
              </li>
            </ul>
          </div>

          <gbx-cart-deadline />
        </footer>
      </div>
    );
  }

  render() {
    return (
      <div class={{ "gbx-cart-summary": true }}>
        <header class="gbx-cart-summary__header">
          <strong>{this.translations.title}</strong>
          <gbx-button
            buttonMods={["link", "checkout"]}
            buttonType="button"
            onClick={this.handleEditButtonClick}
          >
            {this.translations.edit}
          </gbx-button>
        </header>

        <div class="gbx-cart-summary__content">
          {this.cart.products && this.cart.products.length > 0
            ? this.renderCartSummary()
            : (
              <gbx-loader
                mode={["inline", "bold"]}
                class={{
                  "gbx-cart-summary__loader": true,
                  "--global": true
                }}
              />
            )
          }
        </div>
      </div>
    );
  }
}
