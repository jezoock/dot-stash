import { Component, h, Prop, Watch } from '@stencil/core/internal';
import _ds from '../../typescript/dot-stash';
import CssClassList from '../types/css-class-list.interface';

@Component({
  tag: 'ds-placeholder',
  styleUrl: 'placeholder.scss'
})
export class DSPlaceholder {

  @Prop() dsMods: string|string[] = [];

  CSSClassList: CssClassList;

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