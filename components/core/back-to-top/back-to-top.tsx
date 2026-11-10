import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from '@stencil/core';
import { isTabbable } from '../../utils/focus';
import { toClassList } from '../../utils/props';
import { DS_BACK_TO_TOP_DEFAULT_LABEL, DS_BACK_TO_TOP_DEFAULT_THRESHOLD, DS_BACK_TO_TOP_TARGETS } from './back-to-top.constants';

/** A threshold: a number of px (`400`, `400px`) or of hundredths of the viewport height (`100vh`). */
const THRESHOLD = /^\s*(\d+(?:\.\d+)?)\s*(px|vh)?\s*$/i;

/**
 * A "Back to top" link, fixed in the bottom corner of the end side of the viewport, shown once the page is scrolled past
 * `threshold` (one viewport height by default). It is a native link to `#top`, which a browser follows by itself (the top
 * of the document); a click or Enter scrolls to the top (smoothly, at once with less motion) and moves the focus to the
 * `target` (else the `#top` element, the main landmark, the first heading, else the body), so that the keyboard and
 * screen readers go on from the top too, then emits `backToTop`.
 *
 * Hidden, it is not rendered for the pointer, the keyboard or assistive technologies (`visibility: hidden`, `inert`), and
 * takes no room (fixed): the page does not move when it shows. It follows the scroll with a passive listener, read once
 * per animation frame, removed when it leaves the document.
 */
@Component({
  tag: 'ds-back-to-top',
  styleUrl: 'back-to-top.scss',
})
export class DSBackToTop {
  @Element() host: HTMLElement;

  /**
   * How far the page is scrolled before the link shows: a number of px (`400`, `400px`) or of hundredths of the viewport
   * height (`100vh`, the default: one screen; `50vh`). Another value is the default.
   */
  @Prop() threshold: number | string = DS_BACK_TO_TOP_DEFAULT_THRESHOLD;
  /**
   * The element that takes the focus after the scroll, a CSS selector (`#page-title`). Without it, or when it matches
   * nothing: the `#top` element, else the main landmark, else the first heading, else the body. An element that cannot take
   * the focus gets `tabindex="-1"` until it loses it. An id selector (`#page-title`) is also the `href` of the link.
   */
  @Prop() target: string;
  /** The name of the link (its text, hidden on the screen): `Back to top` by default. Give it in the language of the page. */
  @Prop() label: string;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** Whether the page is scrolled past the threshold. */
  @State() isPastThreshold = false;
  /** Whether the link has the focus: it stays shown until it loses it. */
  @State() hasFocus = false;

  /** Emitted once the link scrolled the page to the top and moved the focus (`detail.target`: the element focused). */
  @Event() backToTop: EventEmitter<{ target: HTMLElement }>;

  /** The animation frame that reads the scroll, while one is requested. */
  private frame: number | undefined;

  /** Scrolls to the top and moves the focus, as the link does. */
  @Method()
  async scrollToTop(): Promise<void> {
    this.goToTop();
  }

  @Watch('threshold')
  thresholdWatcher() {
    this.update();
  }

  connectedCallback() {
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('resize', this.scrollHandler, { passive: true });
    this.update();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.scrollHandler);
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
  }

  /** The threshold in px: `threshold`, or the default, one viewport height. */
  get thresholdPx(): number {
    const match = THRESHOLD.exec(String(this.threshold ?? '')) ?? THRESHOLD.exec(DS_BACK_TO_TOP_DEFAULT_THRESHOLD);
    const value = Number(match[1]);

    return match[2]?.toLowerCase() === 'vh' ? (value * window.innerHeight) / 100 : value;
  }

  /** The scroll and the resize of the window: read once per animation frame. */
  private scrollHandler = () => {
    if (this.frame === undefined) {
      this.frame = requestAnimationFrame(() => {
        this.frame = undefined;
        this.update();
      });
    }
  };

  private update() {
    this.isPastThreshold = (window.scrollY ?? window.pageYOffset ?? 0) > this.thresholdPx;
  }

  /** The element that takes the focus: `target`, else the first of `DS_BACK_TO_TOP_TARGETS`, else the body. Not one in the link. */
  getTarget(): HTMLElement {
    const find = (selector: string): HTMLElement | undefined => {
      try {
        return Array.from(document.querySelectorAll<HTMLElement>(selector)).find(element => !this.host.contains(element));
      } catch {
        console.error(`[ds-back-to-top] target is not a valid selector: ${selector}`);
        return undefined;
      }
    };

    return (this.target && find(this.target)) || DS_BACK_TO_TOP_TARGETS.map(find).find(Boolean) || document.body;
  }

  /** Focuses an element without scrolling; one that cannot take the focus gets `tabindex="-1"` until it loses it. */
  private focus(target: HTMLElement) {
    if (!target.hasAttribute('tabindex') && !isTabbable(target)) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.getAttribute('tabindex') === '-1' && target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
  }

  private goToTop() {
    const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = this.getTarget();

    window.scrollTo({ top: 0, left: window.scrollX ?? 0, behavior: reduceMotion ? 'instant' : 'smooth' });
    this.focus(target);
    this.backToTop.emit({ target });
  }

  /** A click or Enter on the link (not one that opens it elsewhere: a modifier key, another button). */
  private clickHandler = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    this.goToTop();
  };

  render() {
    const isShown = this.isPastThreshold || this.hasFocus;
    const href = this.target && /^#[\w-]+$/.test(this.target.trim()) ? this.target.trim() : '#top';

    return (
      <Host
        class={{
          ...toClassList('ds-back-to-top', this.mods),
          '--shown': isShown,
          '--hidden': !isShown,
        }}
        onFocusin={() => (this.hasFocus = true)}
        onFocusout={() => (this.hasFocus = false)}
      >
        <a class="ds-back-to-top__link" href={href} inert={!isShown} onClick={this.clickHandler}>
          <span class="ds-back-to-top__label">{this.label?.trim() ? this.label : DS_BACK_TO_TOP_DEFAULT_LABEL}</span>
        </a>
      </Host>
    );
  }
}
