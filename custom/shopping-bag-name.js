import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { F as Fragment } from './index2.js';
import { t as translations } from './translations.js';

const shoppingBagNameCss = ".ds-shopping-bag-title{}";

const DSShoppingBagName = /*@__PURE__*/ proxyCustomElement(class DSShoppingBagName extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.translations = translations[this.locale].gbx_shoppingBag;
    this.locale = "en";
    this.name = "";
    this.isDisabled = false;
    this.requestUpdateShoppingBag = undefined;
    this.toggleDeleteMessage = undefined;
    this.inputValue = this.name;
    this.isEditing = false;
    this.editButtonClickHandler = this.editButtonClickHandler.bind(this);
    this.cancelButtonClickHandler = this.cancelButtonClickHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.formSubmitHandler = this.formSubmitHandler.bind(this);
  }
  componentWillLoad() {
    this.inputValue = this.name;
  }
  /**
   * Toggle edit form display
   */
  toggleEditForm() {
    const { isEditing: display } = this;
    this.isEditing = !display;
  }
  /**
   * Display name edit form
   */
  editButtonClickHandler() {
    this.toggleEditForm();
  }
  /**
   * Hide name edit form
   */
  cancelButtonClickHandler() {
    this.toggleEditForm();
  }
  /**
   * Handle input value update
   * @param {Event} event Input change event
   */
  inputChangeHandler(event) {
    const { value } = event.target;
    this.inputValue = value;
    this.name = value;
  }
  /**
   * Call shopping bag name update method from parent component
   * @param {Event} event Form submit event
   */
  formSubmitHandler(event) {
    event.preventDefault();
    this.requestUpdateShoppingBag({ name: this.inputValue });
    this.toggleEditForm();
  }
  render() {
    return (h("form", { class: "ds-shopping-bag-name", onSubmit: this.formSubmitHandler }, h("div", { class: {
        "ds-shopping-bag-title": true,
        "--details": !this.isEditing,
        "--edit": this.isEditing
      } }, this.isEditing ? (h(Fragment, null, h("input", { type: "text", id: "shoppingBagName", name: "shoppingBagName", value: this.inputValue, onChange: this.inputChangeHandler, onKeyUp: this.inputChangeHandler }), h("button", { class: "ds-shopping-bag-title__button --save", disabled: this.inputValue === "" }, h("span", null, this.translations.buttons.ok)), h("button", { class: "ds-shopping-bag-title__button --cancel", type: "button", onClick: this.cancelButtonClickHandler }, h("span", null, this.translations.buttons.cancel)))) : (h(Fragment, null, h("strong", null, this.name), !this.isDisabled && (h(Fragment, null, h("button", { type: "button", class: "ds-shopping-bag-title__button --edit", onClick: this.editButtonClickHandler }), h("button", { type: "button", class: 'ds-shopping-bag-title__delete-products', onClick: this.toggleDeleteMessage }, this.translations.buttons.deleteList))))))));
  }
  static get style() { return shoppingBagNameCss; }
}, [0, "ds-shopping-bag-name", {
    "locale": [1],
    "name": [1025],
    "isDisabled": [4, "disabled"],
    "requestUpdateShoppingBag": [8, "request-update-shopping-bag"],
    "toggleDeleteMessage": [16],
    "inputValue": [32],
    "isEditing": [32]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-shopping-bag-name"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-shopping-bag-name":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSShoppingBagName);
      }
      break;
  } });
}

export { DSShoppingBagName as G, defineCustomElement as d };

//# sourceMappingURL=shopping-bag-name.js.map