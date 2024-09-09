import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { t as translations } from './translations.js';

const shoppingBagCreateFormCss = ".ds-shopping-bag-create-form>menu>button{width:48%}";

const DSShoppingBagCreateForm = /*@__PURE__*/ proxyCustomElement(class DSShoppingBagCreateForm extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.translations = translations[this.locale].gbx_shoppingBag;
    this.locale = 'en';
    this.requestCreateShoppingBag = undefined;
    this.requestHideCreateForm = undefined;
    this.inputValue = "";
    this.formSubmitHandler = this.formSubmitHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
  }
  /**
   * Handle input value update
   * @param {Event} event Input change event
   */
  inputChangeHandler(event) {
    const { value } = event.target;
    this.inputValue = value;
  }
  /**
   * Call shopping bag creation method from parent component
   * @param {Event} event Form submit event
   */
  formSubmitHandler(event) {
    event.preventDefault();
    this.requestCreateShoppingBag(this.inputValue);
  }
  render() {
    return (h("form", { class: {
        "ds-shopping-bag-create-form": true,
        "ds-form": true,
        "--default": true
      }, onSubmit: this.formSubmitHandler }, h("div", { class: {
        "ds-shopping-bag-title": true,
        "--create": true
      } }, this.translations.createForm.title), h("fieldset", { class: {
        "ds-form__input": true
      } }, h("label", { htmlFor: "shoppingBagName" }, this.translations.createForm.content), h("input", { type: "text", id: "shoppingBagName", name: "shoppingBagName", value: this.inputValue, onChange: this.inputChangeHandler, onKeyUp: this.inputChangeHandler })), h("menu", null, h("button", { class: {
        "ds-shopping-bag-button": true,
        "--back": true
      }, type: "button", onClick: this.requestHideCreateForm }, this.translations.buttons.cancel), h("button", { class: {
        "ds-shopping-bag-button": true,
        "--create": true
      }, disabled: this.inputValue === "" }, this.translations.buttons.add))));
  }
  static get style() { return shoppingBagCreateFormCss; }
}, [0, "ds-shopping-bag-create-form", {
    "locale": [1],
    "requestCreateShoppingBag": [8, "request-create-shopping-bag"],
    "requestHideCreateForm": [8, "request-hide-create-form"],
    "inputValue": [32]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-shopping-bag-create-form"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-shopping-bag-create-form":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSShoppingBagCreateForm);
      }
      break;
  } });
}

export { DSShoppingBagCreateForm as G, defineCustomElement as d };

//# sourceMappingURL=shopping-bag-create-form.js.map