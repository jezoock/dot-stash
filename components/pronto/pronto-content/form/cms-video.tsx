import { Element, Component, h, Host, Prop, Event, EventEmitter, State, Method } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

@Component({
  tag: 'ds-cms-video',
})
export class DSCmsVideo {
  @Element() host: HTMLDsCmsVideoElement;

  @Prop() filemanagerUrl: string;
  @Prop() name: string;

  @State() showFileManager: boolean; 

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

  render() {
    return (
      <Host>
        <iframe src={`${this.filemanagerUrl || window['fileManagerUrl']}&input=${this.name}&type=3`} width="1000" height="500" />
      </Host>
    );
  }
}