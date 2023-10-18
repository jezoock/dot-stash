import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const navMenuCss = "";

const DSNavMenu = /*@__PURE__*/ proxyCustomElement(class DSNavMenu extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.currentActiveItemId = undefined;
    this.mods = undefined;
  }
  modsChangeHandler(newMods) {
    this.CSSClassList = _ds.props.toClassList("ds-nav-menu", newMods);
  }
  onDSMenuItemClick({ detail: { menuItem } }) {
    console.log(menuItem);
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-nav-menu", this.mods);
  }
  componentDidLoad() {
    this.setActiveMenuItem();
  }
  getItems(itemLevel) {
    const depth = typeof itemLevel === "number" ? `='${Math.abs(itemLevel)}'` : '';
    const items = this.container.querySelectorAll(`ds-nav-menu-item[ds-depth${depth}]`);
    return items.length ? items : [];
  }
  setActiveMenuItem() {
    //const items = this.getItems(0);
    //items.forEach( item => item.dsIsSelected = item.dsItemId === this.currentActiveItemId );
  }
  render() {
    return (h("div", { class: this.CSSClassList }, h("slot", null)));
  }
  get container() { return this; }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
  static get style() { return navMenuCss; }
}, [4, "ds-nav-menu", {
    "currentActiveItemId": [1, "current-active-item-id"],
    "mods": [1]
  }, [[0, "DSMenuItemClick", "onDSMenuItemClick"]]]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-nav-menu"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-nav-menu":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSNavMenu);
      }
      break;
  } });
}

const DsNavMenu = DSNavMenu;
const defineCustomElement = defineCustomElement$1;

export { DsNavMenu, defineCustomElement };

//# sourceMappingURL=ds-nav-menu.js.map