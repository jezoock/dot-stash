import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Listen,
  Watch,
  State,
} from "@stencil/core";
import { translations } from "./translations";
import { debounce, DS_formatPrice, DS_getImage } from "../../../utils";
import { TooltipPosition } from "../../ui/tooltip/tooltip-position.enum";
// import { ShoppingBagUpdateAction } from "../../../_redux/actions/shoppingBag";

@Component({
  tag: "ds-cart-item",
  styleUrl: "cart-item.scss"
})
export class DSCartItem {

  /**
   * All product informations
   */
  @Prop() item: any;
  @Prop() itemImage: string = ""
  @Prop() locale: string = "en";
  @Prop() readonly: boolean = false;
  @Prop() isSelected: boolean;
  @Prop() toggleSelect: (productId: string) => void;
  @Prop() mode: string = "";
  @Prop() debounceDelay: number = 500;

  translations: any = translations[this.locale].ds_cart_item;

  @State() displayedPrices: any = { totalPrice: 0, oldTotalPrice: 0, discount: 0 };

  @Watch("item")
  itemWatcher() {
    this.quantityUpdateHandler(this.item.quantity);
  }

  @Event() product_modalDisplay_event: EventEmitter;
  @Event() request_quantityUpdate_event: EventEmitter;
  @Event() request_shoppingBagProductUpdate_event: EventEmitter<{ id: string; quantity: number }>;

  @Listen("notify_productQuantityInputChange_event")
  notify_productQuantityInputChange_eventHandler(ev: { stopPropagation: () => void, detail: { id: string, quantity: number }}) {
    const { quantity, id } = ev.detail;
    this.quantityUpdateDebouncedHandler(quantity);
    this.quantityUpdateHandler(quantity);
    this.request_shoppingBagProductUpdate_event.emit({ id, quantity });
  }

  constructor() {
    this.deleteButtonClickHandler = this.deleteButtonClickHandler.bind(this);
    this.productNameClickHandler = this.productNameClickHandler.bind(this);
    this.selectionHandler = this.selectionHandler.bind(this);
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

  selectionHandler() {
    this.toggleSelect(this.item.id);
  }

  /**
   * Notify when user has finished clicking on quantity component
   * @param {number} quantity: quantity
   */
  quantityUpdateDebouncedHandler = debounce((quantity: number): void => {
    this.request_quantityUpdate_event.emit({ productId: this.item.id, quantity: quantity });
  }, this.debounceDelay);

  /**
   * Call store method for cart item deletion
   */
  deleteButtonClickHandler(): void {
    this.request_quantityUpdate_event.emit({ productId: this.item.id, quantity: 0 });
  }

  /**
   * Display product details modal
   */
  productNameClickHandler(event: MouseEvent): void {
    if (this.item.system) {
      return;
    }
    event.preventDefault();

    this.product_modalDisplay_event.emit({
      prodId: this.item.refProduct,
      prodRef: this.item.refProduct,
      noPic: !!!this.item.image,
      promotionEffect: this.item.promotionEffect,
      isNew: this.item.isNew || false,
      unitPrice: this.item.unitPrice,
      unitPriceOriginal: this.item.unitPriceOriginal,
      quantityConstraint: {
        unit: this.item.quantityUnit,
        number: this.item.quantityUnitNumber,
        display: this.item.quantityDisplay
      },
      name: this.item.name,
      description: this.item.description,
      ingredients: this.item.ingredients,
      image: DS_getImage(this.item.image ? this.item.image : "unavailable", 490),
      tags: this.item.tags,
      categories: this.item.categories,
      comment: this.item.comment,
      nutritionFacts: this.item.nutritionFacts,
      isAvailable: this.item.stock > 0,
      origin: this.item.origin,
      allergens: this.item.allergens,
      stock: this.item.stock
    });
  }

  render() {
    const selectionToggleClass = {
      "ds-cart-item__toggle": true,
      "--selected": this.isSelected,
    };

    return (
      <div
        class={{
          "ds-cart-item": true,
          "--readonly": this.readonly,
          "--unavailable": !!this.item.unavailable,
          [`--${this.mode}`]: this.mode !== ""
        }}>
        <div class="ds-cart-item__firstline">
          <div class="ds-cart-item__image">
            <img
              src={this.itemImage}
              alt={this.item.name}
            />
          </div>

          <div class="ds-cart-item__name">
            {!this.readonly && this.displayedPrices.discount > 0 && (
              <div class="ds-cart-item__name-promo">
                <span>- {this.displayedPrices.discount} %</span>
              </div>
            )}
            <a
              href="#"
              onClick={this.productNameClickHandler}
            >
              {this.item.name}
            </a>
            <small>{this.item.quantityDisplay}</small>
            {this.item.locked && this.item.lockedNote && (
              <span class="ds-cart-item__locked">
                <ds-tooltip
                  icon="locked"
                  position={TooltipPosition.RIGHT}
                >
                  <div
                    slot="message"
                    class="ds-cart-item__locked-note"
                  >
                    {this.item.lockedNote}
                  </div>
                </ds-tooltip>
              </span>
            )}
            {this.item.noteToStore && (
              <p>
                <small class="ds-cart-item__note-to-store">
                  {this.item.noteToStore || ""}
                </small>
              </p>
            )}
            {(this.item.choices || []).length > 0 && (
              <div class="ds-cart-item__options">
                {this.item.choices.map(choice => {
                  return <div class="ds-cart-item__option">{choice.name}</div>;
                })}
              </div>
            )}
          </div>
        </div>
        <div class="ds-cart-item__secondline">
          {!this.readonly && (
            <div class="ds-cart-item__controls">
              <ds-product-input-quantity
                unitPrice={
                  (this.item.unitPrice || 0) > 0
                    ? this.item.unitPrice
                    : this.item.unitPriceOriginal
                }
                stock={this.item.stock}
                quantity={this.item.quantity}
                unit={this.item.quantityUnit}
                number={this.item.quantityUnitNumber}
                prodId={this.item.refProduct}
                atLeastOne={false}
                disableCartBinding={true}
              />
            </div>
          )}
          {this.readonly && (
            <div class="ds-cart-item__quantity">
              {this.item.quantity}
            </div>
          )}

          {!this.readonly && (
            <div class="ds-cart-item__promo">
              {this.item.promotionEffect && (
                <span>
                  {this.item.promotionEffect}
                </span>
              )}
            </div>
          )}

          <div class="ds-cart-item__price">
            <strong>
              {DS_formatPrice({ price: this.displayedPrices.totalPrice / 100 })}
            </strong>
            {this.displayedPrices.discount > 0 && (
              <span>
                {DS_formatPrice({ price: this.displayedPrices.oldTotalPrice / 100 })}
              </span>
            )}
          </div>
        </div>
        {!this.readonly && (
          <div class={selectionToggleClass}>
            <button
              type="button"
              onClick={this.selectionHandler}
            />
          </div>
        )}
      </div>
    );
  }
}
