import { proxyCustomElement, HTMLElement, createEvent, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

var SIDEBAR_POSITION;
(function (SIDEBAR_POSITION) {
  SIDEBAR_POSITION["LEFT"] = "left";
  SIDEBAR_POSITION["RIGHT"] = "right";
  SIDEBAR_POSITION["TOP"] = "top";
  SIDEBAR_POSITION["BOTTOM"] = "bottom";
})(SIDEBAR_POSITION || (SIDEBAR_POSITION = {}));
const SIDEBAR_POSITION$1 = SIDEBAR_POSITION;

const sidebarCss = ".ds-sidebar{position:fixed;transition:transform ease 0.4s;background:#fff}.ds-sidebar__content{}.ds-sidebar.--shown{transform:translate3d(0, 0, 0)}.ds-sidebar.--right{top:0;bottom:0;right:0}.ds-sidebar.--right.--hidden{transform:translate3d(100%, 0, 0)}.ds-sidebar.--left{top:0;bottom:0;left:0}.ds-sidebar.--left.--hidden{transform:translate3d(-100%, 0, 0)}.ds-sidebar.--top{top:0;left:0;right:0}.ds-sidebar.--top.--hidden{transform:translate3d(0, -100%, 0)}.ds-sidebar.--bottom{bottom:0;right:0;left:0}.ds-sidebar.--bottom.--hidden{transform:translate3d(0, 100%, 0)}";

const DSSidebar = /*@__PURE__*/ proxyCustomElement(class DSSidebar extends HTMLElement {
  modsChangeHandler() {
    this.computeCSSClasslist();
  }
  //#endregion
  async toggle(mustShow) {
    let { isShown } = this;
    if (typeof mustShow === "boolean") {
      isShown = mustShow;
    }
    else {
      isShown = !isShown;
    }
    this[isShown ? 'show' : 'hide']();
  }
  async show() {
    this.containerRefresh();
    this.sidebarShow.emit();
    this.container.addEventListener("transitionend", this.animationEndHandler);
    this.isShown = true;
  }
  async hide() {
    this.sidebarHide.emit();
    this.container.addEventListener("transitionend", this.animationEndHandler);
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
    super();
    this.__registerHost();
    this.sidebarHide = createEvent(this, "sidebarHide", 7);
    this.sidebarHidden = createEvent(this, "sidebarHidden", 7);
    this.sidebarShow = createEvent(this, "sidebarShow", 7);
    this.sidebarShown = createEvent(this, "sidebarShown", 7);
    this.isShown = false;
    this.position = SIDEBAR_POSITION$1.RIGHT;
    this.mods = "";
    this.animationEndHandler = this.animationEndHandler.bind(this);
  }
  componentWillLoad() {
    this.computeCSSClasslist();
  }
  componentDidLoad() {
    this.container.addEventListener("touchmove", evt => evt.stopPropagation(), { passive: true });
  }
  //#region 
  //#region HANDLERS
  animationEndHandler() {
    this.container.removeEventListener("transitionend", this.animationEndHandler);
    this[`sidebar${this.isShown ? 'Shown' : 'Hidden'}`].emit();
  }
  //#endregion
  render() {
    return (h("div", { class: Object.assign(Object.assign({}, this.CSSClassList), { "--shown": this.isShown, "--hidden": !this.isShown, [`--${this.position}`]: true }), ref: el => this.container = el }, h("div", { class: "ds-sidebar__content" }, h("slot", null))));
  }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
  static get style() { return sidebarCss; }
}, [4, "ds-sidebar", {
    "isShown": [1540, "is-shown"],
    "position": [1537],
    "mods": [1537],
    "toggle": [64],
    "show": [64],
    "hide": [64]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-sidebar"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-sidebar":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSSidebar);
      }
      break;
  } });
}

export { DSSidebar as D, defineCustomElement as d };

//# sourceMappingURL=sidebar.js.map