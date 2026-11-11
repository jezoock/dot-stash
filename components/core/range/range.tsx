import { Component, Element, h, Host, Listen, Method, Prop, State, Watch } from '@stencil/core';
import { isDisabledControl } from '../../utils/form-control';
import { formatLabel } from '../../utils/labels';
import { fromJSON, toClassList } from '../../utils/props';
import { DS_RANGE_OBSERVED_ATTRIBUTES, DSRangeDefaultLabels } from './range.constants';
import { DSRangeFormatter, DSRangeLabels, DSRangeValue } from './range.types';

/** A number of an attribute or a property, `undefined` when it is not one. */
const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** A share of the range, in % with at most 3 decimals: the value of `--ds-range-fill` and `--ds-range-buffer`. */
const toPercent = (share: number) => `${Math.round(share * 100000) / 1000}%`;

/** Sets an attribute (`null`: removes it), when it changes. */
const setAttribute = (element: Element, name: string, value: string | null) => {
  if (value === null) {
    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
    }
  } else if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
};

/** The inputs of the document whose `disabled` may change from a `<fieldset>` around them: one observer for every range. */
const disabledListeners = new Set<() => void>();
let disabledObserver: MutationObserver | undefined;

/** Calls `listener` when a `disabled` attribute changes in the document. Returns the function that stops. */
const watchDisabled = (listener: () => void): (() => void) => {
  if (typeof MutationObserver !== 'function') {
    return () => undefined;
  }
  disabledListeners.add(listener);
  if (!disabledObserver) {
    disabledObserver = new MutationObserver(() => disabledListeners.forEach(each => each()));
    disabledObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['disabled'], subtree: true });
  }
  return () => {
    disabledListeners.delete(listener);
    if (!disabledListeners.size) {
      disabledObserver?.disconnect();
      disabledObserver = undefined;
    }
  };
};

/**
 * Enhances a native `<input type="range">` the page writes in it, which stays the control: its role (`slider`), its name
 * (a `<label>` of the page), its keys (the arrows, Page Up, Page Down, Home, End), its value and its form are the
 * browser's. The range draws a track under the input, filled from its start side to the value: the share of the range is
 * the `--ds-range-fill` custom property (`42.5%`), which the component sets on itself, and the theme draws the track and
 * the thumb from it. `buffer` adds a second part, from the start to another value (the part of a video that is loaded
 * already: `--ds-range-buffer`).
 *
 * The range follows the input: the user's `input` and `change` events, the attributes `min`, `max`, `step`, `value` and
 * `disabled` (its own, or that of a `<fieldset>` around it). A value set by a script on the `value` property tells no
 * event: call `refresh()` after it. `labels.valueText` (a template) or `formatter` (a function) give the input an
 * `aria-valuetext`, the text assistive technologies read for its value ("1:23 of 45:00", "40 %").
 *
 * @slot - The control: an `<input type="range">`, a direct child of the range, named by a `<label>` of the page (or its `aria-label`).
 */
@Component({
  tag: 'ds-range',
  styleUrl: 'range.scss',
})
export class DSRange {
  @Element() host: HTMLElement;

  /**
   * A second value, on the scale of the input (from its `min` to its `max`): the track is filled to it, under the fill of
   * the value (`__buffer`, `--ds-range-buffer`). The part of a video loaded already. None by default.
   */
  @Prop() buffer: number | string;
  /** The texts of the range (JSON as an attribute), to translate them: `valueText`, the template of `aria-valuetext` (see the readme). */
  @Prop() labels: DSRangeLabels | string = {};
  /** Gives the text of the value (`aria-valuetext`) instead of `labels.valueText`: a function, set as a property (a time, a unit). */
  @Prop() formatter: DSRangeFormatter;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** What the range shows of its input. */
  @State() fill: string;
  @State() bufferFill: string | undefined;
  @State() disabled = false;
  @State() hasControl = false;

  /** The input, once found. */
  private control: HTMLInputElement | null = null;
  /** The parts the range created: the track, its buffer and its fill. */
  private track: HTMLElement | null = null;
  /** Whether the range set the `aria-valuetext` of the input (it then removes it, never one of the page). */
  private ownValueText = false;
  private observer: MutationObserver | undefined;
  private stopWatchingDisabled: () => void = () => undefined;

  /** Reads the input again: after a value set by a script on its `value` property, which tells no event. */
  @Method()
  async refresh() {
    this.sync();
  }

  @Watch('buffer')
  @Watch('labels')
  @Watch('formatter')
  propsWatcher() {
    this.sync();
  }

  connectedCallback() {
    if (typeof MutationObserver === 'function') {
      this.observer = new MutationObserver(records => {
        if (
          records.some(
            record =>
              record.type === 'attributes' ||
              Array.from(record.addedNodes)
                .concat(Array.from(record.removedNodes))
                .some(node => node !== this.track),
          )
        ) {
          this.sync();
        }
      });
      this.observer.observe(this.host, { childList: true, attributes: true, attributeFilter: DS_RANGE_OBSERVED_ATTRIBUTES, subtree: true });
    }
    this.stopWatchingDisabled = watchDisabled(() => this.sync());
    this.sync();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
    this.stopWatchingDisabled();
    this.detach();
    this.track?.remove();
    this.track = null;
  }

