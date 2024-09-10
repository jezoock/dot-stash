import { Component, h, Host, Element, Event, EventEmitter, Prop } from '@stencil/core';

let globalTinyMceInlineEditorId = 0;

@Component({
  tag: 'ds-title-configurator',
  styleUrl: 'title.scss',
})
export class DsTitleConfigurator {

  @Element() host: any;

  @Prop() value: string;

  @Prop() toolbar: string = 'h1 h2 h3 h4 h5 bold';
  @Prop() validElements: string = 'h1,h2,h3,h4,h5,strong,em,span,a[href]';

  @Event() valueChange: EventEmitter;

  editor: any;
  
  componentDidLoad() {
    this.editor = window['tinymce'].init({
      selector: `.tiny-mce-inline-${globalTinyMceInlineEditorId}`,
      menubar: false,
      inline: true,
      license_key: 'gpl',
      plugins: [
        'lists',
        'autolink'
      ],
      toolbar: this.toolbar,
      valid_elements: this.validElements,
      width: '400px',
      valid_styles: {
        '*': 'font-size,font-family,color,text-decoration,text-align'
      },
      setup: (editor) => {
        editor.on("Change", () => {
          const markup = window["tinymce"].activeEditor.getBody({ format: 'text' }).innerHTML;
          this.valueChange.emit({ value: markup.replace(/<\/?p[^>]*>/g, "") });
        });
        editor.on("init", () => {
          editor.setContent(this.value, { format: 'text' });
        })
      }
    });

    globalTinyMceInlineEditorId++;
  }

  render() {
    return (
      <Host class="ds-title-configurator">
        <div class={`tiny-mce-inline-${globalTinyMceInlineEditorId}`}>
          <slot />
        </div>
      </Host>
    );
  }
}