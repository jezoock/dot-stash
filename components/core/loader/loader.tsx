import { Component, Element, h, Host, Prop } from '@stencil/core';
import { toClassList } from '../../utils/props';
import { DS_LOADER_DEFAULT_LABEL, DS_LOADER_DEFAULT_MAX, DS_LOADER_SIZES } from './loader.constants';
import { DSLoaderSize } from './loader.types';

/** A number of a prop given as an attribute or a property, `undefined` when it is not one. */
const toNumberProp = (value: number | string | undefined | null): number | undefined => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

/**
 * A loading indicator (WAI-ARIA `progressbar`), named by `label` ("Loading" by default). Indeterminate by default: a
 * spinner, without a value. Determinate when `value` is a number: a bar filled to `value` of `max` (100 by default), with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, as a native `<progress>`. Block by default (centered in its
 * container, a bar as wide as it), or `inline` (in the line of the text, at its size); `size` `sm`, `md` or `lg`.
 *
 * It is not a live region: a page tells the start and the end of a load with `aria-busy` on the region that loads, and a
 * status message (a polite `ds-alert`) when it matters. With less motion, the spinner keeps turning, more slowly.
 */
@Component({
  tag: 'ds-loader',
  styleUrl: 'loader.scss',
})
export class DSLoader {
  @Element() host: HTMLElement;

  /** The progress, from 0 to `max`: a determinate loader (a bar), else an indeterminate one (a spinner). Clamped to 0…`max`. */
  @Prop() value: number | string;
  /** The value of a complete progress (`aria-valuemax`): 100 by default, and for a value that is not a number above 0. */
  @Prop() max: number | string;
  /** The accessible name of the loader (`aria-label`): what loads. `Loading` by default: give it in the language of the page. */
  @Prop() label: string;
  /** Shows the label next to the indicator, instead of only giving it to assistive technologies. */
  @Prop() showLabel = false;
  /** In the line of the text, at its size (`--inline`), instead of a block centered in its container. */
  @Prop({ reflect: true }) inline = false;
  /** The size of the indicator: `sm`, `md` or `lg` (its `--<size>` class). Without it, `md`, or the size of the text when `inline`. */
  @Prop({ reflect: true }) size: DSLoaderSize;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** The maximum: `max`, when it is a number above 0, else 100. */
  get maxValue(): number {
    const max = toNumberProp(this.max);
    return max !== undefined && max > 0 ? max : DS_LOADER_DEFAULT_MAX;
  }

  /** The value of a determinate loader, clamped to 0…`max`; `undefined` for an indeterminate one. */
  get currentValue(): number | undefined {
    const value = toNumberProp(this.value);
    return value === undefined ? undefined : Math.min(Math.max(value, 0), this.maxValue);
  }

  /** The accessible name: `label`, else `Loading`. */
  get name(): string {
    return this.label?.trim() ? this.label : DS_LOADER_DEFAULT_LABEL;
  }

  render() {
    const value = this.currentValue;
    const isDeterminate = value !== undefined;
    const max = this.maxValue;
    const size = DS_LOADER_SIZES.includes(this.size) ? this.size : undefined;

    return (
      <Host
        class={{
          ...toClassList('ds-loader', this.mods),
          '--determinate': isDeterminate,
          '--indeterminate': !isDeterminate,
          '--inline': !!this.inline,
          ...(size ? { [`--${size}`]: true } : {}),
        }}
        role="progressbar"
        aria-label={this.name}
        aria-valuemin={isDeterminate ? '0' : undefined}
        aria-valuemax={isDeterminate ? String(max) : undefined}
        aria-valuenow={isDeterminate ? String(value) : undefined}
      >
        {isDeterminate ? (
          <span class="ds-loader__track">
            <span class="ds-loader__bar" style={{ width: `${(value / max) * 100}%` }}></span>
          </span>
        ) : (
          <span class="ds-loader__spinner"></span>
        )}
        {this.showLabel && (
          <span class="ds-loader__label" aria-hidden="true">
            {this.name}
          </span>
        )}
      </Host>
    );
  }
}
