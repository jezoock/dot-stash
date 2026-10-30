import { Prop, Component, h, Watch, Host } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';


@Component({
  tag: 'ds-text',
})
export class DSText {
  @Prop() mods: string | string[] = "default";
	@Prop() type: "p" | "code" | "quote" = "p";
	@Prop() inline: boolean;
	@Prop() sup: boolean;
	@Prop() sub: boolean;
	@Prop() weight: "thin" | "light" | "normal" | "bold" | "bolder";


	CSSClassList: CssClassList;

	@Watch('mods')
  modsChangeHandler( newMods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-text", newMods);
  }

	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-text", this.mods);
	}
	
	render() {
		return (
			<Host
				class={{
					...this.CSSClassList,
				}}
			>
				<slot />
			</Host>
    );
  }
}
