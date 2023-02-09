import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
	tag: 'ds-block',
	styleUrl: './block.scss'
})
export class DSBlock {

	@Prop() tag = "div";
	@Prop() type = "";
	@Prop() mods: string | string[] = "";

	CSSClassList: any;
	tagName = "ds-block";

	@Watch('mods')
	modsWatcher(newMods) {
		this.CSSClassList = _ds.props.toClassList(this.tagName, newMods);
	}
	
	componentWillLoad() {
		if (this.type) {
			this.tagName = `ds-${this.type}-block`;
		}
		this.CSSClassList = _ds.props.toClassList(this.tagName, this.mods);
	}

	render() {
		const { tag: Tag }: { tag: string} = this;

		return (
			<Tag
				class={this.CSSClassList}
			>
				<header class={`${this.tagName}__header`}>
					<slot name="header" />
				</header>
				<div class={`${this.tagName}__body`}>
					<slot />
				</div>
				<footer class={`${this.tagName}__footer`}>
					<slot name="footer" />
				</footer>
			</Tag>
		);
	}
}