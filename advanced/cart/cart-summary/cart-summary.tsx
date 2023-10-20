import { Component, Event, EventEmitter, h, Prop, State, Watch } from '@stencil/core';
import { translations } from "./translations";
import { DS_formatPrice, DS_isMobile, DS_setTranslations } from "../../../../utils";
import { TooltipPosition } from "../../../ui/tooltip/tooltip-position.enum";

@Component({
  tag: 'ds-cart-summary',
  styleUrls: [
    'scss/cart-summary.scss',
    'scss/prices-block.scss',
    'scss/tooltip.scss',
    'scss/button.scss',
    'scss/loader.scss'
  ]
})
export class DSCartSummary {
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

    this.translations = this.translations = DS_setTranslations(translations, ['ds_cartSummary']);
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
        <div class="ds-cart-summary__products">
          {this.cart.products.length !== 0
            ? (
              <ul>
                {this.cart.products.map(product => {
                  return (
                    <li class="ds-price-row">
                      <span>{product.quantity} x {product.name}</span>
                      <strong>{DS_formatPrice({ price: product.totalPrice / 100, isFrCurrency: true })}</strong>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{this.translations.emptyCart}</p>
            )}
        </div>

        <footer class="ds-cart-summary__footer">
          <ul class="ds-cart-summary__sub-total">
            <li class="ds-price-row --sub-total">
              <span>{this.translations.subTotal}</span>
              <strong>{DS_formatPrice({ price: this.cart.totalProducts / 100, isFrCurrency: true })}</strong>
            </li>

            <li class="ds-price-row --sub-total">
              <ds-button buttonMods={["checkout", "link", "underline", "no-padding"]}>
                <ds-tooltip position={TooltipPosition[DS_isMobile() ? "TOP" : "RIGHT"]}>
                  <span>{this.translations.deliveryFee}</span>
                  <div slot="message">{this.translations.deliveryFeeMessage}</div>
                </ds-tooltip>
              </ds-button>
              <strong>
                {DS_formatPrice({
                  price: (this.isSmallFeeShown() && !isNaN(this.cart.fees.shipping) ? this.cart.fees.shipping : this.cart.totalShipping) / 100,
                  isFrCurrency: true,
                })}
              </strong>
            </li>

            {this.cart?.serviceFee > 0 && !isNaN(this.cart.serviceFee) && (
              <li class="ds-price-row --sub-total">
                <span>
                  {this.translations.serviceFee}
                  <ds-tooltip
                    icon="info"
                    position={TooltipPosition[DS_isMobile() ? "TOP" : "RIGHT"]}
                  >
                    <div slot="message">
                      {this.translations.serviceFeeMessage}
                    </div>
                  </ds-tooltip>
                </span>
                <strong>{DS_formatPrice({ price: this.cart.serviceFee / 100, isFrCurrency: true })}</strong>
              </li>
            )}

            {this.isSmallFeeShown() && !isNaN(this.cart.fees.smallFee) && (
              <li class="ds-price-row --sub-total">
                <span>
                  {this.translations.smallFee}
                  <ds-tooltip
                    icon="info"
                    position={TooltipPosition[DS_isMobile() ? "TOP" : "RIGHT"]}
                  >
                    <div slot="message">
                      {this.translations.smallFeeMessage}
                    </div>
                  </ds-tooltip>
                </span>
                <strong>
                  {DS_formatPrice({
                    price: this.cart.fees.smallFee / 100,
                    isFrCurrency: true,
                  })}
                </strong>
              </li>
            )}

            {amount && (
              <li class="ds-price-row --sub-total">
                <span>{this.translations.driverTipsCart}</span>
                <strong>{DS_formatPrice({ price: amount / 100, isFrCurrency: true })}</strong>
              </li>
            )}

            {((this.voucherStates && this.voucherStates.length > 0) || (this.cart.totalWalletUsage > 0)) && <hr />}

            {this.cart.vouchers.map((voucher, index) => {
              return (
                <li class={{
                  "ds-price-row": true,
                  "--sub-total": true
                }}>
                  <span>
                    {voucher.code}
                    {this.voucherStates[index] && this.voucherStates[index].isRemoved ? (
                      <ds-loader
                        mode={["inline", "bold"]}
                        id={`loader-voucher-${voucher.code}`}
                        class="ds-cart-summary__loader"
                      />
                    ) : (
                      <button
                        class={{
                          "ds-button": true,
                          "--remove": true
                        }}
                        id={`voucher-${voucher.code}`}
                        onClick={() => {
                          this.removeVoucherButtonClickHandler(voucher);
                        }}
                      />
                    )}
                  </span>
                  <strong>{DS_formatPrice({ price: (-1 * voucher.discount) / 100, isFrCurrency: true })} </strong>
                </li>
              );
            })}

            {this.cart.totalWalletUsage > 0 && (
              <li class="ds-price-row">
                <span>
                  {this.translations.wallet}
                  {!this.isWalletRemoved && (
                    <button
                      class={{
                        "ds-button": true,
                        "--remove": true
                      }}
                      id="wallet-button"
                      onClick={this.removeWalletButtonClickHandler}
                    />
                  )}
                  {this.isWalletRemoved && (
                    <ds-loader
                      mode={["inline", "bold"]}
                      class="ds-cart-summary__loader"
                    />
                  )}
                </span>
                <strong>{DS_formatPrice({ price: (-1 * this.cart.totalWalletUsage) / 100, isFrCurrency: true })}</strong>
              </li>
            )}
          </ul>

          <hr />

          <div class="ds-cart-summary__total">
            <ul>
              <li class="ds-price-row --total">
                {this.extraAuthorization > 0 && this.isDatatransEnabled ? (
                  <span>
                    {this.translations.estimatedTotalOrder}
                    <ds-tooltip icon="info" position={DS_isMobile() ? TooltipPosition.TOP : TooltipPosition.RIGHT}>
                      <div slot="message">{this.translations.preAuthorization}</div>
                    </ds-tooltip>
                  </span>
                ) : (
                  <span>
                    {this.translations.totalOrder}
                  </span>
                )}
                <strong>{DS_formatPrice({ price: totalOrder, isFrCurrency: true })}</strong>
              </li>
            </ul>
          </div>

          <ds-cart-deadline />
        </footer>
      </div>
    );
  }

  render() {
    return (
      <div class={{ "ds-cart-summary": true }}>
        <header class="ds-cart-summary__header">
          <strong>{this.translations.title}</strong>
          <ds-button
            buttonMods={["link", "checkout"]}
            buttonType="button"
            onClick={this.handleEditButtonClick}
          >
            {this.translations.edit}
          </ds-button>
        </header>

        <div class="ds-cart-summary__content">
          {this.cart.products && this.cart.products.length > 0
            ? this.renderCartSummary()
            : (
              <ds-loader
                mode={["inline", "bold"]}
                class={{
                  "ds-cart-summary__loader": true,
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
