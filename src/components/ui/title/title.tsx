import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
	tag: 'ds-title',
	styleUrl: 'title.scss'
})
export class DSTitle {

	@Prop() mods: string | string[] = "default";
	@Prop() heading: string | number = "";

	CSSClassList: Record<string, boolean>;
	titleTag = 'div';

	@Watch('mods')
  modsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-title", newMods);
  }

	constructor() { }
	
	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-title", this.mods);
		this.setTitleTag();
	}

	setTitleTag() {
		if ( typeof this.heading === 'number' ) {
			this.titleTag = `H${this.heading.toString(10)}`;
		} else if (this.heading) {
			this.titleTag = `H${this.heading}`;
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
