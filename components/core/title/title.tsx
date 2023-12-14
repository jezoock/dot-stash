import { Component, h, Prop, Watch, Host, Element } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

@Component({
	tag: 'ds-title',
	styleUrl: 'title.scss',
})
export class DSTitle {
	CSSClassList: CssClassList;

	@Element() container: HTMLElement;

	@Prop({ reflect: true }) mods: string | string[] = [];
	@Prop({ reflect: true, mutable: true }) article: boolean;
	@Prop({ reflect: true, mutable: true }) form: boolean;
	@Prop({ reflect: true, mutable: true }) page: boolean;
	@Prop({ reflect: true, mutable: true }) section: boolean;
	@Prop({ reflect: true, mutable: true }) block: boolean;
	@Prop({ reflect: true, mutable: true }) sub: boolean;
	@Prop({ reflect: true, mutable: true }) sup: boolean;
	@Prop() useContext: boolean;

	@Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-title", _ds.props.toArray(mods));
  }

	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-title", _ds.props.toArray(this.mods));
	}

	getContext() {
		return this.article && 'article' || this.block && "block" || this.section && "section" || this.form && "form"; 
	}
	
	async componentDidLoad() {
		let { useContext } = this;
		if (typeof useContext === 'undefined') {
			const { useContext: useContextFromConfig } = _ds.app.getConfig([ 'useContext' ]);
			useContext = Boolean(useContextFromConfig);
		}
		if (useContext) {
			const contextContainer = this.container.closest("ds-block");
			if (contextContainer) {
				const context = await contextContainer.getContext();
				if (typeof this[context] === "undefined") {
					this[context] = true;
				}
			}
		}
	}
	
	render() {
		return (
			<Host
				class={this.CSSClassList}
			>
				<slot />
			</Host>
		);
	}
}
