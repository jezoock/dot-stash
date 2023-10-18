import { Component, h, Prop, Watch, Host, Element, Method } from '@stencil/core/internal';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

enum DsBlockTypeToTag {
	PAGE = "Host",
	SECTION = "section",
	BLOCK = "div",
	CONTENT = "div"
}

@Component({
	tag: 'ds-block',
	styleUrl: './block.scss'
})
export class DSBlock {

	blockName = "ds-block";
	blockTag: DsBlockTypeToTag = DsBlockTypeToTag.BLOCK;
	context = 'block';
	CSSClassList: CssClassList;

	@Element() hostContainer: HTMLElement;

	@Prop({ reflect: true }) article: boolean;
	@Prop({ reflect: true }) block: boolean;
	@Prop({ reflect: true }) section: boolean;
	@Prop({ reflect: true }) form: boolean;
	
	/**
	 * Block type classname ( also used to build block classname )
	 */
	@Prop() type: string;

	/**
	 * Use to derivate the main class name
	 */
	@Prop({ reflect: true}) ext: string;

	/**
	 * List of modifiers
	 */
	@Prop({ reflect: true, mutable: true }) mods: string | string[] = [];

	@Watch('mods')
	modsChangeHandler(mods: string | string[]) {
		this.CSSClassList = _ds.props.toClassList(this.blockName, mods);
	}

	@Method()
	async getContext() {
		return this.article && 'article' || this.block && "block" || this.section && "section" || this.form && "form";
	}
	
	async connectedCallback() {
		let blockName = 'ds';
		const blockContext = await this.getContext();
		const blockType = this.type || blockContext;
		if (this.ext) {
			blockName = `${blockName}-${this.ext}`;
		}
		this.blockName = `${blockName}-${blockType}`;
		this.CSSClassList = _ds.props.toClassList(this.blockName, this.mods);
		this.context = blockContext;
/* 		this.hostContainer.querySelector("[slot='block-header']").classList.add(`${this.blockName}__header`); */
	}

	render() {
		return (
			<Host
				class={this.CSSClassList}
			>
				<div class={`${this.blockName}__header`}>
					<slot name="block-header" />
				</div>
				<div class={`${this.blockName}__body`}>
					<slot />
				</div>
				<div class={`${this.blockName}__footer`}>
					<slot name="block-footer" />
				</div>
			</Host>
		);
	}
}