import { Component, Element, h, Host, Prop, Method, Event, EventEmitter } from '@stencil/core';
import { toClassList } from '../../utils/props';
import SIDEBAR_POSITION from '../../utils/interfaces/sidebar-position';
import { TransitionWait, waitForTransition } from '../../utils/transition';

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
   * Show the sidebar (nothing happens when it is already shown)
   */
  @Method()
  async show() {
    if (!this.isShown) {
      this.containerRefresh();
      this.sidebarShow.emit();
      this.waitForSlide();
      this.isShown = true;
    }
  }

  /**
   * Hide the sidebar (nothing happens when it is already hidden)
   */
  @Method()
  async hide() {
    if (this.isShown) {
      this.sidebarHide.emit();
      this.waitForSlide();
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
  }

  disconnectedCallback() {
    this.slide?.cancel();
    this.slide = undefined;
  }

  //#endregion

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
      >
        <div class="ds-sidebar__content">
          <slot />
        </div>
      </Host>
    );
  }
}
