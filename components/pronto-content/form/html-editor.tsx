import { Component, h, Host, State,Event, Prop, EventEmitter, Element } from '@stencil/core';

let globalHTMLInputId = 0;

const toolbar= [
  ["undo", "redo"],
  ["blocks"],
  ["anchor", "bold", "underline", "italic", "align", "bullist", "numlist" ],
  /* ["backcolor", "forecolor"], */
  ["link"/* , "image", "media" */],
  /* ["outdent", "indent"], */
  ["removeformat"],
  ["code"],
];

const plugins = [
  'anchor',
  'autolink',
  'image',
  'lists',
  'link',
  'media',
  'wordcount',
  'code'
];

@Component({
  tag: 'ds-html-editor',
  styleUrl: 'html-editor.scss'
})
export class DSHtmlEditor {
  @Element() host: HTMLDsHtmlEditorElement;

  @Prop() name: string;
  @Prop() content: string;
  @Prop() apiKey: string;

  @State() value: string;
  @State() showModal: boolean = false;

  //toolbar: string[][] = [[""]];
  toolbar: string;
  inputId: string;
  plugins: string;

  @Event() valueChange: EventEmitter;
  @Event() cancel: EventEmitter;
  @Event() save: EventEmitter;

  constructor() {
    this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
    this.saveButtonClickHandler = this.saveButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.toolbar = toolbar.map( action => action.join(" ") ).join(" | ");
    this.plugins = plugins.join(" ");
    this.inputId = `html-editor-${globalHTMLInputId++}`;
    this.value = this.content;
    this.host.setAttribute("id", this.inputId);
    window['tinymceConfig'] = {
      browser_spellcheck: true,
      license_key: 'gpl'
    }
  }

  cancelButtonClickHandler() {
    this.cancel.emit();
  }

  saveButtonClickHandler() {
    const markup = window["tinymce"].activeEditor.getContent();
    /* this.value = markup; */
    this.save.emit({ value: markup });
  }

  render() {
    return (
      <Host class="ds-html-editor">
        <tinymce-editor
          class="ds-html-editor__tiny-mce"
          api-key={this.apiKey || window['tinymceApiKey']}
          menubar="false" 
          toolbar={this.toolbar}
          plugins={this.plugins}
          config="tinymceConfig"
        >
          {this.value}
        </tinymce-editor>
        <menu class="ds-html-editor__menu">
          <ds-trigger type="button" mods="sm, stl-disabled" onClick={this.cancelButtonClickHandler}>
            Annuler
          </ds-trigger>
          <ds-trigger type="button" mods="sm, stl-1" onClick={this.saveButtonClickHandler}>
            Sauvegarder
          </ds-trigger>
        </menu>
      </Host>
    );
  }
}