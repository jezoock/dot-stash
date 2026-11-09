import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';
import { getNeighbourTabbable, getTabbableElements, isTabbable } from '../../utils/focus';
import { formatLabel, formatPluralLabel } from '../../utils/labels';
import { fromJSON, toClassList } from '../../utils/props';
import { ThemeBreakpointWatch, watchThemeBreakpoint } from '../../utils/responsive';
import {
  DS_PAGINATION_BREAKPOINT_FALLBACKS,
  DS_PAGINATION_DEFAULT_BOUNDARIES,
  DS_PAGINATION_DEFAULT_COMPACT_BELOW,
  DS_PAGINATION_DEFAULT_LABEL,
  DS_PAGINATION_DEFAULT_SIBLINGS,
  DSPaginationDefaultLabels,
} from './pagination.constants';
import { getPaginationItems, getPaginationState } from './pagination.pages';
import { DSPaginationChangeDetail, DSPaginationControl, DSPaginationLabels, DSPaginationState } from './pagination.types';

/** What a control of the pagination stands for: the control of a page (its number), or a previous, next, first, last control. */
interface ControlOf {
  kind: DSPaginationControl | 'page';
  page?: number;
}

/**
 * A pagination: a navigation landmark (`role="navigation"`) named by `label` ("Pagination"), with a list of the pages
 * (`total`) around the current one (`current`): the first and last pages (`boundaries`), the pages next to the current one
 * (`siblings`), and an ellipsis for the others (decorative, `aria-hidden`); the previous and next controls around it, and
 * the first and last ones with `first-last`. Each page shows its number and is named "Page 3" (`labels`); the current
 * page has `aria-current="page"`. On the first page, the previous and first controls are unavailable, on the last page the
 * next and last ones: rendered in their place, not focusable.
 *
 * With `href-template` (`?page={page}`), the controls are links to the pages: the browser follows them, no script changes
 * the page, and the next page is a new page. Without it, they are buttons: a click emits `pageChange` (`detail.page`, cancelable), then
 * `current` changes, and the focus stays on the control the user pressed, or goes to the equivalent one (the current page,
 * when that control became unavailable): it is never lost.
 *
 * Below a breakpoint of the theme (`compact-below`, `sm`), or with `compact`, it is compact: the previous and next
 * controls (and first and last) around "Page 3 of 10", with the same names.
 */
@Component({
  tag: 'ds-pagination',
  styleUrl: 'pagination.scss',
})
export class DSPagination {
  @Element() host: HTMLElement;

  /** The number of pages. Without pages (`0`, or not a number), nothing is rendered. */
  @Prop() total: number | string;
  /** The current page, from 1 to `total` (a number out of that range is the closest page). A page change in button mode sets it. */
  @Prop({ mutable: true, reflect: true }) current: number | string = 1;
  /** The number of pages shown on each side of the current page: `1` by default, `10` at most. */
  @Prop() siblings: number | string = DS_PAGINATION_DEFAULT_SIBLINGS;
  /** The number of pages shown at each end of the list: `1` by default (the first and the last page), `10` at most. */
  @Prop() boundaries: number | string = DS_PAGINATION_DEFAULT_BOUNDARIES;
  /**
   * The link of a page, `{page}` its number (`?page={page}`, `/results/page/{page}`): the controls are then links (links
   * mode). Without it, they are buttons, and a page change emits `pageChange` (buttons mode).
   */
  @Prop() hrefTemplate: string;
  /** Renders the controls of the first and of the last page, at each end. */
  @Prop() firstLast = false;
  /** Always compact: "Page 3 of 10" between the previous and next controls, whatever the width of the viewport. */
  @Prop() compact = false;
  /**
   * The breakpoint of the theme below which the pagination is compact (`xs`, `sm`, `md`…: the media query of
   * `break-p(null, <breakpoint>)`): `sm` by default; `none` never.
   */
  @Prop() compactBelow: string = DS_PAGINATION_DEFAULT_COMPACT_BELOW;
  /** The name of the navigation landmark (`aria-label`): `Pagination` by default. Give it in the language of the page. */
  @Prop() label: string;
  /**
   * The texts of the pagination (JSON as an attribute), to translate them: `first`, `previous`, `next`, `last` (the names
   * of the controls), `page` (the name of a page, `{page}` its number), `status` (the compact text, `{page}`, `{total}`).
   */
  @Prop() labels: DSPaginationLabels | string = {};
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** Whether the element is a navigation landmark: not in a `nav` element or another navigation landmark. */
  @State() isLandmark = false;
  /** Whether the viewport is below the `compact-below` breakpoint. */
  @State() isNarrow = false;

