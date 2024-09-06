import { Component, h, Prop } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-account-block',
  styleUrl: 'account-block.scss'
})
export class DSAccountBlock {

  @Prop({ mutable: true, reflect: true, attribute: 'ds-dropdown' }) dsIsDropdownEnabled: boolean = false;

  componentWillLoad() {
    this.dsIsDropdownEnabled = _ds.props.isTrue(this.dsIsDropdownEnabled);
  }
  
  render() {
    return (
      <div
        class={{
          "ds-account-block": true,
          "--with-dropdown": this.dsIsDropdownEnabled
        }}
      >
        <div class="ds-account-block__link">
          <slot name="rootLink" />
        </div>
        <div class="ds-account-block__dropdown">
          <slot name="links" />
        </div>
      </div>
    );
  }
}