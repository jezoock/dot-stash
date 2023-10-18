import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

/**
 * Tooltip position enum
 */
var TooltipPosition;
(function (TooltipPosition) {
  TooltipPosition["TOP"] = "top";
  TooltipPosition["TOP_LEFT"] = "top-left";
  TooltipPosition["TOP_RIGHT"] = "top-right";
  TooltipPosition["BOTTOM"] = "bottom";
  TooltipPosition["BOTTOM_LEFT"] = "bottom-left";
  TooltipPosition["BOTTOM_RIGHT"] = "bottom-right";
  TooltipPosition["LEFT"] = "left";
  TooltipPosition["RIGHT"] = "right";
})(TooltipPosition || (TooltipPosition = {}));

const tooltipCss = "ds-tooltip>[slot]{display:none}.ds-tooltip{display:inline-flex;position:relative;white-space:normal;width:min-content;align-content:center;justify-content:center}.ds-tooltip__content{display:flex;width:100%}.ds-tooltip__content>span{white-space:nowrap}.ds-tooltip [slot=message]{display:none;position:absolute;padding:0.75rem;line-height:1.3rem;background-color:snk-color(primary, base);color:colorSet(white-outline, text-color);font-size:1rem;z-index:1000;width:220px;font-weight:600;border-radius:0.5rem;letter-spacing:0.28px;text-align:left}.ds-tooltip [slot=message]:after{background-color:snk-color(primary, base);border-radius:0.5rem;content:\"\";display:block;position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1}.ds-tooltip.--icon{margin:0 0.5rem}.ds-tooltip.--icon:before{content:\"\";width:1rem;font-weight:300;font-size:1rem}.ds-tooltip.--icon.--search:before{}.ds-tooltip.--icon.--lock:before{}.ds-tooltip.--icon.--info:before{}.ds-tooltip.--icon.--info.--payment-method{position:static;width:auto}.ds-tooltip.--icon.--info.--payment-method .ds-tooltip__message{left:15px;right:15px;top:1.25rem;bottom:auto;transform:translate3d(0%, -100%, 0)}.ds-tooltip.--icon.--locked:before{}.ds-tooltip.--icon.--pink-lock:before{}.ds-tooltip.--top [slot=message]{bottom:calc(100% + 10px);left:50%;transform:translateX(-50%)}.ds-tooltip.--top-left [slot=message]{bottom:calc(100% + 10px);left:50%;transform:translateX(-10%)}.ds-tooltip.--top-right [slot=message]{bottom:calc(100% + 10px);left:50%;transform:translateX(-85%)}.ds-tooltip.--bottom [slot=message]{top:calc(100% + 10px);left:50%;transform:translateX(-50%)}.ds-tooltip.--bottom-left [slot=message]{top:calc(100% + 10px);left:15%;transform:translateX(-5%)}.ds-tooltip.--bottom-right [slot=message]{top:calc(100% + 10px);left:15%;transform:translateX(-85%)}.ds-tooltip.--left [slot=message]{right:calc(100% + 10px);top:-50%;transform:translateY(-50%)}.ds-tooltip.--right [slot=message]{left:calc(100% + 10px);top:50%;transform:translateY(-50%)}.ds-tooltip.--with-arrow:after{content:\"\";display:none;position:absolute;width:25px;height:25px;background-image:url(\"./tooltipArrow.svg\");background-repeat:no-repeat;background-position:center;background-size:1.5rem;z-index:10}.ds-tooltip.--with-arrow.--top:after{top:0;left:50%;transform:translate3d(-50%, -100%, 0) rotate(180deg)}.ds-tooltip.--with-arrow.--top-left:after{top:0;left:0;transform:translate3d(-20%, -100%, 0) rotate(180deg)}.ds-tooltip.--with-arrow.--top-right:after{top:0;right:0;transform:translate3d(20%, -100%, 0) rotate(180deg)}.ds-tooltip.--with-arrow.--bottom:after{bottom:0;left:50%;transform:translate3d(-50%, 100%, 0)}.ds-tooltip.--with-arrow.--bottom-left:after{bottom:0;left:0;transform:translate3d(-20%, 100%, 0)}.ds-tooltip.--with-arrow.--bottom-right:after{bottom:0;right:0;transform:translate3d(20%, 100%, 0)}.ds-tooltip.--with-arrow.--left:after{left:0;top:50%;transform:translate3d(-100%, -50%, 0) rotate(90deg)}.ds-tooltip.--with-arrow.--right:after{right:0;top:50%;transform:translate3d(100%, -50%, 0) rotate(-90deg)}.ds-tooltip.--is-shown.--top:after,.ds-tooltip.--is-shown.--top-left:after,.ds-tooltip.--is-shown.--top-right:after,.ds-tooltip.--is-shown.--bottom:after,.ds-tooltip.--is-shown.--bottom-left:after,.ds-tooltip.--is-shown.--bottom-right:after,.ds-tooltip.--is-shown.--left:after,.ds-tooltip.--is-shown.--right:after{display:block}.ds-tooltip.--is-shown [slot=message]{display:block}";