  /**
   * Emitted in buttons mode when the user asks for another page (`detail.page`; `detail.previous`, the current page), before
   * `current` changes: `preventDefault()` keeps the current page. Not emitted in links mode, nor when a script sets `current`.
   */
  @Event({ cancelable: true }) pageChange: EventEmitter<DSPaginationChangeDetail>;

  /** The `role` the element had before the first render. */
  private ownRole: string | null = null;
  /** The media query of the `compact-below` breakpoint, while the element is in the document. */
  private compactWatch: ThemeBreakpointWatch | undefined;
  /** What each rendered control stands for. */
  private controls = new WeakMap<Element, ControlOf>();
  /** The control that had the focus before a render, and what it stood for. */
  private focusedControl: { element: HTMLElement; control: ControlOf } | undefined;

  @Watch('compactBelow')
  compactBelowWatcher() {
    this.watchCompact();
  }

  connectedCallback() {
    this.isLandmark = !this.host.parentElement?.closest('nav, [role="navigation"]');
    this.watchCompact();
  }

  componentWillLoad() {
    this.ownRole = this.host.getAttribute('role');
  }

  disconnectedCallback() {
    this.compactWatch?.stop();
    this.compactWatch = undefined;
  }

  componentWillRender() {
    const focused = document.activeElement as HTMLElement | null;
    const control = focused && this.controls.get(focused);
    this.focusedControl = control ? { element: focused, control } : undefined;
  }

  componentDidRender() {
    this.keepFocus();
  }

  /** The numbers the pagination renders: `total`, `current`, `siblings` and `boundaries`, whole and in range. */
  get state(): DSPaginationState {
    return getPaginationState(this);
  }

  /** Whether the controls are links (`href-template`), rather than buttons. */
  get isLinks(): boolean {
    return !!this.hrefTemplate?.trim();
  }

  /** Whether the pagination is compact: `compact`, or below the `compact-below` breakpoint. */
  get isCompact(): boolean {
    return !!this.compact || this.isNarrow;
  }

  /** Watches the `compact-below` breakpoint of the theme (its width without the theme: the engine default). */
  private watchCompact() {
    this.compactWatch?.stop();
    this.compactWatch = undefined;
    const label = (this.compactBelow ?? '').trim();

    if (!label || label === 'none') {
      this.isNarrow = false;
      return;
    }
    this.compactWatch = watchThemeBreakpoint(label, DS_PAGINATION_BREAKPOINT_FALLBACKS[label] ?? 0, matches => (this.isNarrow = !matches));
    this.isNarrow = !this.compactWatch.matches;
  }

  /** The texts: `labels` over the English defaults. */
  private getLabels(): Required<DSPaginationLabels> {
    let labels: DSPaginationLabels = {};
    try {
      labels = (fromJSON(this.labels ?? {}) ?? {}) as DSPaginationLabels;
    } catch {
      console.error('[ds-pagination] labels is not valid JSON');
    }
    return { ...DSPaginationDefaultLabels, ...labels };
  }

  /** The link of a page: `href-template` with its number. */
  private hrefOf(page: number): string {
    return formatLabel(this.hrefTemplate.trim(), { page });
  }

  /** Buttons mode: asks for a page, with `pageChange`, then makes it the current page unless the event is cancelled. */
  private select(page: number) {
    const { total, current } = this.state;

    if (page === current || page < 1 || page > total) {
      return;
    }
    if (!this.pageChange.emit({ page, previous: current }).defaultPrevented) {
      this.current = page;
    }
  }

