import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
	tag: 'ds-block',
	styleUrl: './block.scss'
})
export class DSBlock {

	@Prop() dsTag: string = "div";
	@Prop() dsType: string = "";
	@Prop() dsMods: string | string[] = "";
	@Prop() withHeader: string | boolean = true;
	@Prop() withFooter: string | boolean = true;

	CSSClassList: any;
	tagName: string = "ds-block";

	@Watch('dsMods')
	dsModsWatcher(newMods) {
		this.CSSClassList = _ds.props.toClassList(this.tagName, newMods);
	}
	
	componentWillLoad() {
		if (!!this.dsType) {
			this.tagName = `ds-${this.dsType}-block`;
		}
		this.CSSClassList = _ds.props.toClassList(this.tagName, this.dsMods);
		this.withHeader = _ds.props.isTrue(this.withHeader);
		this.withFooter = _ds.props.isTrue(this.withFooter);
	}

	render() {
		const { dsTag: Tag }: { dsTag: string} = this;

		return (
			<Tag
				class={this.CSSClassList}
			>

				{this.withHeader && (
					<header class={`${this.tagName}__header`}>
						<slot name="header" />
					</header>
				)}

				<div class={`${this.tagName}__body`}>
					<slot />
				</div>

				{this.withFooter && (
					<footer class={`${this.tagName}__footer`}>
						<slot name="footer" />
					</footer>
				)}

			</Tag>
		);
	}
}