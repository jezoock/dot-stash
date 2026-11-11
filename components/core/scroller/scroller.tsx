import { Component, Element, h, Host, Listen, Method, Prop, State, Watch } from '@stencil/core';
import { getFocusedElement } from '../../utils/focus';
import { fromJSON, toClassList } from '../../utils/props';
import { DS_SCROLLER_ORIENTATIONS, DSScrollerDefaultLabels } from './scroller.constants';
import { DSScrollerLabels, DSScrollerOrientation } from './scroller.types';

const prefersReducedMotion = (): boolean => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A length of a computed style, in px (`0` for `auto` or none). */
const toPixels = (value: string | undefined): number => parseFloat(value ?? '') || 0;

/**
 * A row of items that scrolls, with the native scrolling of the browser (the wheel, a swipe, the scrollbar, the keys of
 * a focused scroller): horizontal by default, or `vertical`. It keeps the element that takes the focus in it in view,
 * scrolling as little as it can (to the nearest edge, not to the center), with a margin from the edges: the
 * `scroll-padding` of the viewport, `--ds-scroller-focus-margin`. With `snap`, it stops on the start of an item
 * (`scroll-snap-type`).
 *
 * Unlike `ds-slider`, it never makes the items out of view inert nor hidden: they stay in the Tab order and in the
 * accessibility tree, so that the focus can reach every item (a spatial navigation of the page, with a game pad,
 * finds them) and the scroller follows it.
 *
 * With `controls`, a previous and a next button (`ds-trigger`, named by `labels`) scroll by a page; each one is hidden at
 * its end. Its classes tell whether its content overflows (`--overflowing`) and whether it is at its start or its end
 * (`--at-start`, `--at-end`). A `label` makes it a region of the page, with that name.
 *
 * @slot - The items: the direct children of the scroller, laid out in a row (or a column).
 */
@Component({
  tag: 'ds-scroller',
  styleUrl: 'scroller.scss',
})
export class DSScroller {
  @Element() host: HTMLElement;

  /** The name of the scroller (`aria-label`): with it, the scroller is a region of the page (`role="region"`), a landmark. */
  @Prop() label: string;
  /** The direction it scrolls in: `horizontal` (a row, by default) or `vertical` (a column; give the scroller a height). */
  @Prop({ reflect: true }) orientation: DSScrollerOrientation = 'horizontal';
  /** Stops the scroll on the start of an item (`scroll-snap-type: mandatory`, `scroll-snap-align: start`). */
  @Prop({ reflect: true }) snap = false;
  /** Renders a previous and a next button, which scroll by a page, each one hidden at its end. */
  @Prop({ reflect: true }) controls = false;
  /** The texts of the scroller (JSON as an attribute), to translate them: `previous`, `next` (the names of the buttons). */
  @Prop() labels: DSScrollerLabels | string = {};
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** Whether the content is larger than the viewport, and whether the viewport is at its start or at its end. */
  @State() isOverflowing = false;
  @State() isAtStart = true;
  @State() isAtEnd = true;

  private viewport: HTMLElement | undefined;
  /** The scroll position the scroller was at before the browser scrolled a focused element into view (scroll events come later). */
  private settled = { left: 0, top: 0 };
  /** The position a smooth scroll of the scroller goes to, until it gets there or stops. */
  private pending: number | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private mutationObserver: MutationObserver | undefined;
  /** A previous / next button that had the focus before a render. */
  private focusedButton: HTMLElement | null = null;

  //#region METHODS

  /** Scrolls forward by a page: the width of the viewport less its margins (its height, `vertical`). */
  @Method()
  async next() {
    this.scrollByPage(1);
  }

  /** Scrolls back by a page. */
  @Method()
  async previous() {
    this.scrollByPage(-1);
  }

  /** Measures the content again: whether it overflows, and is at its start or its end (after a change no observer saw). */
  @Method()
  async refresh() {
    this.update();
  }

  //#endregion

  //#region LIFECYCLE

  @Watch('orientation')
  orientationWatcher() {
    requestAnimationFrame(() => this.update());
  }

  connectedCallback() {
    if (typeof MutationObserver === 'function' && !this.mutationObserver) {
      this.mutationObserver = new MutationObserver(() => {
        this.observeItems();
        this.update();
      });
    }
  }

