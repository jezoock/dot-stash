import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../dot-stash';

@Component({
	tag: 'ds-title',
	styleUrl: 'title.scss'
})
export class DSTitle {

	@Prop() mods: string | string[] = "default";
	@Prop() group = "app";
	@Prop({ reflect: true }) page: boolean;
	@Prop({ reflect: true }) section: boolean;
	@Prop({ reflect: true }) block: boolean;
	@Prop({ reflect: true }) sub: boolean;

	CSSClassList: Record<string, boolean>;

	@Watch('mods')
  modsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-title", newMods);
  }

	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-title", this.mods);
	}
	
	render() {
		return (
			<div
				class={{
					...this.CSSClassList,
					'--sub': this.sub,
					'--page': this.page,
					'--section': this.section,
					'--block': this.block,
				}}
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
			</div>
		);
	}
}
