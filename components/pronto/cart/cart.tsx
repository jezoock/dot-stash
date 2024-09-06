import { Component, h, Host, Prop, Listen } from '@stencil/core';

const { prestashop } = window as any;

@Component({
  tag: 'ds-cart',
  styleUrl: 'cart.scss'
})
export class DSCart {

  @Prop() updateUrl: string;

  promises = [];

  @Listen("quantityChange")
  quantityUpdateHandler(event: CustomEvent) {
    const { target: currentTarget, detail: { value, update } } = event;
    const requestData: any = {
      ajax: '1',
      action: 'update'
    };
    const target = (currentTarget as HTMLElement);
    const isQtyDecreased = update < 0;

    let cartActionType ='increaseProductQuantity';
    let updateUrl = target.getAttribute("data-up-url");
    
    if (isQtyDecreased) {
      cartActionType = "decreaseProductQuantity";
      updateUrl = target.getAttribute("data-down-url");
    }

    if (Math.abs(update) > 1) {
      requestData.qty = value;
      requestData.op = update > 0 ? "up" : "down";
    }

    this.abortPreviousRequests();
    $.ajax({
      url: updateUrl,
      method: 'POST',
      data: requestData,
      dataType: 'json',
      beforeSend: (jqXHR) => {
        this.promises.push(jqXHR);
      }
    }).then((resp) => {
      if (resp.quantity !== value) {
        (target as HTMLDsInputNumberElement).setValue(resp.quantity);
      }

      prestashop.emit('updateCart', {
        resp
      });
    }).fail((resp) => {
      prestashop.emit('handleError', {
        eventType: 'updateProductInCart',
        resp,
        cartAction: cartActionType
      });
    });
  }

  constructor() {
    this.quantityUpdateHandler = this.quantityUpdateHandler.bind(this);
  }

  connectedCallback() {
    
  }

  abortPreviousRequests() {
    let promise;
    while (this.promises.length > 0) {
      promise = this.promises.pop();
      promise.abort();
    }
  };

  
  
  render() {
    return (
      <Host class="ds-cart">
        <slot />
      </Host>
    );
  }
}