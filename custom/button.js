import { proxyCustomElement, HTMLElement, createEvent, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const buttonCss = ".ds-button{border:none;background:transparent;outline:none;padding:0;margin:0}.ds-button:focus{outline:none}.ds-button:not([disabled]){cursor:pointer}.ds-button:has([slot=before]),.ds-button:has([slot=after]){display:flex;align-items:center}.ds-button:has([slot=before])>:not([slot=before]):not([slot=after]),.ds-button:has([slot=after])>:not([slot=before]):not([slot=after]){flex-grow:1}";

const DSButton = /*@__PURE__*/ proxyCustomElement(class DSButton extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.buttonClick = createEvent(this, "buttonClick", 7);
    this.buttonClickHandler = (event) => {
      this.buttonClick.emit();
      if (this.buttonType === 'button') {
        event.preventDefault();
        event.stopPropagation();
        if (this.url) {
          window.location.href = this.url;
        }
      }
    };
    this.type = 'button';
    this.mods = [];
    this.url = undefined;
    this.styles = undefined;
    this.color = undefined;
    this.disabled = undefined;
  }
  disabledPropChangeHandler(isDisabled) {
    this.isDisabled = _ds.props.isTrue(isDisabled);
  }
  modsPropChangeHanler(mods) {
    this.CSSClassList = this.generateClassList(mods);
  }
  componentWillLoad() {
    this.CSSClassList = this.generateClassList(this.mods);
    this.buttonType = this.type === 'trigger' ? 'button' : this.type;
    this.isDisabled = _ds.props.isTrue(this.disabled);
  }
  generateClassList(modifiers) {
    const newModifiers = _ds.props.toArray(modifiers);
    if (typeof this.styles === "string") {
      newModifiers.push(this.styles);
    }
    if (typeof this.color === "string") {
      newModifiers.push(this.color);
    }
    return _ds.props.toClassList('ds-button', newModifiers);
  }
  render() {
    return (h("button", { class: this.CSSClassList, type: this.buttonType, disabled: this.isDisabled, onClick: this.buttonClickHandler }, h("slot", { name: "before" }), h("slot", null), h("slot", { name: "after" })));
  }
  static get watchers() { return {
    "disabled": ["disabledPropChangeHandler"],
    "mods": ["modsPropChangeHanler"]
  }; }
  static get style() { return buttonCss; }
}, [4, "ds-button", {
    "type": [1537],
    "mods": [1537],
    "url": [1537],
    "styles": [1537],
    "color": [1537],
    "disabled": [1540]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-button"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-button":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSButton);
      }
      break;
  } });
}

export { DSButton as D, defineCustomElement as d };

//# sourceMappingURL=button.js.map