import { Component, Prop, h, Event, EventEmitter, Listen, State, Watch } from "@stencil/core";

@Component({
  tag: 'ds-mini-cart-quantity-selector',
  styleUrl: './mini-cart-quantity-selector.scss'
})

export class DSMiniCartQuantitySelector {
  
  @Prop({ mutable: true }) defaultQuantity = 0;
  @Prop() maxQuantity = 0;
  @Prop() minQuantity = 0;
  @Prop({ mutable: true }) itemId: string;

  translations: any;

  @State() currentQuantity = 0;

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
    /* DS_eventDispatch(["body"], "toaster_show_event", {
      message: this.translations.outOfStock,
      type: "error",
      closingDelay: 5000,
    }); */
    console.log("erro");
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
    const componentClassName = "ds-mini-cart-quantity-selector";

    return (
      <div class={componentClassName}>
        <div
          class={`${componentClassName}__button`}
          onClick={this.decreaseButtonClickHandler}
        >
          {this.currentQuantity >= 1 && (
            <ds-trigger
              mods={['cart-block', 'quantity', 'decrease']}
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
            <ds-trigger
              class={`${componentClassName}__increase-quantity`}
              mods={['cart-block', 'quantity', 'increase']}
            />
          )}
        </div>
      </div>
    );
  }
}
