import { Component, Prop, Event, EventEmitter, h, State, Listen } from "@stencil/core";
import { Cart } from "../../../../../../../../api-types";
import { Greenbox_setTranslations, Greenbox_getAppTheme } from "../../../../../../../utils";
import Fragment from "stencil-fragment";
import Translations from './translations';
import { ButtonLevel } from "../../../../../../ui/button/button-level.enum";

const componentName = "snk-store-note";

@Component({
  tag: 'snk-store-note',
  styleUrl: './store-note.scss'
})
export class SnkStoreNote {
  @Prop() note: string;
  @Prop() isCartActive: boolean;

  @State() displayStoreNotesModal: boolean = false;


  private allTranslations = {
    resto: Greenbox_setTranslations(Translations, "snk-store-note-restaurant"),
    grocery: Greenbox_setTranslations(Translations, "snk-store-note-grocery"),
  };

  private translations = this.allTranslations[Greenbox_getAppTheme()];

  @Event() request_noteUpdate_event: EventEmitter;


  @Listen('notify_noteUpdate_event')
  request_noteUpdate_eventHandler({ detail: { noteToStore } }: { detail: Pick<Cart, keyof Cart> }) {
    this.request_noteUpdate_event.emit({ noteToStore });
    this.modalDisplayHandler();
  }

  @Listen('gbxModalClose')
  gbxModalClose_eventHandler() {
    this.modalDisplayHandler();
  }


  constructor() {
    this.modalDisplayHandler = this.modalDisplayHandler.bind(this);
  }

  private modalDisplayHandler() {
    const { displayStoreNotesModal } = this;
    this.displayStoreNotesModal = !displayStoreNotesModal;
  }

  render() {
    const storeNotesAddEdit: string = this.translations[this.note?.length ? 'edit' : 'add'];

    return (
      <Fragment>

        <snk-two-columns class={componentName}>

          <gbx-icon
            class={`${componentName}__info-icon`}
            iconMods={["snack", "note"]}
            slot="first-column-content"
          />

          <div
            class={`${componentName}__notes-question-button`}
            slot="second-column-content"
          >

            <div class={`${componentName}__notes-question-container`}>

              <p class={`${componentName}__notes-question`}>
                {this.translations.notesQuestion}
              </p>
              <div class={`${componentName}__notes-container`}>
                <span class={`${componentName}__notes`}>
                  {this.note || this.translations.notesExample}
                </span>
              </div>

            </div>

            {this.isCartActive && (
              <gbx-button
                useSnack={true}
                buttonLevel={ButtonLevel.LINK}
                buttonMods={['default', 'cart-block', 'store-notes']}
                class={`${componentName}__add-edit`}
                onClick={this.modalDisplayHandler}
              >
                {storeNotesAddEdit}
              </gbx-button>
            )}

          </div>

        </snk-two-columns>

        {this.displayStoreNotesModal && (
          <snk-store-note-modal
            note={this.note}
          />
        )}

      </Fragment>
    );
  }

};
