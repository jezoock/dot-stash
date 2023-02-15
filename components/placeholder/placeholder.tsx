import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../dot-stash';

@Component({
  tag: 'ds-placeholder',
  styleUrl: 'placeholder.scss'
})
export class DSPlaceholder {

  @Prop() dsMods: string|string[] = [];

  CSSClassList: Record<string, boolean>;

  @Watch('dsMods')
  dsModsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-button", newMods);
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-button", this.dsMods);
  }
  
  render() {
    return (
      <div class={this.CSSClassList}>
        <slot />
      </div>
    );
  }
}