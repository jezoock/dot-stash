import { Component, h, Prop, Listen, Event, EventEmitter, Watch } from "@stencil/core";
import CssClassList from "../types/css-class-list.interface";
import _ds from "../../typescript/dot-stash";
import SIDEBAR_POSITION from "../types/sidebar-position.enum";

@Component({
  tag: "ds-sidebar",
  styleUrls: [
    "sidebar.scss",
  ]
})
export class DSSidebar {

  //#region PROPS

  @Prop({ mutable: true, reflect: true }) isShown = false;
  @Prop({ mutable: true, reflect: true }) position: string | 'left' | 'right' | 'top' | 'bottom' = SIDEBAR_POSITION.RIGHT;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = "";

  container: HTMLDivElement;
  CSSClassList: CssClassList;

  @Watch("mods")
  modsWatcher() {
    this.computeCSSClasslist();
  }

  //#endregion

  //#region EVENTS
  
  @Event() sidebarHide: EventEmitter;
  @Event() sidebarHidden: EventEmitter;
  @Event() sidebarShow: EventEmitter;
  @Event() sidebarShown: EventEmitter;

  @Listen("request_sidebarShow_event")
  request_sidebarShow_eventHandler() {
    this.show();
  }
  
  @Listen("request_sidebarHide_event")
  request_sidebarHide_eventHandler() {
    this.hide();
  }

  @Listen("request_sidebarToggle_event")
  request_sidebarToggle_eventHandler({ detail: { mustShow }}) {
    this.toggle(mustShow);
  }

  //#endregion
  
  //#region TOOLS
  
  computeCSSClasslist() {
    this.CSSClassList = _ds.props.toClassList("ds-sidebar", this.mods);
  }
  
  //#endregion

  //#region LYFECYCLE

  constructor() {
    this.animationEndHandler = this.animationEndHandler.bind(this);
  }

  componentWillLoad() {
    this.computeCSSClasslist();
  }

  componentDidLoad() {
    this.container.addEventListener(
      "touchmove",
      evt => evt.stopPropagation(),
      { passive: true }
    );
  }

  //#region 

  //#region DISPLAY MANAGMENT

  containerRefresh() {
    const windowHeight = window.innerHeight;
    const containerOffset = this.container.offsetTop;
    const newHeight = windowHeight - containerOffset;

    this.container.style.height = `${newHeight}px`;
  }

  toggle( mustShow: boolean ): void {
    let { isShown } = this;
    
    if (typeof mustShow === "boolean") {
      isShown = mustShow;
    } else {
      isShown = !isShown;
    }

    this[ isShown ? 'show' : 'hide' ]();
  }
  
  show() {
    this.containerRefresh();
    this.sidebarShow.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = true;
    
  }
  
  hide() {
    this.sidebarHide.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = false;
  }

  //#endregion

  //#region HANDLERS

  animationEndHandler() {
    this.container.removeEventListener("transitionend", this.animationEndHandler);
    this[ `sidebar${this.isShown ? 'Shown' : 'Hidden'}` ].emit();
  }  

  //#endregion

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          "--shown": this.isShown,
          "--hidden": !this.isShown,
          [`--${this.position}`]: true
        }}
        ref={el => this.container = el}
      >
        <div class="ds-sidebar__content">
          <slot />
        </div>
      </div>
    );
  }
}
