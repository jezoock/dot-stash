import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { DS_getDataCy, DS_setTranslations } from '../../../../../../../utils';
import { PageName } from '../../../../../../../enums/page-name.enum';
import { Translations } from '../../../../../../interfaces';
import { ButtonLevel } from '../../../../../../ui/button/button-level.enum';
import translations from "./translations";

@Component({
  tag: 'ds-confirm-modal',
  styleUrl: 'confirm-modal.scss'
})
export class DSConfirmModal {

  translations: Translations = DS_setTranslations( translations, 'dsConfirmModal');

  @Prop({ reflect: true, mutable: true }) modalTitle: string;

  @Event() dsCancel: EventEmitter;
  @Event() dsConfirm: EventEmitter;

  constructor() {
    this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
    this.confirmButtonClickHandler = this.confirmButtonClickHandler.bind(this);
  }

  cancelButtonClickHandler() {
    this.dsCancel.emit();
  }

  confirmButtonClickHandler() {
    this.dsConfirm.emit();
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

          <ds-button
            class="ds-confirm-modal__confirm-button"
            useSnack
            buttonLevel={ButtonLevel.PRIMARY}
            buttonMods={[ "cart-block", "checkout", "default", "label" ]}
            onClick={this.confirmButtonClickHandler}
            data-cy={DS_getDataCy({
              pageName: PageName.CART,
              elementName: 'confirm'
            })}
          >
            <slot name="labelConfirmButton">
              {this.translations.button.confirm}
            </slot>
          </ds-button>

          <ds-button
            class="ds-confirm-modal__cancel-button"
            useSnack
            buttonLevel={ButtonLevel.SECONDARY}
            buttonMods={[ "cart-block", "checkout", "default", "label" ]}
            onClick={this.cancelButtonClickHandler}
            data-cy={DS_getDataCy({
              pageName: PageName.CART,
              elementName: 'cancel'
            })}
          >
            <slot name="labelCancelButton">
              {this.translations.button.cancel}
            </slot>
          </ds-button>

          
        </div>
      </ds-mini-cart-modal>
    );
  }
}