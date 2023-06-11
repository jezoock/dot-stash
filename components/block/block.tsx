import { Component, h, Prop, Watch } from '@stencil/core/internal';
import _ds from '../dot-stash';

@Component({
	tag: 'ds-block',
	styleUrl: './block.scss'
})
export class DSBlock {

	CSSClassList: Record<string, boolean>;
	blockName = "ds-block";
	
	/**
	 * Main container tag
	 */
	@Prop() tag = "div";

	/**
	 * Use to derivate the main class name
	 */
	@Prop() type = "";

	/**
	 * List of modifiers
	 */
	@Prop() mods: string | string[] = [];

	@Watch('mods')
	modsWatcher(newMods: string | string[]) {
		this.CSSClassList = _ds.props.toClassList(this.blockName, newMods);
	}
	
	componentWillLoad() {
		if (this.type) {
			this.blockName = `ds-${this.type}-block`;
		}
		this.CSSClassList = _ds.props.toClassList(this.blockName, this.mods);
	}

	render() {
		const { tag: Tag } = this;

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