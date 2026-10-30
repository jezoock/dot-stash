import { Component, h, Prop, Host, Element, Method } from '@stencil/core';
import { toClassList } from '../../utils/props';

// A const object rather than an enum: several block types map to the same tag.
const DsBlockTypeToTag = {
  PAGE: 'Host',
  SECTION: 'section',
  BLOCK: 'div',
  CONTENT: 'div',
  FORM: 'div',
} as const;

type DsBlockTypeToTag = (typeof DsBlockTypeToTag)[keyof typeof DsBlockTypeToTag];

@Component({
  tag: 'ds-block',
  styleUrl: './block.scss',
})
export class DSBlock {
  /** `ds[-<name>]-<type or context>`: the main class and the prefix of the element classes, computed by connectedCallback. */
  blockName = 'ds-block';
  /**
   * The host's main class: `blockName` once connectedCallback has computed it; until then the host has no class.
   * connectedCallback is async: in browsers it ends after the first render.
   */
  mainClass: string;
  blockTag: DsBlockTypeToTag = DsBlockTypeToTag.BLOCK;
  context = 'block';
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

  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  @Method()
  async getContext() {
    return (this.article && 'article') || (this.section && 'section') || (this.form && 'form') || (this.modal && 'modal') || 'block';
  }

  async connectedCallback() {
    let blockName = 'ds';
    const blockContext = await this.getContext();
    const blockType = this.type || blockContext;
    if (this.name) {
      blockName = `${blockName}-${this.name}`;
    }
    this.blockName = `${blockName}-${blockType}`;
    this.mainClass = this.blockName;
    this.context = blockContext;

    this.hasHeader = this.hostContainer.querySelector("[slot='header']") !== null;
    this.hasFooter = this.hostContainer.querySelector("[slot='footer']") !== null;
  }

  render() {
    return (
      <Host class={this.mainClass && toClassList(this.mainClass, this.mods)}>
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
