import { Component, h, Prop, Host, Element, Method } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { DSBlockContext } from './block.types';

// A const object rather than an enum: several block types map to the same tag.
const DsBlockTypeToTag = {
  PAGE: 'Host',
  SECTION: 'section',
  BLOCK: 'div',
  CONTENT: 'div',
  FORM: 'div',
} as const;

type DsBlockTypeToTag = (typeof DsBlockTypeToTag)[keyof typeof DsBlockTypeToTag];

/**
 * A block: a body, plus a header and a footer wrapper when it has `slot="header"` / `slot="footer"` children.
 * Its main class, `ds[-<name>]-<type or context>`, is on the host and prefixes the element classes
 * (`ds-home-hero__header`, `__body`, `__footer`).
 */
@Component({
  tag: 'ds-block',
  styleUrl: './block.scss',
})
export class DSBlock {
  blockTag: DsBlockTypeToTag = DsBlockTypeToTag.BLOCK;
  /** Whether the block has a `slot="header"` child, read before the first render. */
  hasHeader = false;
  /** Whether the block has a `slot="footer"` child, read before the first render. */
  hasFooter = false;

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

  /** The context given by the boolean properties: `article`, `section`, `form`, `modal`, else `block`. */
  get context(): DSBlockContext {
    return (this.article && 'article') || (this.section && 'section') || (this.form && 'form') || (this.modal && 'modal') || 'block';
  }

  /** `ds[-<name>]-<type or context>`: the main class and the prefix of the element classes. Follows the props. */
  get blockName(): string {
    return `ds${this.name ? `-${this.name}` : ''}-${this.type || this.context}`;
  }

  @Method()
  async getContext(): Promise<DSBlockContext> {
    return this.context;
  }

  componentWillLoad() {
    // Before the first render the slotted elements are still children of the host: only its own, not those of nested blocks.
    const slots = Array.from(this.hostContainer.children).map(child => child.getAttribute('slot'));
    this.hasHeader = slots.includes('header');
    this.hasFooter = slots.includes('footer');
  }

  render() {
    const { blockName } = this;

    return (
      <Host class={toClassList(blockName, this.mods)}>
        {this.hasHeader && (
          <div class={`${blockName}__header`}>
            <slot name="header" />
          </div>
        )}
        <div class={`${blockName}__body`}>
          <slot />
        </div>
        {this.hasFooter && (
          <div class={`${blockName}__footer`}>
            <slot name="footer" />
          </div>
        )}
      </Host>
    );
  }
}
