import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../dot-stash';

@Component({
	tag: 'ds-block',
	styleUrl: './block.scss'
})
export class DSBlock {

	@Prop() dsTag = "div";
	@Prop() dsType = "";
	@Prop() dsMods: string | string[] = "";

	CSSClassList: Record<string, boolean>;
	blockName = "ds-block";

	@Watch('dsMods')
	dsModsWatcher(newMods: string | string[]) {
		this.CSSClassList = _ds.props.toClassList(this.blockName, newMods);
	}
	
	componentWillLoad() {
		if (this.dsType) {
			this.blockName = `ds-${this.dsType}-block`;
		}
		this.CSSClassList = _ds.props.toClassList(this.blockName, this.dsMods);
	}

	render() {
		const { dsTag: Tag }: { dsTag: string} = this;

		return (
			<Tag
				class={this.CSSClassList}
			>
				<header class={`${this.blockName}__header`}>
					<slot name="header" />
				</header>
				<div class={`${this.blockName}__body`}>
					<slot />
				</div>
				<footer class={`${this.blockName}__footer`}>
					<slot name="footer" />
				</footer>
			</Tag>
		);
	}
}