  componentDidLoad() {
    if (typeof ResizeObserver === 'function') {
      this.resizeObserver = new ResizeObserver(() => this.update());
    }
    if (this.viewport) {
      this.mutationObserver?.observe(this.viewport, { childList: true });
      this.viewport.addEventListener('scrollend', this.scrollEndHandler);
    }
    this.observeItems();
    this.update();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.mutationObserver?.disconnect();
    this.mutationObserver = undefined;
  }

  componentWillRender() {
    const focused = getFocusedElement();
    this.focusedButton = focused && this.host.contains(focused) && focused.matches('.ds-scroller__prev, .ds-scroller__next') ? focused : null;
  }

  componentDidRender() {
    // A previous / next button that had the focus is no longer rendered (an end is reached): the focus goes to the other one.
    if (this.focusedButton && !this.focusedButton.isConnected) {
      this.host.querySelector<HTMLElement>('.ds-scroller__prev, .ds-scroller__next')?.focus();
    }
    this.focusedButton = null;
  }

  //#endregion

  //#region SCROLL

  get isVertical(): boolean {
    return this.orientation === 'vertical';
  }

  /** The texts: `labels` over the English defaults. */
  getLabels(): Required<DSScrollerLabels> {
    let labels: DSScrollerLabels = {};
    try {
      labels = (fromJSON(this.labels ?? {}) as DSScrollerLabels) ?? {};
    } catch {
      console.error('[ds-scroller] labels is not valid JSON');
    }
    return { ...DSScrollerDefaultLabels, ...labels };
  }

  /** Watches the size of the viewport and of each item (an image that loads makes the content larger). */
  private observeItems() {
    if (!this.resizeObserver || !this.viewport) {
      return;
    }
    this.resizeObserver.disconnect();
    this.resizeObserver.observe(this.viewport);
    Array.from(this.viewport.children).forEach(child => this.resizeObserver.observe(child));
  }

  /** Whether the content overflows, and the viewport is at its start or its end. */
  private update() {
    const viewport = this.viewport;
    if (!viewport) {
      return;
    }
    const position = Math.abs((this.isVertical ? viewport.scrollTop : viewport.scrollLeft) || 0);
    const max = (this.isVertical ? viewport.scrollHeight - viewport.clientHeight : viewport.scrollWidth - viewport.clientWidth) || 0;
    this.isOverflowing = max > 1;
    this.isAtStart = position <= 1;
    this.isAtEnd = position >= max - 1;
  }

  private scrollHandler = () => {
    const viewport = this.viewport;
    if (viewport) {
      this.settled = { left: viewport.scrollLeft, top: viewport.scrollTop };
      if (this.pending !== undefined && Math.abs((this.isVertical ? viewport.scrollTop : viewport.scrollLeft) - this.pending) < 1) {
        this.pending = undefined;
      }
    }
    this.update();
  };

  /** A scroll stopped (`scrollend`): a smooth scroll of the scroller is over, or was stopped by the user or a snap. */
  private scrollEndHandler = () => {
    this.pending = undefined;
  };

  /** How the scroller moves: smoothly, at once with less motion, or `instant` to undo a scroll of the browser. */
  private behavior(): ScrollBehavior {
    return prefersReducedMotion() ? 'auto' : 'smooth';
  }

  /** Scrolls by a page, forward (1) or back (-1), toward the end of the content (from right to left: to the left). */
  private scrollByPage(direction: 1 | -1) {
    const viewport = this.viewport;
    if (!viewport) {
      return;
    }
    const style = getComputedStyle(viewport);
    if (this.isVertical) {
      const page = viewport.clientHeight - toPixels(style.scrollPaddingTop) - toPixels(style.scrollPaddingBottom);
      viewport.scrollBy({ top: direction * Math.max(page, 1), behavior: this.behavior() });
    } else {
      const page = viewport.clientWidth - toPixels(style.scrollPaddingLeft) - toPixels(style.scrollPaddingRight);
      const sign = style.direction === 'rtl' ? -1 : 1;
      viewport.scrollBy({ left: sign * direction * Math.max(page, 1), behavior: this.behavior() });
    }
  }

