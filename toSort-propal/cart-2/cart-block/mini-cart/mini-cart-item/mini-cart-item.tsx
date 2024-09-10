import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Listen,
  Watch,
  State
} from "@stencil/core";
import debounce from "../../../../../../typescript/debounce";
import { TooltipPosition } from "../../../../..";

const componentName = "ds-mini-cart-item";
const DS_formatPrice = (params: any) => { console.log(params)}
@Component({
  tag: "ds-mini-cart-item",
  styleUrl: "mini-cart-item.scss"
})
export class DSMiniCartItem {

  @Prop({ mutable: true }) item: any;
  @Prop({ mutable: true }) readonly = false;
  @Prop({ mutable: true, reflect: true }) debounceDelay = 250;
  @Prop() isCartActive: boolean;

  translations: any;

  @State() displayedPrices: any = { totalPrice: 0, oldTotalPrice: 0, discount: 0 };

  @Watch("item")
  itemWatcher() {
    this.quantityUpdateHandler(this.item.quantity);
  }

  @Event() request_quantityUpdate_event: EventEmitter;
  @Event() request_productEditModalDisplay_event: EventEmitter;

  @Listen("notify_productQuantityInputChange_event")
  notify_productQuantityInputChange_eventHandler({ detail: { quantity } }) {
    if(quantity == 0){
      this.item.quantity = quantity;
    }
    this.quantityUpdateHandler(quantity);
    this.quantityUpdateDebouncedHandler(quantity);
  }

  @Listen("request_productPriceUpdate_event")
  request_productPriceUpdate_eventHandler({ detail: { quantity } }) {
    this.quantityUpdateHandler(quantity);
  }

  constructor() {
    this.productNameClickHandler = this.productNameClickHandler.bind(this);
    this.modifyButtonClickHandler = this.modifyButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    // Used to initialize displayed prices
    this.quantityUpdateHandler(this.item.quantity);
  }

  /**
   * Update item prices based on quantity argument
   * @param {number} quantity New quantity used to render prices
   */
  quantityUpdateHandler(quantity: number): void {
    const prices = {
      totalPrice: (this.item.unitPrice * quantity) / this.item.quantityUnitNumber,
      oldTotalPrice: ((this.item.unitPriceOriginal || 0) * quantity) / this.item.quantityUnitNumber,
      discount: 0
    };

    prices.discount = prices.totalPrice < prices.oldTotalPrice
      ? Math.round(100 - (prices.totalPrice * 100) / prices.oldTotalPrice)
      : 0;

    this.displayedPrices = { ...prices };
  }

  /**
   * Notify when user has finished clicking on quantity component
   * @param {number} quantity: quantity
   */
  quantityUpdateDebouncedHandler = debounce((quantity: number): void => {
    const quantityUpdate = quantity - this.item.quantity;

    this.request_quantityUpdate_event.emit({
      id: this.item.id,
      ref: this.item.refProduct,
      quantity,
      quantityUpdate,
      combinationChoices: this.item.combinationChoices || []
    });
  }, this.debounceDelay);

  /**
   * Display product details modal
   */
  productNameClickHandler(event: MouseEvent): void {
    if (this.item.system) {
      return;
    }
    event.preventDefault();
    this.request_productEditModalDisplay_event.emit({ product: this.item });
  }

  modifyButtonClickHandler() {
    this.request_productEditModalDisplay_event.emit({ product: this.item });
  }

  render() {
    const hasDiscount = this.item.totalPrice < this.item.totalPriceOriginal;
    const hasCombinations = this.item.combinationChoices?.length > 0;

    return (
      <div class={{
        [componentName]: true,
        '--has-discount': hasDiscount
      }}>

        <div class={`${componentName}__quantity`}>
          {this.item.quantity} x
        </div>

        <div class={`${componentName}__infos`}>

          <div class={`${componentName}__name`}>
            {this.item.name}
            {this.item.locked && (
              <ds-tooltip
                class={{
                  [`${componentName}__lock`]: true,
                  "--is-inactive": !this.isCartActive,
                }}
                position={TooltipPosition.TOP}
                icon="lock"
                containerSelector=".ds-mini-cart__body"
              >
                {this.isCartActive && (
                  <div slot="message">
                    {this.translations.frozenProductsAdded}
                  </div>
                )}
              </ds-tooltip>
            )}
          </div>

          {!!this.item.quantityDisplay && (
            <div class={`${componentName}__quantity-display`}>
              {this.item.quantityDisplay}
            </div>
          )}

          {hasCombinations && (
            <ds-mini-cart-item-combinations combinations={this.item.combinationChoices} />
          )}

          <div class={`${componentName}__pricing`}>
            {!this.item.isOffered && (
              <span class={`${componentName}__current-price`}>
                {DS_formatPrice({
                  price: this.displayedPrices.totalPrice,
                  currency: false,
                  cents: true
                })}
              </span>
            )}

            {(hasDiscount || this.item.isOffered) && (
              <strong class={`${componentName}__old-price`}>
                {DS_formatPrice({
                  price: this.displayedPrices.oldTotalPrice,
                  currency: false,
                  cents: true
                })}
              </strong>
            )}
          </div>

          {this.item.isOffered && (
            <p class={`${componentName}__offered-item`}>
              {this.translations.oneBoughtOneOffered}
            </p>
          )}

          {!this.item.locked && this.isCartActive && !this.item.isOffered && (
            <div class={`${componentName}__actions`}>
              <ds-trigger
                
                type="link"
                class={{
                  [`${componentName}__edit-link`]: true,
                  '--hidden': !hasCombinations
                }}
                mods={['default', 'cart-block', 'edit', 'small']}
                onClick={this.modifyButtonClickHandler}
              >
                {this.translations.edit}
              </ds-trigger>
              <ds-mini-cart-quantity-selector
                class={`${componentName}__quantity-selector`}
                defaultQuantity={this.item.quantity}
                maxQuantity={this.item.stock}
              />
            </div>
          )}

        </div>
      </div>
    );
  }
}
