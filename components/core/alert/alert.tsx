import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from '@stencil/core';
import { getFocusedElement, getNeighbourTabbable } from '../../utils/focus';
import { fromJSON, toClassList, toNumber } from '../../utils/props';
import { DS_ALERT_LIVE_DELAY, DS_ALERT_LIVE_VALUES, DS_ALERT_TYPES, DSAlertDefaultLabels } from './alert.constants';
import { DSAlertLabels, DSAlertLive, DSAlertType } from './alert.types';

/**
 * An inline message of the page (not a toast): `info`, `success`, `warning` or `error` (`type`), with an optional title
 * (`heading`, or a `slot="title"` element) and its content. The theme draws the icon of its type, decorative: a prefix
 * hidden on the screen (`Error:`, `labels`) tells the type to assistive technologies, before the title or the content.
 *
 * It is not a live region by default (`live="off"`): a message that is part of the page is read where it is. An alert that
 * a script inserts, shows or fills is announced with `live`: `polite` (`role="status"`) or `assertive` (`role="alert"`).
 * Its region is rendered before its content reaches assistive technologies (`DS_ALERT_LIVE_DELAY`), so that the content
 * is announced; a change of its content is announced too, the whole region (`aria-atomic`).
 *
 * `dismissible` renders a dismiss button: `alertDismiss` (cancelable), then the alert is hidden (`hidden`), the focus
 * goes to the next element of the Tab order (else the previous one) when it was in the alert, and `alertDismissed`.
 *
 * @slot - The message: a text, or paragraphs, a list, links.
 * @slot title - The title, instead of `heading`: a heading element of the page (`<h2 slot="title">`), with its own level.
 */
@Component({
  tag: 'ds-alert',
  styleUrl: 'alert.scss',
})
export class DSAlert {
  @Element() host: HTMLElement;

  /** The type of the message: `info` (default), `success`, `warning` or `error`. Its `--<type>` class: the icon and the color of the theme. */
  @Prop({ reflect: true }) type: DSAlertType = 'info';
  /** The title of the alert, before the message (`__title`). A `slot="title"` element replaces it. */
  @Prop() heading: string;
  /**
   * The heading level (1 to 6) of the title: it is a heading (`role="heading"`, `aria-level`). Not applied when the title
   * holds a heading element (`<h2 slot="title">`), which has its own level. Without it, the title is not a heading.
   */
  @Prop() level: number | string;
  /**
   * Whether the alert is a live region, announced when it appears and when its content changes: `off` (default: read where
   * it is, for a message that is part of the page), `polite` (`role="status"`) or `assertive` (`role="alert"`, an urgent
   * message, read at once). Set it before the alert gets the content to announce.
   */
  @Prop({ reflect: true }) live: DSAlertLive = 'off';
  /** Renders a dismiss button after the message: `alertDismiss` (cancelable), then the alert is hidden. */
  @Prop({ reflect: true }) dismissible = false;
  /** The texts of the alert (JSON as an attribute), to translate them: `info`, `success`, `warning`, `error` (the prefixes), `dismiss`. */
  @Prop() labels: DSAlertLabels | string = {};
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** Whether the content is kept from assistive technologies (`aria-hidden`) while the live region reaches them. */
  @State() isPending = false;
  /** Whether the alert holds a `slot="title"` element, and whether that title is or holds a heading element. */
  @State() titleSlot: 'none' | 'text' | 'heading' = 'none';

  /** Emitted before the alert is dismissed (its button, `dismiss()`): `preventDefault()` keeps it. */
  @Event({ cancelable: true }) alertDismiss: EventEmitter<void>;
  /** Emitted once the alert is dismissed: hidden, the focus moved. */
  @Event() alertDismissed: EventEmitter<void>;

  private releaseTimer: ReturnType<typeof setTimeout> | undefined;
  private observer: MutationObserver | undefined;

  /**
   * Dismisses the alert, as its dismiss button: emits `alertDismiss`, and unless it is cancelled, hides the alert (the
   * `hidden` attribute), moves the focus out of it when it had it, and emits `alertDismissed`. Resolves with whether it was
   * dismissed (`false`: cancelled, or already hidden).
   */
  @Method()
  async dismiss(): Promise<boolean> {
    return this.dismissAlert();
  }

  @Watch('live')
  liveWatcher(live: DSAlertLive, previous: DSAlertLive) {
    const isLive = this.toLive(live) !== 'off';
    if (isLive && this.toLive(previous) === 'off') {
      this.holdBack();
    } else if (!isLive) {
      this.release();
    }
  }

