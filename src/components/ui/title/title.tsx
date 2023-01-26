import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
	tag: 'ds-title',
	styleUrl: 'title.scss'
})
export class DSTitle {

	@Prop() dsMods: string | string[] = "default";
	@Prop() dsHeading: string | number = "";

	CSSClassList: any;
	titleTag: string = 'div';

	@Watch('dsMods')
  dsModsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-title", newMods);
  }

	constructor() { }
	
	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-title", this.dsMods);
		this.setTitleTag();
	}

	setTitleTag() {
		if ( typeof this.dsHeading === 'number' ) {
			this.titleTag = `H${this.dsHeading.toString(10)}`;
		} else if (!!this.dsHeading) {
			this.titleTag = `H${this.dsHeading}`;
		}
	}
	
	render() {
		const {titleTag: Tag} = this;
		return (
			<Tag
				class={this.CSSClassList}
			>
				<slot />
			</Tag>
		);
	}
}
