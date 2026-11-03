import { Component, Element, h, Prop, Host } from '@stencil/core';
import { toClassList, toNumber } from '../../utils/props';

/**
 * A title, styled by the theme (`page`, `section`, `block`, `sub`). It renders no heading of its own: put a heading
 * (`h1`…`h6`) in it, or set `level` to make a text title a heading (`role="heading"`, `aria-level`).
 *
 * @slot - The title: a text, or a heading, a paragraph, a link or a `strong`.
 */
@Component({
  tag: 'ds-title',
  styleUrl: 'title.scss',
})
export class DSTitle {
  @Element() host: HTMLElement;

  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ reflect: true }) article: boolean;
  @Prop({ reflect: true }) form: boolean;
  @Prop({ reflect: true }) page: boolean;
  @Prop({ reflect: true }) section: boolean;
  @Prop({ reflect: true }) block: boolean;
  @Prop({ reflect: true }) sub: boolean;
  @Prop({ reflect: true }) sup: boolean;
  /**
   * The heading level (1 to 6) of a text title: the element is a heading (`role="heading"`, `aria-level`). Not applied when
   * the title holds a heading element, which has its own level.
   */
  @Prop() level: number | string;

  /** The heading level of the element: `level`, when it is valid and the title holds no heading element. */
  get headingLevel(): number | undefined {
    const level = this.level !== undefined && this.level !== null && this.level !== '' ? toNumber(this.level) : undefined;
    return level >= 1 && level <= 6 && !this.host.querySelector('h1, h2, h3, h4, h5, h6') ? level : undefined;
  }

  render() {
    return (
      <Host class={toClassList('ds-title', this.mods)} role={this.headingLevel ? 'heading' : undefined} aria-level={this.headingLevel}>
        <slot />
      </Host>
    );
  }
}