  connectedCallback() {
    this.updateTitleSlot();
    // Inserted (or moved): a live alert is announced, its region first.
    if (this.isLive) {
      this.holdBack();
    }
    if (typeof MutationObserver === 'function') {
      this.observer = new MutationObserver(records => this.mutationHandler(records));
      this.observer.observe(this.host, { attributes: true, attributeFilter: ['hidden'], attributeOldValue: true, childList: true, subtree: true });
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
    clearTimeout(this.releaseTimer);
    this.releaseTimer = undefined;
  }

  componentDidRender() {
    this.scheduleRelease();
  }

  /** The type, `info` for an unknown one. */
  get alertType(): DSAlertType {
    return DS_ALERT_TYPES.includes(this.type) ? this.type : 'info';
  }

  get isLive(): boolean {
    return this.toLive(this.live) !== 'off';
  }

  private toLive(live: string): DSAlertLive {
    return DS_ALERT_LIVE_VALUES.includes(live as DSAlertLive) ? (live as DSAlertLive) : 'off';
  }

  /** Whether the alert is hidden by its `hidden` attribute (dismissed, or hidden by the page). */
  private get isHidden(): boolean {
    return this.host.hasAttribute('hidden');
  }

  /** The heading level of the title: `level`, when it is valid and the title is not a heading element. */
  private get headingLevel(): number | undefined {
    const level = this.level !== undefined && this.level !== null && this.level !== '' ? toNumber(this.level) : undefined;
    return level >= 1 && level <= 6 && this.titleSlot !== 'heading' ? level : undefined;
  }

  /** The texts: `labels` over the English defaults. */
  private getLabels(): Required<DSAlertLabels> {
    let labels: DSAlertLabels = {};
    try {
      labels = (fromJSON(this.labels ?? {}) ?? {}) as DSAlertLabels;
    } catch {
      console.error('[ds-alert] labels is not valid JSON');
    }
    return { ...DSAlertDefaultLabels, ...labels };
  }

  /** The `slot="title"` element of the alert (not one of an alert in it). */
  private updateTitleSlot() {
    const title = Array.from(this.host.querySelectorAll('[slot="title"]')).find(element => element.closest('ds-alert') === this.host);
    this.titleSlot = !title ? 'none' : title.matches('h1, h2, h3, h4, h5, h6') || title.querySelector('h1, h2, h3, h4, h5, h6') ? 'heading' : 'text';
  }

  private mutationHandler(records: MutationRecord[]) {
    if (records.some(record => record.type === 'childList')) {
      this.updateTitleSlot();
    }
    const shown = records.some(record => record.target === this.host && record.type === 'attributes' && record.oldValue !== null && !this.isHidden);
    if (this.isLive && this.isHidden) {
      // Hidden: its content waits to be shown, with its region.
      this.holdBack();
    } else if (shown) {
      // Shown: the content was kept back while it was hidden; it comes once the region is shown.
      this.scheduleRelease();
    }
  }

  /** Keeps the content from assistive technologies, until the live region reaches them (`scheduleRelease()`, after the render). */
  private holdBack() {
    clearTimeout(this.releaseTimer);
    this.releaseTimer = undefined;
    this.isPending = true;
  }

  /** Gives the content to assistive technologies `DS_ALERT_LIVE_DELAY` ms after its region is rendered, shown. */
  private scheduleRelease() {
    if (this.isPending && this.releaseTimer === undefined && !this.isHidden && this.host.isConnected !== false) {
      this.releaseTimer = setTimeout(() => this.release(), DS_ALERT_LIVE_DELAY);
    }
  }

  private release() {
    clearTimeout(this.releaseTimer);
    this.releaseTimer = undefined;
    this.isPending = false;
  }

  private dismissAlert(): boolean {
    if (this.isHidden || this.alertDismiss.emit().defaultPrevented) {
      return false;
    }

    const focused = getFocusedElement();
    const next = focused && this.host.contains(focused) ? getNeighbourTabbable(this.host) : undefined;

    this.host.setAttribute('hidden', '');
    if (next) {
      next.focus();
    } else if (next === null) {
      // No other element to focus: the focus leaves the hidden alert, for the document.
      focused.blur();
    }
    this.alertDismissed.emit();
    return true;
  }

  private dismissClickHandler = () => {
    this.dismissAlert();
  };

  render() {
    const type = this.alertType;
    const labels = this.getLabels();
    const live = this.toLive(this.live);
    const hasTitle = !!this.heading || this.titleSlot !== 'none';
    const level = hasTitle ? this.headingLevel : undefined;
    const contentHidden = this.isPending ? 'true' : undefined;
    // The prefix of the type, before the title (in its name, when it is a heading) or else the message.
    const prefix = labels[type] ? [<span class="ds-alert__prefix">{labels[type]}</span>, ' '] : null;

    return (
      <Host
        class={{
          ...toClassList('ds-alert', this.mods),
          [`--${type}`]: true,
          '--dismissible': !!this.dismissible,
          '--live': live !== 'off',
        }}
      >
        <div
          class="ds-alert__content"
          role={live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined}
          aria-live={live !== 'off' ? live : undefined}
          aria-atomic={live !== 'off' ? 'true' : undefined}
        >
          <div class="ds-alert__title" hidden={!hasTitle} role={level ? 'heading' : undefined} aria-level={level} aria-hidden={contentHidden}>
            {hasTitle && prefix}
            {this.heading}
            <slot name="title" />
          </div>
          <div class="ds-alert__body" aria-hidden={contentHidden}>
            {!hasTitle && prefix}
            <slot />
          </div>
        </div>
        {this.dismissible && <button type="button" class="ds-alert__dismiss" aria-label={labels.dismiss} onClick={this.dismissClickHandler}></button>}
      </Host>
    );
  }
}
