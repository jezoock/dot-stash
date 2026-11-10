import { Component, Element, h, Listen, Method, State, Prop, Event, EventEmitter } from '@stencil/core';
import { toArray, toClassList } from '../../utils/props';
import { TOASTER_HORIZONTAL_POSITION, TOASTER_VERTICAL_POSITION } from './toaster-positions.enum';
import { TransitionWait, waitForTransition } from '../../utils/transition';

/**
 * Toast messages in a fixed box. Hidden until `show()` or `displayToast()`; a click hides it.
 * The `--shown` / `--hidden` classes fade it in and out: `toasterShown` and `toasterHidden` are emitted
 * at the end of that transition.
 *
 * Screen readers announce the messages through a live region, rendered from the start, empty, and hidden on the
 * screen: `role="status"` (`aria-live="polite"`), or `role="alert"` (`aria-live="assertive"`) with the `error`
 * modifier. Shown, the toaster writes its messages in it; hidden, it empties it. The toasts on the screen are
 * `aria-hidden`: the live region holds the same text. The toaster never takes the focus.
 *
 * The countdown of `displayToast()` pauses while the pointer is over the toasts or the focus is in the toaster, and starts
 * again, from `closingDelay`, when they leave it (WCAG 2.2.1, Timing Adjustable).
 */
@Component({
  tag: 'ds-toaster',
  styleUrl: 'toaster.scss',
})
export class DSToaster {
  @Element() host: HTMLDsToasterElement;

  container: HTMLDivElement;
  closingTimer: ReturnType<typeof setTimeout>;
  /** Whether the countdown of `displayToast()` runs, or is paused: once over, it hides the toaster. */
  private isClosing = false;
  /** Whether the pointer is over the toasts: the countdown pauses. */
  private isHovered = false;
  /** Whether the focus is in the toaster: the countdown pauses. */
  private hasFocus = false;
  /** The wait for the end of the fade in or out, while it runs. */
  private fade: TransitionWait;
  /** Whether the duration of the fade was read, once its state was rendered. */
  private isFadeMeasured = false;

  /**
   * Vertical then horizontal position: `[TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION]`,
   * or as an attribute a comma-separated string (`position="bottom,right"`).
   * Vertical: `top`, `middle`, `bottom`; horizontal: `left`, `center`, `right`.
   */
  @Prop({ mutable: true, reflect: true }) position: string | [TOASTER_VERTICAL_POSITION, TOASTER_HORIZONTAL_POSITION] = [
    TOASTER_VERTICAL_POSITION.TOP,
    TOASTER_HORIZONTAL_POSITION.LEFT,
  ];
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /** The messages, one toast each, from the oldest to the newest: an array, or a comma-separated string. */
  @Prop({ mutable: true, reflect: true }) messages: string | string[];
  /**
   * Maximum number of toasts displayed: the last `maxDisplayedToast` messages, the oldest ones are dropped first.
   * `0` displays them all.
   */
  @Prop({ reflect: true }) maxDisplayedToast = 3;
  /**
   * Delay in ms before `displayToast()` hides the toaster; `0` keeps it shown. The countdown pauses while the pointer is
   * over the toasts or the focus is in the toaster, and starts again from this delay when they leave it. Leave the time to
   * read the messages: 5000 at least for a sentence, more for a longer text (see the Accessibility section of the readme).
   */
  @Prop() closingDelay = 3000;

  @State() isShown = false;

  @Event() toasterShow: EventEmitter;
  @Event() toasterShown: EventEmitter;
  @Event() toasterHide: EventEmitter;
  @Event() toasterHidden: EventEmitter;

  /**
   * Shows the toaster, then hides it after `closingDelay` ms (counted from the last call). The countdown pauses while the
   * pointer is over the toasts or the focus is in the toaster, and starts again from `closingDelay` when they leave it.
   */
  @Method()
  async displayToast() {
    this.show();
    this.isClosing = Number(this.closingDelay) !== 0;
    this.startCountdown();
  }

  @Method()
  async show() {
    if (!this.isShown) {
      this.toasterShow.emit();
      this.waitForFade();
      this.isShown = true;
    }
  }

  @Method()
  async hide() {
    // A hidden toaster is neither under the pointer nor focused: a later displayToast() counts down at once.
    this.isHovered = false;
    this.hasFocus = false;
    if (this.isShown) {
      this.toasterHide.emit();
      this.waitForFade();
      this.isShown = false;
    }
  }

