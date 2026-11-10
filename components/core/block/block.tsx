import { Component, h, Prop, Host, Element, Method } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { DSBlockContext } from './block.types';

/**
 * A block: a body, plus a header and a footer wrapper when it has `slot="header"` / `slot="footer"` children.
 * Its main class, `ds[-<name>]-<type or context>`, is on the host and prefixes the element classes
 * (`ds-home-hero__header`, `__body`, `__footer`).
 * An `article` block is an article (`role="article"`); a `section` block named by `label` is a region landmark
 * (`role="region"`). The other blocks have no role. A `role` of the element is kept.
 *
 * @slot - The content of the block, in its body (`__body`).
 * @slot header - The header of the block (`__header`, rendered with a `slot="header"` child): its heading.
 * @slot footer - The footer of the block (`__footer`, rendered with a `slot="footer"` child).
 */
@Component({
  tag: 'ds-block',
  styleUrl: './block.scss',
})
export class DSBlock {
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

  /**
   * The accessible name (`aria-label`) of a `section` block, which makes it a region landmark (`role="region"`): for a
   * section people go to from the list of landmarks. Without it, a section has no role (an unnamed region is not a
   * landmark).
   */
  @Prop() label: string;

  /** The `role` the element had before the first render: kept. */
  private ownRole: string | null = null;

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

  /** The role of the element: its own, else `article` for an article, `region` for a named section, else none. */
  get role(): string | undefined {
    if (this.ownRole) {
      return this.ownRole;
    }
    const { context } = this;
    return context === 'article' ? 'article' : context === 'section' && this.label ? 'region' : undefined;
  }

  componentWillLoad() {
    this.ownRole = this.hostContainer.getAttribute('role');
    // Before the first render the slotted elements are still children of the host: only its own, not those of nested blocks.
    const slots = Array.from(this.hostContainer.children).map(child => child.getAttribute('slot'));
    this.hasHeader = slots.includes('header');
    this.hasFooter = slots.includes('footer');
  }

  render() {
    const { blockName } = this;

    return (
      <Host class={toClassList(blockName, this.mods)} role={this.role} aria-label={this.role ? this.label : undefined}>
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
