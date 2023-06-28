import { Prop, Component, h, Watch } from '@stencil/core/internal';
import _ds from '../../typescript/dot-stash';
import CssClassList from '../types/css-class-list.interface';


@Component({
  tag: 'ds-text',
})
export class DSText {
  @Prop() mods: string | string[] = "default";
	@Prop() type = "p";
	@Prop() italic: boolean;
	@Prop() bold: boolean;
	@Prop() highlight: boolean;
	@Prop() size: string | number;
	@Prop() color: string;

	CSSClassList: CssClassList;

	@Watch('mods')
  modsChangeHandler( newMods ) {
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
				}}
			><slot /></div>
    );
  }
}