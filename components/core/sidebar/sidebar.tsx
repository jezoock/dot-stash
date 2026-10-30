import { Component, Element, h, Host, Prop, Method, Event, EventEmitter } from '@stencil/core';
import { toClassList } from '../../utils/props';
import SIDEBAR_POSITION from '../../utils/interfaces/sidebar-position';

@Component({
  tag: 'ds-sidebar',
  styleUrls: ['sidebar.scss'],
})
export class DSSidebar {
  //#region PROPS

  @Element() container: HTMLDsSidebarElement;

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
      this.container.addEventListener('transitionend', this.animationEndHandler);
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
      this.container.addEventListener('transitionend', this.animationEndHandler);
      this.isShown = false;
    }
  }

  //#endregion

  //#region TOOLS

  containerRefresh() {
    const windowHeight = window.innerHeight;
    const containerOffset = this.container.offsetTop;
    const newHeight = windowHeight - containerOffset;

    this.container.style.height = `${newHeight}px`;
  }

  //#endregion

  //#region LYFECYCLE

  constructor() {
    this.animationEndHandler = this.animationEndHandler.bind(this);
  }

  disconnectedCallback() {
    this.container.removeEventListener('transitionend', this.animationEndHandler);
  }

  //#endregion

  //#region HANDLERS

  animationEndHandler(event: Event) {
    // Only the sidebar's own transition, not the ones of its content.
    if (event.target === this.container) {
      this.container.removeEventListener('transitionend', this.animationEndHandler);
      const eventName = `sidebar${this.isShown ? 'Shown' : 'Hidden'}`;
      this[eventName].emit();
    }
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
