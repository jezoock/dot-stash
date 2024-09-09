import { proxyCustomElement, HTMLElement, createEvent, h } from '@stencil/core/internal/client';

const togglerItemCss = ".ds-toggler-item{padding:0 0.3125rem}.ds-toggler-item__title{cursor:pointer;position:relative;display:flex;justify-content:space-between;align-items:center;padding:1rem 0;margin:0 0 0.5rem 0}.ds-toggler-item__title>h2,.ds-toggler-item__title>h3,.ds-toggler-item__title>h4,.ds-toggler-item__title>h5,.ds-toggler-item__title>h6{font-size:1rem;color:color(gray, dark);margin:0;font-weight:bold}.ds-toggler-item__title:after{transition:transform ease 0.4s;transform:rotateZ(0)}.ds-toggler-item__content{overflow:hidden;height:0}.ds-toggler-item__content>div{position:relative}.ds-toggler-item__content.--js-animated{transition:height ease 0.4s}.ds-toggler-item.--active .ds-toggler-item__content{margin-bottom:1rem}.ds-toggler-item.--active .ds-toggler-item__title.--content:after{transition:transform ease 0.4s;transform:rotateZ(-45deg)}";

const DSTogglerItem = /*@__PURE__*/ proxyCustomElement(class DSTogglerItem extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.notify_togglerCollapsed_event = createEvent(this, "notify_togglerCollapsed_event", 7);
    this.notify_togglerExpanded_event = createEvent(this, "notify_togglerExpanded_event", 7);
    this.transitionStarted = false;
    this.titleContent = "";
    this.titleLevel = "4";
    this.expanded = false;
    this.replaceExtendFunction = undefined;
    this.hasContent = true;
    this.toggleContent = this.toggleContent.bind(this);
    this.togglerTitleClickHandler = this.togglerTitleClickHandler.bind(this);
  }
  componentDidLoad() {
    if (this.expanded) {
      this.container.querySelector(".ds-toggler-item__content").style.height = "auto";
    }
  }
  toggleContent() {
    const item = this.container.querySelector(".ds-toggler-item__content");
    item.removeEventListener("transitionend", this.toggleContent);
    if (item.offsetHeight !== 0) {
      item.style.height = "auto";
      this.notify_togglerExpanded_event.emit();
    }
    else {
      this.notify_togglerCollapsed_event.emit();
    }
    item.classList.remove("--js-animated");
    this.transitionStarted = false;
  }
  togglerTitleClickHandler() {
    var _a, _b;
    if (this.replaceExtendFunction) {
      this.replaceExtendFunction();
      return;
    }
    if (!this.transitionStarted) {
      this.transitionStarted = true;
      const { expanded } = this;
      this.expanded = !expanded;
      const item = this.container.querySelector(".ds-toggler-item__content");
      const height = this.expanded
        ? (_a = item === null || item === void 0 ? void 0 : item.firstElementChild) === null || _a === void 0 ? void 0 : _a.offsetHeight
        : 0;
      if (((_b = item === null || item === void 0 ? void 0 : item.style) === null || _b === void 0 ? void 0 : _b.height) == "auto") {
        item.style.height = item.firstElementChild.offsetHeight + "px";
      }
      if (item && typeof window.getComputedStyle(item).height === 'undefined') { // Force recalculate style https://gist.github.com/paulirish/5d52fb081b3570c81e3a
        return;
      }
      setTimeout(() => {
        item === null || item === void 0 ? void 0 : item.classList.add("--js-animated");
        item === null || item === void 0 ? void 0 : item.addEventListener("transitionend", this.toggleContent);
        if (item) {
          item.style.height = height && height + "px";
        }
      }, 0);
    }
  }
  render() {
    const TitleTag = `h${this.titleLevel}`;
    return (h("div", { class: {
        "ds-toggler-item": true,
        "--active": this.expanded && this.hasContent
      } }, h("div", { class: {
        "ds-toggler-item__title": true,
        "--content": this.hasContent
      }, onClick: this.togglerTitleClickHandler }, this.titleContent === "" ? (h("slot", { name: "title" })) : (h(TitleTag, null, this.titleContent))), this.hasContent && (h("div", { class: "ds-toggler-item__content" }, h("div", null, h("slot", null))))));
  }
  get container() { return this; }
  static get style() { return togglerItemCss; }
}, [4, "ds-toggler-item", {
    "titleContent": [1, "title-content"],
    "titleLevel": [1, "title-level"],
    "expanded": [1540],
    "replaceExtendFunction": [1032, "replace-extend-function"],
    "hasContent": [1028, "has-content"]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-toggler-item"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-toggler-item":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSTogglerItem);
      }
      break;
  } });
}

export { DSTogglerItem as D, defineCustomElement as d };

//# sourceMappingURL=toggler-item.js.map