  /** The user moves the thumb (`input`), or commits a value (`change`). */
  @Listen('input')
  @Listen('change')
  inputHandler(event: Event) {
    if (event.target === this.control) {
      this.sync();
    }
  }

  /** A form reset gives the input its value back, after the event. */
  @Listen('reset', { target: 'document' })
  formResetHandler(event: Event) {
    if (this.control && event.target === this.control.form) {
      setTimeout(() => this.sync());
    }
  }

  //#region STATE

  /** The input: the first `<input type="range">` among the children of the range. */
  private findControl(): HTMLInputElement | null {
    return (
      (Array.from(this.host.children).find(child => child.localName === 'input' && (child.getAttribute('type') ?? '').toLowerCase() === 'range') as HTMLInputElement | undefined) ??
      null
    );
  }

  /** The value of the input, its minimum and maximum (as the browser reads them: 0 and 100 without valid ones) and its share of the range. */
  getValue(control: HTMLInputElement): DSRangeValue {
    const min = toNumber(control.getAttribute('min')) ?? 0;
    const maxAttribute = toNumber(control.getAttribute('max')) ?? 100;
    const max = maxAttribute < min ? min : maxAttribute;
    // The browser gives the value clamped to the range (and to the steps); a DOM without it, the attribute.
    const raw = toNumber(typeof control.value === 'string' && control.value !== '' ? control.value : control.getAttribute('value'));
    const value = clamp(raw ?? min + (max - min) / 2, min, max);
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
    return { value, min, max, percent };
  }

  /** The texts: `labels` over the English defaults. */
  getLabels(): Required<DSRangeLabels> {
    let labels: DSRangeLabels = {};
    try {
      labels = (fromJSON(this.labels ?? {}) as DSRangeLabels) ?? {};
    } catch {
      console.error('[ds-range] labels is not valid JSON');
    }
    return { ...DSRangeDefaultLabels, ...labels };
  }

  /** The text of the value for assistive technologies: `formatter`, else the `valueText` template; `''` for none. */
  private valueText(value: DSRangeValue): string {
    if (typeof this.formatter === 'function') {
      return this.formatter(value) ?? '';
    }
    const template = this.getLabels().valueText;
    return template ? formatLabel(template, { value: value.value, min: value.min, max: value.max, percent: Math.round(value.percent) }) : '';
  }

  /** Reads the input and updates the range: its fill, its buffer, its disabled state, the value text of the input. */
  private sync() {
    const control = this.findControl();
    if (control !== this.control) {
      this.detach();
      this.control = control;
    }
    this.hasControl = !!control;

    if (!control) {
      this.track?.remove();
      this.track = null;
      return;
    }

    const value = this.getValue(control);
    this.fill = toPercent(value.percent / 100);
    const buffer = toNumber(this.buffer);
    this.bufferFill = buffer === undefined ? undefined : toPercent(value.max > value.min ? (clamp(buffer, value.min, value.max) - value.min) / (value.max - value.min) : 0);
    this.disabled = isDisabledControl(control);

    // The track, before the input: drawn under it, not read.
    if (!this.track) {
      this.track = document.createElement('span');
      this.track.className = 'ds-range__track';
      this.track.setAttribute('aria-hidden', 'true');
      const bufferPart = document.createElement('span');
      bufferPart.className = 'ds-range__buffer';
      const fillPart = document.createElement('span');
      fillPart.className = 'ds-range__fill';
      this.track.append(bufferPart, fillPart);
    }
    if (this.track.nextSibling !== control) {
      this.host.insertBefore(this.track, control);
    }

    if (!control.classList.contains('ds-range__input')) {
      control.classList.add('ds-range__input');
    }

    // The value text: only the one the range set is replaced or removed.
    const text = this.valueText(value);
    if (text) {
      setAttribute(control, 'aria-valuetext', text);
      this.ownValueText = true;
    } else if (this.ownValueText) {
      setAttribute(control, 'aria-valuetext', null);
      this.ownValueText = false;
    }
  }

  /** Gives the former input back as it was: no class nor value text of the range. */
  private detach() {
    if (!this.control) {
      return;
    }
    this.control.classList.remove('ds-range__input');
    if (this.ownValueText) {
      this.control.removeAttribute('aria-valuetext');
      this.ownValueText = false;
    }
    this.control = null;
  }

  //#endregion

  render() {
    const hasBuffer = this.hasControl && this.bufferFill !== undefined;

    return (
      <Host
        class={{
          ...toClassList('ds-range', this.mods),
          '--disabled': this.disabled,
          '--buffer': hasBuffer,
        }}
        style={{
          '--ds-range-fill': this.hasControl ? this.fill : undefined,
          '--ds-range-buffer': hasBuffer ? this.bufferFill : undefined,
        }}
      ></Host>
    );
  }
}
