import { proxyCustomElement, HTMLElement, createEvent, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

var TOASTER_VERTICAL_POSITION;
(function (TOASTER_VERTICAL_POSITION) {
  TOASTER_VERTICAL_POSITION["TOP"] = "top";
  TOASTER_VERTICAL_POSITION["MIDDLE"] = "top";
  TOASTER_VERTICAL_POSITION["BOTTOM"] = "top";
})(TOASTER_VERTICAL_POSITION || (TOASTER_VERTICAL_POSITION = {}));
var TOASTER_HORIZONTAL_POSITION;
(function (TOASTER_HORIZONTAL_POSITION) {
  TOASTER_HORIZONTAL_POSITION["LEFT"] = "left";
  TOASTER_HORIZONTAL_POSITION["CENTER"] = "center";
  TOASTER_HORIZONTAL_POSITION["RIGHT"] = "right";
})(TOASTER_HORIZONTAL_POSITION || (TOASTER_HORIZONTAL_POSITION = {}));

const toasterCss = ".ds-toaster{position:fixed;z-index:10000;pointer-events:none}.ds-toaster__container{box-sizing:border-box;display:block;max-width:50vw;min-width:500px;padding:1.25rem;min-height:3rem;transform-origin:center;background-color:color(color-2, dark);color:#fff;box-shadow:0 0 10px rgba(0, 0, 0, 0.6);pointer-events:initial;font-size:1rem}.ds-toaster__container--valid{background-color:color(valid)}.ds-toaster__container--warning{background-color:color(warning)}.ds-toaster__container--error{background-color:color(error)}.ds-toaster__content{display:flex;justify-content:space-between;align-items:center;height:100%;line-height:20px}.ds-toaster__message--valid{color:white}.ds-toaster__message--warning{color:white}.ds-toaster__message--error{color:white}.ds-toaster__container--valid .ds-toaster__message--valid,.ds-toaster__container--valid .ds-toaster__message--warning,.ds-toaster__container--valid .ds-toaster__message--error{color:#fff}.ds-toaster__action{flex-shrink:0;margin:-0.5rem -0.5rem -0.5rem 0.5rem}.ds-toaster__action .ds-toaster__close-button{color:#fff;max-height:2.25rem;min-width:0;border:0;background:none}.ds-toaster--position-vertical-top{top:0;-webkit-animation:fadeinTop 0.5s;animation:fadeinTop 0.5s}.ds-toaster--position-vertical-bottom{bottom:0;-webkit-animation:fadeinBottom 0.5s;animation:fadeinBottom 0.5s}.ds-toaster--position-horizontal-left{left:0}.ds-toaster--position-horizontal-right{right:0}.ds-toaster--position-horizontal-center{left:50%;transform:translateX(-50%)}@-webkit-keyframes fadeinBottom{from{bottom:-100px;opacity:0}to{bottom:0;opacity:1}}@keyframes fadeinBottom{from{bottom:-100px;opacity:0}to{bottom:0;opacity:1}}@-webkit-keyframes fadeinTop{from{top:-100px;opacity:0}to{top:0;opacity:1}}@keyframes fadeinTop{from{top:-100px;opacity:0}to{top:0;opacity:1}}";

const DSToaster = /*@__PURE__*/ proxyCustomElement(class DSToaster extends HTMLElement {
  modsChangeHandler(mods) {
    this.CSSClassList = _ds.props.toClassList("ds-title", _ds.props.toArray(mods));
  }
  async displayToast() {
    this.show();
    if (this.closingDelay !== 0) {
      setTimeout(() => {
        this.hide();
      }, this.closingDelay);
    }
  }
  async show() {
    this.toasterShow.emit();
    this.container.addEventListener("transitionend", this.animationEndHandler);
    this.isShown = true;
  }
  async hide() {
    this.toasterHide.emit();
    this.container.addEventListener("transitionend", this.animationEndHandler);
    this.isShown = false;
  }
  constructor() {
    super();
    this.__registerHost();
    this.toasterShow = createEvent(this, "toasterShow", 7);
    this.toasterShown = createEvent(this, "toasterShown", 7);
    this.toasterHide = createEvent(this, "toasterHide", 7);
    this.toasterHidden = createEvent(this, "toasterHidden", 7);
    this.toastClickHandler = () => { console.log("click"); };
    this.position = [TOASTER_VERTICAL_POSITION.TOP, TOASTER_HORIZONTAL_POSITION.LEFT];
    this.mods = "";
    this.messages = undefined;
    this.maxDisplayedToast = 3;
    this.closingDelay = 3000;
    this.isShown = false;
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-toaster", _ds.props.toArray(this.mods));
  }
  //#region HANDLERS
  animationEndHandler() {
    this.container.removeEventListener("transitionend", this.animationEndHandler);
    this[`toaster${this.isShown ? 'Shown' : 'Hidden'}`].emit();
  }
  //#endregion
  render() {
    return (h("div", { class: {
        "ds-toaster": true,
        [`--v-pos-${this.position[0]}`]: true,
        [`--h-pos-${this.position[1]}`]: true,
      }, ref: el => {
        this.container = el;
      }, onClick: this.hide }, h("div", { class: `ds-toaster__container` }, _ds.props.toArray(this.messages).map(message => h("ds-toast", { onClick: this.toastClickHandler }, message)))));
  }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
  static get style() { return toasterCss; }
}, [0, "ds-toaster", {
    "position": [1537],
    "mods": [1537],
    "messages": [1537],
    "maxDisplayedToast": [514, "max-displayed-toast"],
    "closingDelay": [2, "closing-delay"],
    "isShown": [32],
    "displayToast": [64],
    "show": [64],
    "hide": [64]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-toaster"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-toaster":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSToaster);
      }
      break;
  } });
}

const DsToaster = DSToaster;
const defineCustomElement = defineCustomElement$1;

export { DsToaster, defineCustomElement };

//# sourceMappingURL=ds-toaster.js.map