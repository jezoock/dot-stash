import { Component, Element, h, Host, Prop, Method, Event, EventEmitter } from '@stencil/core';
import { toClassList } from '../../utils/props';
import SIDEBAR_POSITION from '../../utils/interfaces/sidebar-position';
import { TransitionWait, waitForTransition } from '../../utils/transition';
import { focusFirstElement, getFocusedElement } from '../../utils/focus';

/**
 * A panel fixed on a side of the screen, that slides in (`show()`) and out (`hide()`). Not modal: the page stays usable
 * while it is shown. It is a `complementary` landmark (or the `role` its element has, such as `navigation`), named by
 * `label` (`aria-label`). Hidden, it is inert: its content is neither focusable nor read by screen readers. `show()`
 * moves the focus into it (its first element with `autofocus`, else its first focusable element, else the sidebar
 * itself); Escape hides it while the focus is in it; `hide()` gives the focus back to the element that had it before.
 */
@Component({
  tag: 'ds-sidebar',
  styleUrls: ['sidebar.scss'],
})
export class DSSidebar {
  //#region PROPS

  @Element() container: HTMLDsSidebarElement;

  /** The wait for the end of the slide in or out, while it runs. */
  private slide: TransitionWait;
  /** Whether the duration of the slide was read, once its state was rendered. */
  private isSlideMeasured = false;

  @Prop({ reflect: true }) ctx = true;
  @Prop({ mutable: true, reflect: true }) isShown = false;
  @Prop({ reflect: true }) hPos: 'left' | 'right' = SIDEBAR_POSITION.LEFT;
  @Prop({ reflect: true }) vPos: 'top' | 'bottom' = SIDEBAR_POSITION.TOP;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /** The accessible name of the sidebar (`aria-label`), which tells it from the other landmarks of the page. */
  @Prop() label: string;

  /** The element that had the focus when `show()` was called: it gets it back from `hide()`. */
  private returnFocusElement: HTMLElement | null = null;
  /** Whether the focus must move into the sidebar once it is rendered shown. */
  private needsFocus = false;

  //#endregion

  //#region EVENTS

  @Event() sidebarHide: EventEmitter;
  @Event() sidebarHidden: EventEmitter;
  @Event() sidebarShow: EventEmitter;
  @Event() sidebarShown: EventEmitter;

  //#endregion

  //#region METHODS

  /**
   * Toggle the sidebar display
   * @param mustShow Used to specify wether the sidebar must be shown or hidden; without it, the display is switched
   */
  @Method()
  async toggle(mustShow?: boolean) {
    const shouldShow = typeof mustShow === 'boolean' ? mustShow : !this.isShown;
    await (shouldShow ? this.show() : this.hide());
  }

  /**
   * Show the sidebar (nothing happens when it is already shown), and move the focus into it
   */
  @Method()
  async show() {
    if (!this.isShown) {
      this.containerRefresh();
      this.sidebarShow.emit();
      this.waitForSlide();
      const focused = getFocusedElement();
      this.returnFocusElement = focused && !this.container.contains(focused) ? focused : null;
      this.needsFocus = true;
      this.isShown = true;
    }
  }

  /**
   * Hide the sidebar (nothing happens when it is already hidden), and give the focus back to the element that had it
   * before `show()`, when the focus is in the sidebar
   */
  @Method()
  async hide() {
    if (this.isShown) {
      this.sidebarHide.emit();
      this.waitForSlide();
      this.needsFocus = false;
      this.restoreFocus();
      this.isShown = false;
    }
  }

  //#endregion

  //#region TOOLS

  /**
   * Emits `sidebarShown` or `sidebarHidden` (the state at that time) at the end of the slide that the state change
   * starts: on the `transitionend` event of the sidebar, or at once when it does not slide (a duration of 0, less motion
   * without the theme), or when its duration is over if the event does not come. A new change cancels the wait.
   */
  waitForSlide() {
    this.slide?.cancel();
    this.slide = waitForTransition(this.container, () => {
      this.slide = undefined;
      this[`sidebar${this.isShown ? 'Shown' : 'Hidden'}`].emit();
    });
    this.isSlideMeasured = false;
  }

  /** Gives the focus back to the element that had it before `show()`, if the focus is in the sidebar (or nowhere). */
  restoreFocus() {
    const focused = getFocusedElement();
    const returnFocusElement = this.returnFocusElement;

    this.returnFocusElement = null;
    if (returnFocusElement?.isConnected && (!focused || this.container.contains(focused))) {
      returnFocusElement.focus();
    }
  }

  containerRefresh() {
    const windowHeight = window.innerHeight;
    const containerOffset = this.container.offsetTop;
    const newHeight = windowHeight - containerOffset;

    this.container.style.height = `${newHeight}px`;
  }

  //#endregion

  //#region LYFECYCLE

  componentDidRender() {
    // The slide starts with the render of the new state: its duration is read from the new style.
    if (this.slide && !this.isSlideMeasured) {
      this.isSlideMeasured = true;
      this.slide.measure();
    }

    // Shown by show(): rendered, it is no longer inert and can take the focus. The page does not scroll to it.
    if (this.needsFocus && this.isShown) {
      this.needsFocus = false;
      focusFirstElement(this.container, this.container, { preventScroll: true });
    }
  }

  disconnectedCallback() {
    this.slide?.cancel();
    this.slide = undefined;
  }

  //#endregion

  /** Escape, while the focus is in the sidebar, hides it; the key press goes no further. */
  keyDownHandler = (event: KeyboardEvent) => {
    if (this.isShown && (event.key === 'Escape' || event.key === 'Esc')) {
      event.stopPropagation();
      if (!event.repeat) {
        this.hide();
      }
    }
  };

  render() {
    return (
      <Host
        class={{
          ...toClassList('ds-sidebar', this.mods),
          '--shown': this.isShown,
          '--hidden': !this.isShown,
          [`--h-pos-${this.hPos}`]: true,
          [`--v-pos-${this.vPos}`]: true,
        }}
        // The role of the element when it has one (navigation…), else complementary: a landmark.
        role={this.container.getAttribute('role') || 'complementary'}
        aria-label={this.label}
        tabindex="-1"
        // Hidden: out of the Tab order and of the accessibility tree, at once (the stylesheet hides it at the end of the slide).
        inert={!this.isShown}
        onKeyDown={this.keyDownHandler}
      >
        <div class="ds-sidebar__content">
          <slot />
        </div>
      </Host>
    );
  }
}
