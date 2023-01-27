import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
	tag: 'ds-block',
	styleUrl: './block.scss'
})
export class DSBlock {

	@Prop() dsTag = "div";
	@Prop() dsType = "";
	@Prop() dsMods: string | string[] = "";

	CSSClassList: any;
	tagName = "ds-block";

	@Watch('dsMods')
	dsModsWatcher(newMods) {
		this.CSSClassList = _ds.props.toClassList(this.tagName, newMods);
	}
	
	componentWillLoad() {
		if (this.dsType) {
			this.tagName = `ds-${this.dsType}-block`;
		}
		this.CSSClassList = _ds.props.toClassList(this.tagName, this.dsMods);
	}

	render() {
		const { dsTag: Tag }: { dsTag: string} = this;

		return (
			<Tag
				class={this.CSSClassList}
			>
				<slot name="header" />
				<slot />
				<slot name="footer" />
			</Tag>
		);
	}
}