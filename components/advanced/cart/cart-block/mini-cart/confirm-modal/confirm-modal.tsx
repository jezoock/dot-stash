import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Greenbox_getDataCy, Greenbox_setTranslations } from '../../../../../../../utils';
import { PageName } from '../../../../../../../enums/page-name.enum';
import { Translations } from '../../../../../../interfaces';
import { ButtonLevel } from '../../../../../../ui/button/button-level.enum';
import translations from "./translations";

@Component({
  tag: 'snk-confirm-modal',
  styleUrl: 'confirm-modal.scss'
})
export class SNKConfirmModal {

  translations: Translations = Greenbox_setTranslations( translations, 'snkConfirmModal');

  @Prop({ reflect: true, mutable: true }) modalTitle: string;

  @Event() snkCancel: EventEmitter;
  @Event() snkConfirm: EventEmitter;

  constructor() {
    this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
    this.confirmButtonClickHandler = this.confirmButtonClickHandler.bind(this);
  }

  cancelButtonClickHandler() {
    this.snkCancel.emit();
  }

  confirmButtonClickHandler() {
    this.snkConfirm.emit();
  }
  
  render() {
    return (
      <snk-mini-cart-modal
        class="snk-confirm-modal"
        modalTitle={this.modalTitle}
        isClosingDisabled={true}
      >
        <div
          slot="content"
          class="snk-confirm-modal__container"
        >

          <p class="snk-confirm-modal__message">
            <slot name="message" />
          </p>

          <gbx-button
            class="snk-confirm-modal__confirm-button"
            useSnack
            buttonLevel={ButtonLevel.PRIMARY}
            buttonMods={[ "cart-block", "checkout", "default", "label" ]}
            onClick={this.confirmButtonClickHandler}
            data-cy={Greenbox_getDataCy({
              pageName: PageName.CART,
              elementName: 'confirm'
            })}
          >
            <slot name="labelConfirmButton">
              {this.translations.button.confirm}
            </slot>
          </gbx-button>

          <gbx-button
            class="snk-confirm-modal__cancel-button"
            useSnack
            buttonLevel={ButtonLevel.SECONDARY}
            buttonMods={[ "cart-block", "checkout", "default", "label" ]}
            onClick={this.cancelButtonClickHandler}
            data-cy={Greenbox_getDataCy({
              pageName: PageName.CART,
              elementName: 'cancel'
            })}
          >
            <slot name="labelCancelButton">
              {this.translations.button.cancel}
            </slot>
          </gbx-button>

          
        </div>
      </snk-mini-cart-modal>
    );
  }
}