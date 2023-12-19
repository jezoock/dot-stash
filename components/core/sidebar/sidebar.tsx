import { Component, Element, h, Host, Prop, Method, Event, EventEmitter, Watch } from "@stencil/core";
import CssClassList from "../../types/css-class-list.interface";
import _ds from "../../../typescript/dot-stash";
import SIDEBAR_POSITION from "../../types/sidebar-position.enum";

@Component({
  tag: "ds-sidebar",
  styleUrls: [
    "sidebar.scss",
  ]
})
export class DSSidebar {

  //#region PROPS

  CSSClassList: CssClassList;

  @Element() container: HTMLDsSidebarElement;

  @Prop({ reflect: true }) ctx = true;
  @Prop({ mutable: true, reflect: true }) isShown = false;
  @Prop({ reflect: true }) mods: string | string[] = "";
  @Prop({ reflect: true }) position: string | 'left' | 'right' | 'top' | 'bottom' = SIDEBAR_POSITION.RIGHT;

  //#endregion

  //#region WATCHERS

  @Watch("mods")
  modsChangeHandler(newMods: string | string[]) {
    this.computeCSSClasslist(newMods);
  }

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
   * @param mustShow Used to specify wether the sidebar must be shown or hidden
   */
  @Method()
  async toggle( mustShow?: boolean ) {
    const methodName = (typeof mustShow === "boolean" && mustShow || !this.isShown) ? 'show' : 'hide'
    this[ methodName ]();
  }
  
  /**
   * Show the sidebar
   */
  @Method()
  async show() {
    this.containerRefresh();
    this.sidebarShow.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = true;
    
  }
  
  /**
   * Hide the sidebar
   */
  @Method()
  async hide() {
    this.sidebarHide.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = false;
  }

  //#endregion
  
  //#region TOOLS
  
  computeCSSClasslist(modifiers: string | string[]) {
    this.CSSClassList = _ds.props.toClassList("ds-sidebar", modifiers);
  }

  containerRefresh() {
    const windowHeight = window.innerHeight;
    const containerOffset = this.container.offsetTop;
    const newHeight = windowHeight - containerOffset;

    this.container.style.height = `${newHeight}px`;
  }

  preventScroll(event: Event) {
    event.preventDefault();
  }
  
  //#endregion

  //#region LYFECYCLE

  constructor() {
    this.animationEndHandler = this.animationEndHandler.bind(this);
  }

  connectedCallback() {
    this.container.addEventListener(
      "touchmove",
      this.preventScroll,
      { passive: true }
    );
  }

  componentWillLoad() {
    this.computeCSSClasslist(this.mods);
  }

  disconnectedCallback() {
    this.container.removeEventListener(
      "touchmove",
      this.preventScroll
    );
  }

  //#region 

  //#region HANDLERS

  animationEndHandler() {
    this.container.removeEventListener("transitionend", this.animationEndHandler);
    const eventName = `sidebar${this.isShown ? 'Shown' : 'Hidden'}`;
    this[ eventName ].emit();
  }  

  //#endregion

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          "--shown": this.isShown,
          "--hidden": !this.isShown,
          [`--${this.position}`]: true
        }}
        
      >
        <div class="ds-sidebar__content">
          <slot />
        </div>
      </Host>
    );
  }
}
