import { Component, h, Prop, Watch } from '@stencil/core/internal';
import _ds from '../../typescript/dot-stash';
import CssClassList from '../types/css-class-list.interface';

@Component({
	tag: 'ds-title',
	styleUrl: 'title.scss',
})
export class DSTitle {
	CSSClassList: CssClassList;

	@Prop({ reflect: true }) mods: string | string[] = [];
	@Prop({ reflect: true }) page: boolean;
	@Prop({ reflect: true }) section: boolean;
	@Prop({ reflect: true }) block: boolean;
	@Prop({ reflect: true }) sub: boolean;


	@Watch('mods')
  modsWatcher( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-title", _ds.props.toArray(mods));
  }

	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-title", _ds.props.toArray(this.mods));
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
