import { proxyCustomElement, HTMLElement, createEvent, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';
import { d as defineCustomElement$2 } from './button.js';

const navMenuItemCss = "";

const DSNavMenuItem = /*@__PURE__*/ proxyCustomElement(class DSNavMenuItem extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.dsMenuItemClick = createEvent(this, "dsMenuItemClick", 7);
    this.dsItemId = undefined;
    this.type = 'page';
    this.depth = 0;
    this.hasChildren = false;
    this.isActive = false;
    this.isAnimated = true;
    this.isOpened = false;
    this.itemClickHandler = this.itemClickHandler.bind(this);
    this.removeTransition = this.removeTransition.bind(this);
  }
  componentWillLoad() {
    this.isActive = _ds.props.isTrue(this.isActive);
    this.hasChildren = _ds.props.isTrue(this.hasChildren);
    this.isAnimated = _ds.props.isTrue(this.isAnimated);
    this.depth = _ds.props.toNumber(this.depth);
  }
  toggleSubNav(mustShow = false) {
    this.isOpened = mustShow;
    this[`${mustShow ? 'show' : 'hide'}SubNav`]();
  }
  removeTransition() {
    const subNav = this.host.querySelector(".ds-nav-menu-item__sub-nav");
    if (subNav.offsetHeight !== 0) {
      subNav.style.height = "auto";
    }
    subNav.removeEventListener("transitionend", this.removeTransition);
  }
  showSubNav() {
    const subNav = this.host.querySelector(".ds-nav-menu-item__sub-nav");
    const subNavContent = this.host.querySelector(".ds-nav-menu-item__sub-nav > ds-nav-menu > .ds-nav-menu");
    if (subNav && subNavContent) {
      subNav.addEventListener("transitionend", this.removeTransition);
      subNav.style.height = `${subNavContent.offsetHeight}px`;
    }
  }
  hideSubNav() {
    const subNav = this.host.querySelector(".ds-nav-menu-item__sub-nav");
    subNav.style.height = `${subNav.offsetHeight}px`;
    subNav.addEventListener("transitionend", this.removeTransition);
    setTimeout(() => { subNav.style.height = "0"; }, 0);
  }
  toggleIsSelected() {
    const isSelected = !this.isActive;
    this.isActive = isSelected;
    this.dsMenuItemClick.emit({ isSelected });
    if (this.isAnimated) {
      this.toggleSubNav(isSelected);
    }
  }
  itemClickHandler(event) {
    const menuItem = event.target;
    const link = menuItem.getAttribute("href");
    if (!link || link === '/' || link === '' || link === '#') {
      event.preventDefault();
    }
    this.toggleIsSelected();
  }
  expandButtonClickHandler() {
    this.toggleIsSelected();
  }
  render() {
    return (h("div", { class: {
        "ds-nav-menu-item": true,
        "--with-children": this.hasChildren,
        "--active": this.isActive,
        "--open": this.isOpened,
        [`--depth-${this.depth}`]: true,
        [`--${this.type}-${this.dsItemId}`]: true,
      } }, h("div", { class: "ds-nav-menu-item__link" }, h("slot", null)), this.hasChildren && (h("div", { class: "ds-nav-menu-item__expand-button" }, h("ds-button", { "ds-mods": "menu-item", onClick: this.itemClickHandler }))), h("div", { class: "ds-nav-menu-item__sub-nav" }, h("slot", { name: "children" }))));
  }
  get host() { return this; }
  static get style() { return navMenuItemCss; }
}, [4, "ds-nav-menu-item", {
    "dsItemId": [1, "ds-item-id"],
    "type": [1537],
    "depth": [1538],
    "hasChildren": [1540, "has-children"],
    "isActive": [1540, "is-active"],
    "isAnimated": [1540, "is-animated"],
    "isOpened": [32]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-nav-menu-item", "ds-button"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-nav-menu-item":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSNavMenuItem);
      }
      break;
    case "ds-button":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
  } });
}

const DsNavMenuItem = DSNavMenuItem;
const defineCustomElement = defineCustomElement$1;

export { DsNavMenuItem, defineCustomElement };

//# sourceMappingURL=ds-nav-menu-item.js.map