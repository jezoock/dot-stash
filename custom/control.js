import { proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const DSControl = /*@__PURE__*/ proxyCustomElement(class DSControl extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.hostClickHandler = () => {
      if (this.targetComponent) {
        const [action, args] = this.action.split(/:(.*)/s);
        this.targetComponent[action](..._ds.props.fromJSON(args || []));
      }
    };
    this.action = undefined;
    this.type = undefined;
    this.target = undefined;
  }
  componentDidLoad() {
    this.targetComponent = this.target ? document.querySelector(this.target) : this.hostContainer.closest(this.type);
    if (!this.targetComponent) {
      console.log(`[ERROR] DSControl: can't find target component, selector: ${this.target}, type: ${this.type}`);
    }
  }
  render() {
    return (h(Host, { onClick: this.hostClickHandler }, h("slot", null)));
  }
  get hostContainer() { return this; }
}, [4, "ds-control", {
    "action": [1],
    "type": [1],
    "target": [1]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-control"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-control":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSControl);
      }
      break;
  } });
}

export { DSControl as D, defineCustomElement as d };

//# sourceMappingURL=control.js.map