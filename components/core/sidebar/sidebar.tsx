import { Component, h, Prop, Method, Event, EventEmitter, Watch } from "@stencil/core";
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

  @Prop({reflect: true}) ctx = true;
  @Prop({ mutable: true, reflect: true }) isShown = false;
  @Prop({ mutable: true, reflect: true }) position: string | 'left' | 'right' | 'top' | 'bottom' = SIDEBAR_POSITION.RIGHT;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = "";

  container: HTMLDivElement;
  CSSClassList: CssClassList;

  @Watch("mods")
  modsChangeHandler() {
    this.computeCSSClasslist();
  }

  //#endregion

  //#region EVENTS
  
  @Event() sidebarHide: EventEmitter;
  @Event() sidebarHidden: EventEmitter;
  @Event() sidebarShow: EventEmitter;
  @Event() sidebarShown: EventEmitter;

  //#endregion

  @Method()
  async toggle( mustShow: boolean ) {
    let { isShown } = this;
    
    if (typeof mustShow === "boolean") {
      isShown = mustShow;
    } else {
      isShown = !isShown;
    }

    this[ isShown ? 'show' : 'hide' ]();
  }
  
  @Method()
  async show() {
    this.containerRefresh();
    this.sidebarShow.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = true;
    
  }
  
  @Method()
  async hide() {
    this.sidebarHide.emit();
    this.container.addEventListener( "transitionend", this.animationEndHandler);
    this.isShown = false;
  }
  
  //#region TOOLS
  
  computeCSSClasslist() {
    this.CSSClassList = _ds.props.toClassList("ds-sidebar", this.mods);
  }

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
