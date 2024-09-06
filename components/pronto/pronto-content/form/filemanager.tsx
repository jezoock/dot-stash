import { Component, Element, Event, EventEmitter, Host, Method, Prop, h } from '@stencil/core';


@Component({
  tag: 'ds-filemanager',
})
export class DSFilemanager {
  @Element() host: HTMLDsFilemanagerElement;

  @Prop() type: 'image' | 'video' = 'image';
  @Prop() url: string;
  @Prop() name: string;
  @Prop({ mutable: true, reflect: true }) mediaIndex: string;

  @Event() valueChange: EventEmitter;

  @Method()
  async setUrl(url: string) {
    const { name } = this;
    this.valueChange.emit({ name, value: url });
  }

  inputId: string;

  componentWillLoad() {
    this.inputId = this.name;
    this.host.setAttribute("id", this.inputId);
  }

  componentDidLoad() {
    console.log(this.mediaIndex);
  }

  render() {
    return (
      <Host>
        <iframe src={`${this.url || window['fileManagerUrl']}&input=${this.name}&mediaIndex=${this.mediaIndex}&type=${this.type === "image" ? "1" : "3" }`} width="1000" height="500" />
      </Host>
    );
  }
}