import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'ds-confirm-modal',
  styleUrl: 'confirm-modal.scss'
})
export class DSConfirmModal {
  translations: any;

  @Prop({ reflect: true, mutable: true }) modalTitle: string;

  @Event() cancel: EventEmitter;
  @Event() confirm: EventEmitter;

  constructor() {
    this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
    this.confirmButtonClickHandler = this.confirmButtonClickHandler.bind(this);
  }

  cancelButtonClickHandler() {
    this.cancel.emit();
  }

  confirmButtonClickHandler() {
    this.confirm.emit();
  }
  
  render() {
    return (
      <ds-mini-cart-modal
        class="ds-confirm-modal"
        modalTitle={this.modalTitle}
        isClosingDisabled={true}
      >
        <div
          slot="content"
          class="ds-confirm-modal__container"
        >

          <p class="ds-confirm-modal__message">
            <slot name="message" />
          </p>

          <ds-trigger
            class="ds-confirm-modal__confirm-button"
            mods={[ "cart-block", "checkout", "default", "label" ]}
            onClick={this.confirmButtonClickHandler}
          >
            <slot name="labelConfirmButton">
              {this.translations.button.confirm}
            </slot>
          </ds-trigger>

          <ds-trigger
            class="ds-confirm-modal__cancel-button"
            mods={[ "cart-block", "checkout", "default", "label" ]}
            onClick={this.cancelButtonClickHandler}
          >
            <slot name="labelCancelButton">
              {this.translations.button.cancel}
            </slot>
          </ds-trigger>

          
        </div>
      </ds-mini-cart-modal>
    );
  }
}