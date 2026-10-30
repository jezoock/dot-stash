import { Component, h, Prop, Watch, Host, Element, Method } from '@stencil/core/internal';
import _ds from '../../utils/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

enum DsBlockTypeToTag {
  PAGE = 'Host',
  SECTION = 'section',
  BLOCK = 'div',
  CONTENT = 'div',
  FORM = 'div',
}

@Component({
  tag: 'ds-block',
  styleUrl: './block.scss',
})
export class DSBlock {
  blockName = 'ds-block';
  blockTag: DsBlockTypeToTag = DsBlockTypeToTag.BLOCK;
  context = 'block';
  CSSClassList: CssClassList;
  hasHeader: boolean;
  hasFooter: boolean;

  @Element() hostContainer: HTMLElement;

  @Prop({ reflect: true }) section: boolean;
  @Prop({ reflect: true }) block: boolean;
  @Prop({ reflect: true }) article: boolean;
  @Prop({ reflect: true }) form: boolean;
  @Prop({ reflect: true }) modal: boolean;

  /**
   * Block type classname ( also used to build block classname )
   */
  @Prop() type: string;

  /**
   * Use to derivate the main class name
   */
  @Prop({ reflect: true }) name: string;

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
    return (this.article && 'article') || (this.section && 'section') || (this.form && 'form') || (this.form && 'modal') || 'block';
  }

  async connectedCallback() {
    let blockName = 'ds';
    const blockContext = await this.getContext();
    const blockType = this.type || blockContext;
    if (this.name) {
      blockName = `${blockName}-${this.name}`;
    }
    this.blockName = `${blockName}-${blockType}`;
    this.CSSClassList = _ds.props.toClassList(this.blockName, this.mods);
    this.context = blockContext;

    this.hasHeader = this.hostContainer.querySelector("[slot='header']") !== null;
    this.hasFooter = this.hostContainer.querySelector("[slot='footer']") !== null;
  }

  render() {
    return (
      <Host class={this.CSSClassList}>
        {this.hasHeader && (
          <div class={`${this.blockName}__header`}>
            <slot name="header" />
          </div>
        )}
        <div class={`${this.blockName}__body`}>
          <slot />
        </div>
        {this.hasFooter && (
          <div class={`${this.blockName}__footer`}>
            <slot name="footer" />
          </div>
        )}
      </Host>
    );
  }
}
