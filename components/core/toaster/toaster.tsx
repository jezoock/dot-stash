import { Component, h, Method, State, Prop, Event, EventEmitter } from '@stencil/core';
import { toArray, toClassList } from '../../utils/props';
import { TOASTER_HORIZONTAL_POSITION, TOASTER_VERTICAL_POSITION } from './toaster-positions.enum';

/**
 * Toast messages in a fixed box. Hidden until `show()` or `displayToast()`; a click hides it.
 * The `--shown` / `--hidden` classes fade it in and out: `toasterShown` and `toasterHidden` are emitted
 * at the end of that transition.
 */
@Component({
  tag: 'ds-toaster',
  styleUrl: 'toaster.scss',
})
export class DSToaster {
  container: HTMLDivElement;
  closingTimer: ReturnType<typeof setTimeout>;

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
  /** Delay in ms before `displayToast()` hides the toaster; `0` keeps it shown. */
  @Prop() closingDelay = 3000;

  @State() isShown = false;

  @Event() toasterShow: EventEmitter;
  @Event() toasterShown: EventEmitter;
  @Event() toasterHide: EventEmitter;
  @Event() toasterHidden: EventEmitter;

  /** Shows the toaster, then hides it after `closingDelay` ms (counted from the last call). */
  @Method()
  async displayToast() {
    this.show();
    clearTimeout(this.closingTimer);
    if (this.closingDelay !== 0) {
      this.closingTimer = setTimeout(() => {
        this.hide();
      }, this.closingDelay);
    }
  }

  @Method()
  async show() {
    if (!this.isShown) {
      this.toasterShow.emit();
      this.container.addEventListener('transitionend', this.animationEndHandler);
      this.isShown = true;
    }
  }

  @Method()
  async hide() {
    if (this.isShown) {
      this.toasterHide.emit();
      this.container.addEventListener('transitionend', this.animationEndHandler);
      this.isShown = false;
    }
  }

  constructor() {
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.animationEndHandler = this.animationEndHandler.bind(this);
  }

  disconnectedCallback() {
    clearTimeout(this.closingTimer);
    this.container?.removeEventListener('transitionend', this.animationEndHandler);
  }

  //#region HANDLERS

  animationEndHandler(event: Event) {
    // Only the toaster's own transition (several properties may end it), not the ones of its content.
    if (event.target === this.container) {
      this.container.removeEventListener('transitionend', this.animationEndHandler);
      this[`toaster${this.isShown ? 'Shown' : 'Hidden'}`].emit();
    }
  }

  //#endregion

  /** The messages displayed: the last `maxDisplayedToast` ones (all of them for `0`). */
  getDisplayedMessages(): string[] {
    const messages = toArray(this.messages ?? []);
    const max = Number(this.maxDisplayedToast);

    return max > 0 ? messages.slice(-max) : messages;
  }

  render() {
    const [verticalPosition, horizontalPosition] = toArray(this.position).map(position => position.trim());

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
        <div class="ds-toaster__container">
          {this.getDisplayedMessages().map(message => (
            <div class="ds-toaster__toast">
              <div class="ds-toaster__content">
                <span class="ds-toaster__message">{message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
