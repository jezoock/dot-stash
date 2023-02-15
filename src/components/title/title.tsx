import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../dot-stash';

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

	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-title", this.mods);
		this.setTitleTag();
	}

	setTitleTag() {
		this.titleTag = `H${_ds.props.toNumber(this.heading)}`;
	}
	
	render() {
		const {titleTag: Tag} = this;
		return (
			<Tag
				class={this.CSSClassList}
			>
				<div class="ds-title__before">
					<slot name="before" />
				</div>
				<div class="ds-title__content">
					<slot />
				</div>
				<div class="ds-title__after">
					<slot name="after" />
				</div>
			</Tag>
		);
	}
}