  /**
   * An element of the content takes the focus: the scroller shows it, scrolling as little as it can, with the margins of
   * the viewport (its `scroll-padding`). The item that holds the element is shown whole when it fits, else the element.
   * The browser may have scrolled the element into view already (to its center, before this event): the distance is
   * counted from where the scroller was before.
   */
  @Listen('focusin')
  focusInHandler(event: FocusEvent) {
    const viewport = this.viewport;
    const target = event.target as HTMLElement;
    if (!viewport || target === viewport || !viewport.contains(target)) {
      return;
    }

    let item: HTMLElement = target;
    while (item.parentElement && item.parentElement !== viewport) {
      item = item.parentElement;
    }

    const style = getComputedStyle(viewport);
    const box = viewport.getBoundingClientRect();
    const vertical = this.isVertical;
    const fits = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return vertical
        ? rect.height <= viewport.clientHeight - toPixels(style.scrollPaddingTop) - toPixels(style.scrollPaddingBottom)
        : rect.width <= viewport.clientWidth - toPixels(style.scrollPaddingLeft) - toPixels(style.scrollPaddingRight);
    };
    const shown = fits(item) ? item : target;
    const rect = shown.getBoundingClientRect();

    const [current, settled] = vertical ? [viewport.scrollTop, this.settled.top] : [viewport.scrollLeft, this.settled.left];
    // The position the scroller is going to (a smooth scroll of its own that runs), else the one it was at.
    const base = this.pending ?? settled;
    // Where the element is at that position: moved back by the distance the browser (or the scroll) went past it.
    const shift = current - base;
    const start = (vertical ? rect.top : rect.left) + shift;
    const end = (vertical ? rect.bottom : rect.right) + shift;
    const viewStart = vertical ? box.top + viewport.clientTop + toPixels(style.scrollPaddingTop) : box.left + viewport.clientLeft + toPixels(style.scrollPaddingLeft);
    const viewEnd = vertical
      ? box.top + viewport.clientTop + viewport.clientHeight - toPixels(style.scrollPaddingBottom)
      : box.left + viewport.clientLeft + viewport.clientWidth - toPixels(style.scrollPaddingRight);

    let delta = 0;
    if (start < viewStart) {
      delta = start - viewStart;
    } else if (end > viewEnd) {
      delta = Math.min(end - viewEnd, start - viewStart);
    }
    const position = base + delta;
    const scrollTo = (to: number, behavior: ScrollBehavior) => viewport.scrollTo(vertical ? { top: to, behavior } : { left: to, behavior });

    // The browser scrolled the element into view (to its center, at once): back to where the scroller was first, so that
    // it moves from there.
    if (current !== settled) {
      scrollTo(settled, 'instant');
    }
    if (Math.abs(position - settled) >= 1) {
      const behavior = this.behavior();
      this.pending = behavior === 'smooth' ? position : undefined;
      scrollTo(position, behavior);
    }
  }

  //#endregion

  render() {
    const labels = this.getLabels();
    const orientation = DS_SCROLLER_ORIENTATIONS.includes(this.orientation) ? this.orientation : 'horizontal';
    const label = this.label?.trim();
    const hasControls = this.controls && this.isOverflowing;

    return (
      <Host
        class={{
          ...toClassList('ds-scroller', this.mods),
          [`--${orientation}`]: true,
          '--snap': !!this.snap,
          '--controls': hasControls,
          '--overflowing': this.isOverflowing,
          '--at-start': this.isAtStart,
          '--at-end': this.isAtEnd,
        }}
        role={label ? 'region' : undefined}
        aria-label={label || undefined}
      >
        {hasControls && !this.isAtStart && (
          <ds-trigger type="button" class="ds-scroller__prev" mods={['scroller', 'prev']} label={labels.previous} onClick={() => this.scrollByPage(-1)} />
        )}
        <div class="ds-scroller__viewport" ref={element => (this.viewport = element)} onScroll={this.scrollHandler}>
          <slot />
        </div>
        {hasControls && !this.isAtEnd && (
          <ds-trigger type="button" class="ds-scroller__next" mods={['scroller', 'next']} label={labels.next} onClick={() => this.scrollByPage(1)} />
        )}
      </Host>
    );
  }
}
