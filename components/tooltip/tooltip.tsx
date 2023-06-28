import { Component, Element, h, Listen, Prop, State, Watch } from "@stencil/core";
import { AnyHTMLElement } from "@stencil/core/internal";
import { TooltipPosition } from "./tooltip-position.enum";
import CssClassList from "../types/css-class-list.interface";
import _ds from "../../typescript/dot-stash";
/**
 * Simple icon tooltip component
 *
 * @slot message - slot to put message in
 * @slot content slot
 */
@Component({
  tag: "ds-tooltip",
  styleUrl: "tooltip.scss",
})
export class DSTooltip {

  @Element() container: HTMLDivElement;

  /**
   * Displayed tooltip icon
   */
  @Prop() icon = "";
  /**
   * Used for applying modifier on main container
   */
  @Prop() mode: string;

  /**
   * @type {string} Tooltip position (top, left, right or bottom)
   */
  @Prop() position: TooltipPosition = TooltipPosition.TOP;

  /**
   * @type {boolean} isDisabled( attr => disabled ) Specify wether the tooltip is disabled or not
   */
  @Prop({ mutable: true, reflect: true, attribute: "disabled" }) isDisabled = false;
  @Prop({ mutable: true }) hasArrow = true;
  @Prop({ mutable: true }) isActive = true;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = "";
  @Prop({ mutable: true }) containerSelector = "";

  @State() isShown = false;

  private isTouchMobile: boolean = "ontouchstart" in window;
  CSSClassList: CssClassList;

  @Watch("mods")
  modsWatcher() {
    this.computeCSSClasslist();
  }

  @Listen("request_tooltipShow_event")
  request_tooltipShow_eventHandler() {
    this.toggle(true);
  }
  @Listen("request_tooltipHide_event")
  request_tooltipHide_eventHandler() {
    this.toggle(false);
  }

  @Listen("request_tooltipToggle_event")
  request_tooltipToggle_eventHandler({ detail: { mustShow } }) {
    this.toggle(mustShow);
  }

  //#region TOOLS

  computeCSSClasslist() {
    this.CSSClassList = _ds.props.toClassList("ds-tooltip", this.mods);
  }

  //#endregion

  public constructor() {
    this.tooltipHandler = this.tooltipHandler.bind(this);
  }

  protected componentWillLoad() {
    this.computeCSSClasslist();
  }

  componentDidRender() {
    if (!!this.containerSelector && this.isShown) {
      const messageLayer = this.container.querySelector("[slot='message']") as HTMLDivElement;
      const limitContainer = document.querySelector( this.containerSelector ) as AnyHTMLElement;
      if (messageLayer && limitContainer) {

        /* Horizontal positionning for only 2 positions */
        /* Need to split position prop in 2 props => vertical-position, horizontal-position */
        if ( [ TooltipPosition.TOP, TooltipPosition.BOTTOM ].includes(this.position) ) {
          const messageLayerWidth = messageLayer.offsetWidth;
          const messageLayerOffset = messageLayer.getBoundingClientRect().left;
          const limitContainerWidth = limitContainer.offsetWidth;
          const limitContainerOffset = limitContainer.getBoundingClientRect().left;
    
          if (messageLayerOffset+messageLayerWidth > limitContainerWidth + limitContainerOffset) {
            messageLayer.style.marginLeft = `${limitContainerWidth + limitContainerOffset - (messageLayerOffset+messageLayerWidth)}px`;
          } else if (messageLayerOffset < limitContainerOffset) {
            messageLayer.style.marginLeft = `${-(messageLayerOffset - limitContainerOffset)}px`;
          }
        }

      }
    }
  }
  
  private toggle(isShown?: boolean): void {
    this.isShown = typeof isShown === "boolean" ? isShown : !this.isShown;
  }

  private tooltipHandler = (event: Event) => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    if (this.isTouchMobile) {
      if (event.type === "mouseover" || event.type === "mouseout") {
        event.preventDefault();
      }
      if (event.type === "touchend") {
        this.toggle();
      }
    } else {
      this.toggle();
    }
  };

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          "--is-shown": this.isShown,
          "--icon": !!this.icon,
          [`--${this.icon}`]: this.icon !== "",
          "--disabled": this.isDisabled,
          "--with-arrow": this.hasArrow,
          [`--${this.position}`]: true,
        }}
        onMouseOver={this.tooltipHandler}
        onMouseOut={this.tooltipHandler}
        onTouchEnd={this.tooltipHandler}
      >
        <div class="gbx-tooltip__content">
          <slot />
        </div>
        <slot name="message" />
      </div>
    );
  }
}
