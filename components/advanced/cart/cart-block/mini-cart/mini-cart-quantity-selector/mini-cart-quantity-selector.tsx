import { Component, Prop, h, Event, EventEmitter, Listen, State, Watch } from "@stencil/core";
import { Greenbox_eventDispatch, Greenbox_setTranslations } from "../../../../../../../utils";
import { Translations } from "../../../../../../interfaces";
import { translations } from "./translations";

@Component({
  tag: 'gbx-mini-cart-quantity-selector',
  styleUrl: './mini-cart-quantity-selector.scss'
})

export class GbxMiniCartQuantitySelector {
  
  @Prop({ mutable: true }) defaultQuantity: number = 0;
  @Prop() maxQuantity: number = 0;
  @Prop() minQuantity: number = 0;
  @Prop({ mutable: true }) itemId: string;

  translations: Translations = Greenbox_setTranslations( translations, "gbx_mini_cart_quantity_selector" );

  @State() currentQuantity: number = 0;

  @Watch("defaultQuantity")
  defaultQuantityChangeHandler( newQuantity ) {
    this.currentQuantity = newQuantity;
    this.hideIncreaseButtonClickHandler();
  }

  @Event() notify_productQuantityInputChange_event: EventEmitter;

  @Listen('request_quantitySet_event')
  request_quantitySet_eventHandler({ detail: { quantity }}) {
    this.currentQuantity = quantity;
  }

  constructor() {
    this.increaseButtonClickHandler = this.increaseButtonClickHandler.bind(this);
    this.decreaseButtonClickHandler = this.decreaseButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    const { defaultQuantity } = this;
    this.currentQuantity = defaultQuantity;
  }

  componentDidLoad() {
    this.hideIncreaseButtonClickHandler();
  }

  private quantityUpdateHandler(quantityModifier: number) {
    this.currentQuantity = Math.max(this.currentQuantity + quantityModifier, this.minQuantity);
    this.hideIncreaseButtonClickHandler();

    this.notify_productQuantityInputChange_event.emit({
      quantity: this.currentQuantity,
      quantityUpdate: quantityModifier
    });
  }

  private displayToasterError() {
    Greenbox_eventDispatch(["body"], "toaster_show_event", {
      message: this.translations.outOfStock,
      type: "error",
      closingDelay: 5000,
    });
  }

  private hideIncreaseButtonClickHandler() {
    if (this.currentQuantity > 0 && this.currentQuantity === this.maxQuantity) {
      this.displayToasterError();
    }
  }

  private increaseButtonClickHandler() {
    this.quantityUpdateHandler(1);
  }

  private decreaseButtonClickHandler() {
    this.quantityUpdateHandler(-1);
  }

  render() {
    const componentClassName = "gbx-mini-cart-quantity-selector";

    return (
      <div class={componentClassName}>
        <div
          class={`${componentClassName}__button`}
          onClick={this.decreaseButtonClickHandler}
        >
          {this.currentQuantity >= 1 && (
            <gbx-button
              buttonMods={['cart-block', 'quantity', 'decrease']}
              class={`${componentClassName}__decrease-quantity`}
            />
          )}
        </div>
        
        <span class={`${componentClassName}__quantity`}>
          {this.currentQuantity}
        </span>
        
        <div
          class={`${componentClassName}__button`}
          onClick={this.increaseButtonClickHandler}
        >
          {this.currentQuantity !== this.maxQuantity && (
            <gbx-button
              class={`${componentClassName}__increase-quantity`}
              buttonMods={['cart-block', 'quantity', 'increase']}
            />
          )}
        </div>
      </div>
    );
  }
};
