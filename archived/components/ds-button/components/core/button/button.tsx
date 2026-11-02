import { Component, Element, h, Host, Listen, Prop, Watch } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { DSButtonType } from './button.types';

const buttonTypes: DSButtonType[] = ['button', 'submit', 'reset'];

/**
 * A button, or a link styled as a button when `href` is set. The host carries the `ds-button` class and the
 * modifiers (`mods`); it renders a native `<button>` (or `<a>`) holding the `before`, default and `after` slots.
 * In the light DOM, a `type="submit"` button inside a `<form>` submits it.
 *
 * `href` chooses between a link and a button when the component loads: Stencil loses the slotted content of an
 * element it replaces in the light DOM, so the component never swaps one for the other afterwards.
 *
 * A disabled button does not dispatch clicks: the native button is disabled, a link loses its `href` (and gets
 * `aria-disabled="true"` and `tabindex="-1"`), and a click on the component is stopped before it reaches the
 * listeners of the host (such as `onClick` in JSX) or of its ancestors.
 *
 * @slot before - Content before the label, such as an icon.
 * @slot - The label.
 * @slot after - Content after the label.
 */
@Component({
  tag: 'ds-button',
  styleUrl: 'button.scss',
})
export class DSButton {
  /** Whether the component renders a link: set from `href` when it loads. */
  isLink = false;

  @Element() host: HTMLElement;

  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /** Disables the button or the link, and stops the clicks on the component. */
  @Prop({ reflect: true }) disabled = false;
  /** Type of the native button: `button`, `submit` or `reset` (any other value gives `button`). Not used with `href`. */
  @Prop() type: DSButtonType = 'button';
  /**
   * Renders a link (`<a>`) to this URL instead of a button. Read when the component loads to choose between a link and
   * a button: afterwards, it changes the URL of a link, but a button stays a button and a link stays a link.
   */
  @Prop() href: string;
  /** `target` of the link (with `href`). */
  @Prop() target: string;
  /** `rel` of the link (with `href`). */
  @Prop() rel: string;
  /** Accessible name of the button or link (its `aria-label`), for a button without text, such as an icon-only button. */
  @Prop() label: string;

  @Watch('href')
  hrefChangeHandler(href: string) {
    if (!!href !== this.isLink) {
      console.warn(`[ds-button] href chooses between a link and a button when the component loads: this ${this.isLink ? 'link' : 'button'} stays one.`);
    }
  }

  componentWillLoad() {
    this.isLink = !!this.href;
  }

  /**
   * Stops the clicks of a disabled button in the capture phase of the host: they do not reach the listeners of the
   * host, whatever their registration order (capturing listeners run first, also on the target), nor of its ancestors.
   */
  @Listen('click', { capture: true })
  hostClickCaptureHandler(event: MouseEvent) {
    this.stopDisabledClick(event);
  }

  /**
   * Also stops them on the inner button or link, before they bubble to the host: in browsers the capture listener
   * already did, this one covers a DOM without capture phase, such as Stencil's spec DOM.
   */
  controlClickHandler = (event: MouseEvent) => {
    this.stopDisabledClick(event);
  };

  stopDisabledClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  render() {
    const content = [<slot name="before" />, <slot />, <slot name="after" />];

    return (
      <Host class={toClassList('ds-button', this.mods)}>
        {this.isLink ? (
          <a
            class="ds-button__control"
            // A disabled link has no href: no navigation, including a middle click or the context menu.
            href={this.disabled || !this.href ? undefined : this.href}
            role={this.disabled ? 'link' : undefined}
            aria-disabled={this.disabled ? 'true' : undefined}
            tabindex={this.disabled ? '-1' : undefined}
            target={this.target}
            rel={this.rel}
            aria-label={this.label}
            onClick={this.controlClickHandler}
          >
            {content}
          </a>
        ) : (
          <button
            class="ds-button__control"
            type={buttonTypes.includes(this.type) ? this.type : 'button'}
            disabled={this.disabled}
            aria-label={this.label}
            onClick={this.controlClickHandler}
          >
            {content}
          </button>
        )}
      </Host>
    );
  }
}
