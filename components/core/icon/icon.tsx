import { Component, Element, h, Host, Prop } from '@stencil/core';

/**
 * An icon: a glyph of the icon font of the theme (`type`). Decorative by default: hidden from assistive technologies
 * (`aria-hidden="true"`), the text next to it says what it means. With `label` (or an `aria-label` / `aria-labelledby`
 * of its own), it is an image with that name (`role="img"`), for an icon that stands alone.
 */
@Component({
  tag: 'ds-icon',
  styleUrl: 'icon.scss',
})
export class DSIcon {
  @Element() host: HTMLElement;

  @Prop() type: string;
  /** The accessible name of an icon that means something on its own (`role="img"`, `aria-label`). Without it, the icon is decorative. */
  @Prop() label: string;

  /** Whether the element is named by an `aria-label` or `aria-labelledby` of its own, read before the first render. */
  private hasOwnName = false;

  componentWillLoad() {
    this.hasOwnName = this.host.hasAttribute('aria-labelledby') || (this.host.hasAttribute('aria-label') && !this.label);
  }

  render() {
    const isImage = !!this.label || this.hasOwnName;

    return (
      <Host
        class={{
          'ds-icon': true,
          [`--${this.type}`]: true,
        }}
        role={isImage ? 'img' : undefined}
        aria-label={this.label || undefined}
        aria-hidden={isImage ? undefined : 'true'}
      />
    );
  }
}