const DSTooltip = /*@__PURE__*/ proxyCustomElement(class DSTooltip extends HTMLElement {
  modsChangeHandler() {
    this.computeCSSClasslist();
  }
  request_tooltipShow_eventHandler() {
    this.toggle(true);
  }
  request_tooltipHide_eventHandler() {
    this.toggle(false);
  }
  request_tooltipToggle_eventHandler({ detail: { mustShow } }) {
    this.toggle(mustShow);
  }
  //#region TOOLS
  computeCSSClasslist() {
    this.CSSClassList = _ds.props.toClassList("ds-tooltip", this.mods);
  }
  //#endregion
  constructor() {
    super();
    this.__registerHost();
    this.isTouchMobile = "ontouchstart" in window;
    this.tooltipHandler = (event) => {
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
      }
      else {
        this.toggle();
      }
    };
    this.icon = "";
    this.mode = undefined;
    this.position = TooltipPosition.TOP;
    this.isDisabled = false;
    this.hasArrow = true;
    this.isActive = true;
    this.mods = "";
    this.containerSelector = "";
    this.isShown = false;
    this.tooltipHandler = this.tooltipHandler.bind(this);
  }
  componentWillLoad() {
    this.computeCSSClasslist();
  }
  componentDidRender() {
    if (!!this.containerSelector && this.isShown) {
      const messageLayer = this.container.querySelector("[slot='message']");
      const limitContainer = document.querySelector(this.containerSelector);
      if (messageLayer && limitContainer) {
        /* Horizontal positionning for only 2 positions */
        /* Need to split position prop in 2 props => vertical-position, horizontal-position */
        if ([TooltipPosition.TOP, TooltipPosition.BOTTOM].includes(this.position)) {
          const messageLayerWidth = messageLayer.offsetWidth;
          const messageLayerOffset = messageLayer.getBoundingClientRect().left;
          const limitContainerWidth = limitContainer.offsetWidth;
          const limitContainerOffset = limitContainer.getBoundingClientRect().left;
          if (messageLayerOffset + messageLayerWidth > limitContainerWidth + limitContainerOffset) {
            messageLayer.style.marginLeft = `${limitContainerWidth + limitContainerOffset - (messageLayerOffset + messageLayerWidth)}px`;
          }
          else if (messageLayerOffset < limitContainerOffset) {
            messageLayer.style.marginLeft = `${-(messageLayerOffset - limitContainerOffset)}px`;
          }
        }
      }
    }
  }
  toggle(isShown) {
    this.isShown = typeof isShown === "boolean" ? isShown : !this.isShown;
  }
  render() {
    return (h("div", { class: Object.assign(Object.assign({}, this.CSSClassList), { "--is-shown": this.isShown, "--icon": !!this.icon, [`--${this.icon}`]: this.icon !== "", "--disabled": this.isDisabled, "--with-arrow": this.hasArrow, [`--${this.position}`]: true }), onMouseOver: this.tooltipHandler, onMouseOut: this.tooltipHandler, onTouchEnd: this.tooltipHandler }, h("div", { class: "ds-tooltip__content" }, h("slot", null)), h("slot", { name: "message" })));
  }
  get container() { return this; }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
  static get style() { return tooltipCss; }
}, [4, "ds-tooltip", {
    "icon": [1],
    "mode": [1],
    "position": [1],
    "isDisabled": [1540, "disabled"],
    "hasArrow": [1028, "has-arrow"],
    "isActive": [1028, "is-active"],
    "mods": [1537],
    "containerSelector": [1025, "container-selector"],
    "isShown": [32]
  }, [[0, "request_tooltipShow_event", "request_tooltipShow_eventHandler"], [0, "request_tooltipHide_event", "request_tooltipHide_eventHandler"], [0, "request_tooltipToggle_event", "request_tooltipToggle_eventHandler"]]]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-tooltip"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-tooltip":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSTooltip);
      }
      break;
  } });
}

const DsTooltip = DSTooltip;
const defineCustomElement = defineCustomElement$1;

export { DsTooltip, defineCustomElement };

//# sourceMappingURL=ds-tooltip.js.map