import { Prop, h, Component, Event, EventEmitter } from "@stencil/core";
import { Cart } from "../../../../../../../../api-types";
import { DS_getDataCy, DS_setTranslations } from "../../../../../../../utils";
import { PageName } from "../../../../../../../enums/page-name.enum";
import { EventDetails } from "../../../../../../interfaces";
import { ButtonLevel } from "../../../../../../ui/button/button-level.enum";
import componentName from "./component-name";
import Translations from './translations';

@Component({
  tag: 'snk-store-note-modal',
  styleUrl: './store-note-modal.scss'
})
export class StoreNoteModal {
  @Prop({ mutable: true }) note: string = "";

  private translations = DS_setTranslations(Translations, componentName);
  private textareaMaxLength = 140;
  private textareaColumns = 41;

  @Event() notify_noteUpdate_event: EventEmitter<Pick<Cart, 'noteToStore'>>;

  constructor() {
    this.updateLocalNoteHandler = this.updateLocalNoteHandler.bind(this);
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
  }

  private updateLocalNoteHandler({ detail: { value: newNote } }: EventDetails) {
    if (newNote.length <= this.textareaMaxLength) {
      this.note = newNote;
    }
  }

  private buttonClickHandler() {
    const reformattedNote = this.note.replace(/\n/g, ' ');
    this.notify_noteUpdate_event.emit({ noteToStore: reformattedNote });
  }

  /**
   * Format the content so that the <textarea> can automatically adjust to fit the entire note
   * and keep the character count displayed properly
   */
   private getFormattedContent() {

    let formattedContent = {
      content: this.note,
      lines: 1
    }

    if (this.note.length) {
      const charactersPerLine = this.textareaColumns;
      let displayedContent = this.note;
      let lineNumber = 1;
      const matchedLineBreaks = this.note.match(/\n/g)?.length || 0;
      let lines = 2 + matchedLineBreaks;

      while (charactersPerLine * lineNumber < this.note.length) {
        const lineBoundaryIndex = charactersPerLine * lineNumber;
        const lastLineCharacter = this.note[lineBoundaryIndex];

        if (!lastLineCharacter.match(/[a-z]/i)) {
          displayedContent.replace(this.note[lineBoundaryIndex], '\n');
          lines++;
        } else {
          const nearestBlankIndex = lineBoundaryIndex + displayedContent.substring(lineBoundaryIndex).indexOf(" ");
          displayedContent.replace(displayedContent[nearestBlankIndex], '\n');
          lines++;
        }

        lineNumber++;
      }

      formattedContent = {
        content: displayedContent,
        lines,
      }
    }

    return formattedContent;
  }

  render() {
    const formatted = this.getFormattedContent();

    return (
      <snk-mini-cart-modal
        class={componentName}
        modalTitle={this.translations.addNote}
      >
        <div
          slot="content"
          class={`${componentName}__container`}
        >
          <snk-textarea
            content={formatted.content}
            class={`${componentName}__textarea`}
            onTextAreaUpdate={this.updateLocalNoteHandler}
            placeholder={(this.textareaMaxLength - this.note.length).toString()}
            resizable={false}
            columns={this.textareaColumns}
            maxLength={this.textareaMaxLength}
            lines={Math.min(formatted.lines, 5)}
            withCharacterCount={this.note.length > 0}
            dataCy={{
              pageName: PageName.CART,
              elementName: 'note-textarea'
            }}
          />

          <ds-button
            class={`${componentName}__confirm-note`}
            useSnack
            buttonLevel={ButtonLevel.PRIMARY}
            buttonMods={[ "cart-block", "checkout", "default", "label" ]}
            onClick={this.buttonClickHandler}
            data-cy={DS_getDataCy({
              pageName: PageName.CART,
              elementName: 'confirm-note'
            })}
          >
            {this.translations.confirm}
          </ds-button>
        </div>
      </snk-mini-cart-modal>
    );
  }
}
