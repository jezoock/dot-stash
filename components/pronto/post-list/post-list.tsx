import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';


@Component({
  tag: 'ds-post-list',
  styleUrl: 'post-list.scss'
})
export class DSPostList {

  @Prop() dsMods: string | string[] = "";

	CSSClassList: any;

	@Watch('dsMods')
	dsModsWatcher(newMods) {
		this.CSSClassList = _ds.props.toClassList("ds-post-list", newMods);
	}
	
	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-post-list", this.dsMods);
	}
  
  render() {
    return (
      <div class={this.CSSClassList}>
        <slot />
      </div>
    );
  }
}