  constructor() {
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  componentDidRender() {
    // The fade starts with the render of the new state: its duration is read from the new style.
    if (this.fade && !this.isFadeMeasured) {
      this.isFadeMeasured = true;
      this.fade.measure();
    }
  }

  /** The pointer over the toasts (the rest of the toaster lets it through) pauses the countdown of `displayToast()`. */
  @Listen('mouseenter')
  mouseEnterHandler() {
    this.isHovered = true;
    clearTimeout(this.closingTimer);
  }

  @Listen('mouseleave')
  mouseLeaveHandler() {
    this.isHovered = false;
    this.startCountdown();
  }

  /** The focus in the toaster pauses the countdown of `displayToast()`, until it leaves the toaster. */
  @Listen('focusin')
  focusInHandler() {
    this.hasFocus = true;
    clearTimeout(this.closingTimer);
  }

  @Listen('focusout')
  focusOutHandler(event: FocusEvent) {
    const to = event.relatedTarget as Node | null;
    if (!(to && this.host.contains(to))) {
      this.hasFocus = false;
      this.startCountdown();
    }
  }

  disconnectedCallback() {
    clearTimeout(this.closingTimer);
    this.fade?.cancel();
    this.fade = undefined;
  }

  /**
   * Emits `toasterShown` or `toasterHidden` (the state at that time) at the end of the fade that the state change starts:
   * on the toaster's own `transitionend` event (several properties may end it, not the ones of its content), or at once
   * when it does not fade (durations of 0, less motion without the theme), or when its duration is over if the event does
   * not come. A new change cancels the wait.
   */
  waitForFade() {
    this.fade?.cancel();
    this.fade = waitForTransition(this.container, () => {
      this.fade = undefined;
      this[`toaster${this.isShown ? 'Shown' : 'Hidden'}`].emit();
    });
    this.isFadeMeasured = false;
  }

  /**
   * Starts the countdown of `displayToast()` again, from `closingDelay`, unless it is paused (the pointer over the toasts,
   * the focus in the toaster) or there is none: once over, it hides the toaster. A fresh delay rather than the time that
   * was left: the user who paused it was reading, and the toasts never vanish as the pointer or the focus leaves them.
   */
  private startCountdown() {
    clearTimeout(this.closingTimer);
    if (this.isClosing && !this.isHovered && !this.hasFocus) {
      this.closingTimer = setTimeout(() => {
        this.isClosing = false;
        this.hide();
      }, Number(this.closingDelay));
    }
  }

  /** The messages displayed: the last `maxDisplayedToast` ones (all of them for `0`). */
  getDisplayedMessages(): string[] {
    const messages = toArray(this.messages ?? []);
    const max = Number(this.maxDisplayedToast);

    return max > 0 ? messages.slice(-max) : messages;
  }

  /** Whether the messages are errors (the `error` modifier): the live region is then an assertive `alert`. */
  isAlert(): boolean {
    return toArray(this.mods ?? []).some(mod => String(mod).trim() === 'error');
  }

  render() {
    const [verticalPosition, horizontalPosition] = toArray(this.position).map(position => position.trim());
    const displayedMessages = this.getDisplayedMessages();
    // The index of each displayed message among all of them: a message added while shown is a new element of the live
    // region, the only one announced (the other ones do not change).
    const firstIndex = toArray(this.messages ?? []).length - displayedMessages.length;
    const isAlert = this.isAlert();

    return (
      <div
        class={{
          ...toClassList('ds-toaster', this.mods),
          [`--v-pos-${verticalPosition}`]: true,
          [`--h-pos-${horizontalPosition}`]: true,
          '--shown': this.isShown,
          '--hidden': !this.isShown,
        }}
        ref={el => {
          this.container = el as HTMLDivElement;
        }}
        onClick={this.hide}
      >
        <div class="ds-toaster__container" aria-hidden="true">
          {displayedMessages.map(message => (
            <div class="ds-toaster__toast">
              <div class="ds-toaster__content">
                <span class="ds-toaster__message">{message}</span>
              </div>
            </div>
          ))}
        </div>
        <div class="ds-toaster__live" role={isAlert ? 'alert' : 'status'} aria-live={isAlert ? 'assertive' : 'polite'} aria-atomic="false">
          {this.isShown && displayedMessages.map((message, index) => <p key={firstIndex + index}>{message}</p>)}
        </div>
      </div>
    );
  }
}
