import { Component, h, Host, Prop } from '@stencil/core';
import '@alenaksu/json-viewer';

@Component({
  tag: 'ds-json',
})
export class DsJSON {
  
  @Prop() data: any = {};

  render() {
    return (
      <Host>
        <json-viewer data={this.data} />
      </Host>
    );
  }
}