  /**
   * After a render, the focus that was on a control is not lost: the control keeps it while the user can still use it.
   * When it went away, or became unavailable (the next control on the last page), the focus goes to the equivalent
   * control: the control of the same page, or of the same kind; else the current page; else the next element of the
   * pagination the user can reach (`getNeighbourTabbable()`), else the first one. When the focus is elsewhere (a page that
   * moved it in a `pageChange` listener), it stays there.
   */
  private keepFocus() {
    const focused = this.focusedControl;
    this.focusedControl = undefined;
    if (!focused) {
      return;
    }

    const active = document.activeElement;
    if ((active === focused.element && isTabbable(focused.element)) || (active && active !== document.body && active !== focused.element)) {
      return;
    }

    const { kind, page } = focused.control;
    const controls = Array.from(this.host.querySelectorAll<HTMLElement>('.ds-pagination__control')).filter(element => isTabbable(element));
    const find = (wanted: ControlOf) =>
      controls.find(element => this.controls.get(element)?.kind === wanted.kind && (wanted.page === undefined || this.controls.get(element)?.page === wanted.page));
    const target =
      find(kind === 'page' ? { kind, page } : { kind }) ??
      find({ kind: 'page', page: this.state.current }) ??
      (focused.element.isConnected && this.host.contains(focused.element) ? getNeighbourTabbable(focused.element, this.host) : null) ??
      getTabbableElements(this.host)[0];

    target?.focus();
  }

  /** The control of a page: its number, named "Page 3"; the current page with `aria-current="page"`. */
  private renderPage(page: number, current: number, labels: Required<DSPaginationLabels>) {
    const isCurrent = page === current;
    const attributes = {
      'class': { 'ds-pagination__control': true, '--page': true, '--current': isCurrent },
      'aria-label': formatLabel(labels.page, { page }),
      'aria-current': isCurrent ? 'page' : undefined,
      'ref': (element: HTMLElement) => element && this.controls.set(element, { kind: 'page', page }),
    };

    return this.isLinks ? (
      <a {...attributes} href={this.hrefOf(page)}>
        {page}
      </a>
    ) : (
      <button {...attributes} type="button" onClick={() => this.select(page)}>
        {page}
      </button>
    );
  }

  /**
   * A previous, next, first or last control, named by `labels` (its icon is the theme's). Unavailable (the first or the
   * last page): a link without `href` (`role="link"`, `aria-disabled`), or a disabled button; in its place, not focusable.
   */
  private renderControl(kind: DSPaginationControl, page: number, isAvailable: boolean, labels: Required<DSPaginationLabels>) {
    const attributes = {
      'key': kind,
      'class': { 'ds-pagination__control': true, [`--${kind}`]: true, '--disabled': !isAvailable },
      'aria-label': labels[kind],
      'ref': (element: HTMLElement) => element && this.controls.set(element, { kind }),
    };
    const rel = kind === 'previous' ? 'prev' : kind === 'next' ? 'next' : undefined;

    if (!this.isLinks) {
      return <button {...attributes} type="button" disabled={!isAvailable} onClick={() => this.select(page)}></button>;
    }
    return isAvailable ? <a {...attributes} href={this.hrefOf(page)} rel={rel}></a> : <a {...attributes} role="link" aria-disabled="true"></a>;
  }

  render() {
    const state = this.state;
    const { total, current } = state;
    const labels = this.getLabels();
    const isCompact = this.isCompact;
    const role = this.ownRole || (this.isLandmark && total > 0 ? 'navigation' : undefined);
    const lang = this.host.closest('[lang]')?.getAttribute('lang') || undefined;

    return (
      <Host
        class={{
          ...toClassList('ds-pagination', this.mods),
          '--links': this.isLinks,
          '--buttons': !this.isLinks,
          '--compact': isCompact,
          '--empty': total === 0,
        }}
        role={role}
        aria-label={role ? this.label?.trim() || DS_PAGINATION_DEFAULT_LABEL : undefined}
      >
        {total > 0 && this.firstLast && this.renderControl('first', 1, current > 1, labels)}
        {total > 0 && this.renderControl('previous', current - 1, current > 1, labels)}
        {total > 0 &&
          (isCompact ? (
            <span key="status" class="ds-pagination__status">
              {formatPluralLabel(labels.status, total, lang, { page: current, total })}
            </span>
          ) : (
            <ul key="list" class="ds-pagination__list">
              {getPaginationItems(state).map(item =>
                item.type === 'page' ? (
                  <li key={`page-${item.page}`} class="ds-pagination__item">
                    {this.renderPage(item.page, current, labels)}
                  </li>
                ) : (
                  <li key={`ellipsis-${item.position}`} class="ds-pagination__item --ellipsis" aria-hidden="true"></li>
                ),
              )}
            </ul>
          ))}
        {total > 0 && this.renderControl('next', current + 1, current < total, labels)}
        {total > 0 && this.firstLast && this.renderControl('last', total, current < total, labels)}
      </Host>
    );
  }
}
