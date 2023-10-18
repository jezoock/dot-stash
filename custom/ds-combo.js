import { proxyCustomElement, HTMLElement, createEvent, h } from '@stencil/core/internal/client';

const uuid = () => {
  let d = new Date().getTime(); //Timestamp
  let d2 = (performance && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    }
    else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const comboCss = ".ds-combo{cursor:pointer;display:inline-block;vertical-align:inherit}.ds-combo__selected-option{display:flex;justify-content:space-between;align-items:center;white-space:nowrap}.ds-combo__selected-option:after{transition:transform ease 0.4s;transform:rotateZ(0deg);margin-left:0.5rem}.ds-combo>menu{position:relative}.ds-combo--position-right .ds-combo__option-list{right:0;left:unset}.ds-combo__option{border-bottom:1px solid color(gray, lighter)}.ds-combo__option:last-child{border-bottom:none}.ds-combo__option:hover{background:color(gray, lighter)}.ds-combo__option>span,.ds-combo__option>a{display:block;white-space:nowrap;padding:0.5rem 1rem}.ds-combo__option-list{position:absolute;top:0.5rem;left:0;background:#fff;z-index:100;box-shadow:0 0 10px rgba(0, 0, 0, 0.4);max-height:325px;overflow-x:hidden}.ds-combo__option-list>*{user-select:none;-moz-user-select:none;-webkit-user-drag:none;-webkit-user-select:none;-ms-user-select:none}.ds-combo__option--selected{background:color(color-1, base);color:#fff}.ds-combo__option--selected>img{opacity:0.5}.ds-combo__option--selected:hover{background:color(color-1, dark)}.ds-combo__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.4)}.ds-combo--open .ds-combo__selected-option:after{transform:rotateZ(180deg)}.ds-combo--default{border:1px solid color(gray, light);border-radius:2px;min-width:200px;line-height:2rem}.ds-combo--default .ds-combo__selected-option{padding:0 1rem;font-size:1rem}.ds-combo--default .ds-combo__option{padding:0 1rem}.ds-combo--default .ds-combo__option-list{top:3.25rem;right:-1px;padding:0.5rem;border:1px solid color(gray, light)}.ds-combo--default .ds-combo--open{border-color:color(color-1, base)}.ds-combo--alt .ds-combo__option{padding:0 1rem}.ds-combo--alt .ds-combo__option-list{left:-1rem}.ds-combo--alt .ds-combo__selected-option{color:color(color-1, base)}.ds-combo--image .ds-combo__option-list{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;width:675px;padding:0.5rem 0.5rem 0 0.5rem}.ds-combo--image .ds-combo__option-list>li{width:125px;height:78px;position:relative;overflow:hidden;margin:0 0 0.5rem 0;background:#fff;transition:background-color ease 0.4s;padding:0}.ds-combo--image .ds-combo__option-list>li>span{display:inline-block;color:#fff;font-weight:700;text-shadow:1px 1px 3px rgba(0, 0, 0, 0.8);line-height:78px;width:100%;text-align:center;position:absolute;top:0;left:0.25rem;z-index:10}.ds-combo--image .ds-combo__option-list>li>img{transform:translateY(-20%);transition:transform ease 0.4s, opacity ease 0.4s}.ds-combo--image .ds-combo__option-list>li:hover>img{opacity:0.5;transform:scale3d(1.2, 1.2, 1) translateY(-20%)}";

const DSCombo = /*@__PURE__*/ proxyCustomElement(class DSCombo extends HTMLElement {
  optionsChangeHandler(options) {
    this.optionsHandler(options, 0);
  }
  async close() {
    const body = document.querySelector("body");
    body.removeEventListener("click", this.bodyClickHandler);
    this.showCombo = false;
  }
  async open() {
    const body = document.querySelector("body");
    body.addEventListener("click", this.bodyClickHandler);
    this.showCombo = true;
  }
  async toggle(forceDisplay) {
    const show = typeof forceDisplay !== "undefined" ? forceDisplay : !this.showCombo;
    if (show) {
      this.open();
    }
    else {
      this.close();
    }
  }
  constructor() {
    super();
    this.__registerHost();
    this.optionSelected = createEvent(this, "optionSelected", 7);
    this.options = undefined;
    this.name = undefined;
    this.mode = "";
    this.customLabel = "";
    this.multiple = false;
    this.overlay = false;
    this.position = "left";
    this.selectedOption = [];
    this.selected = {
      id: "",
      index: -1,
      name: "",
      value: ""
    };
    this.uid = uuid();
    this.showCombo = false;
    this.optionsArray = [];
    this.bodyClickHandler = this.bodyClickHandler.bind(this);
    this.toggle = this.toggle.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }
  componentWillLoad() {
    this.optionsHandler(this.options);
  }
  optionsHandler(options, selected = null) {
    if (options && typeof options === "string") {
      options = JSON.parse(options);
    }
    this.optionsArray = options;
    let index;
    if (typeof this.selected.index !== "undefined") {
      index = this.selected.index;
    }
    else if (this.selected.value) {
      index = this.optionsArray
        .map(function (option) {
        return option.value;
      })
        .indexOf(this.selected.value);
    }
    else if (this.selected.name) {
      index = this.optionsArray
        .map(function (option) {
        return option.name;
      })
        .indexOf(this.selected.name);
    }
    else if (selected) {
      index = selected;
    }
    if (index > -1)
      this.setSelected(index, false);
  }
  setSelected(index, emit = true) {
    const selectedOption = Object.assign({}, this.optionsArray[index]);
    const selected = selectedOption.selected;
    const previousOptions = [...this.optionsArray];
    const previousSelectedOptions = [...this.selectedOption];
    if (selectedOption.value === "") {
      return false;
    }
    if (this.multiple) {
      selectedOption.selected = !selected;
      previousOptions[index].selected = !selected;
      const selectedIndex = previousSelectedOptions
        .map(option => option.value)
        .indexOf(selectedOption.value);
      if (selectedIndex > -1) {
        previousSelectedOptions.splice(selectedIndex, 1);
      }
      else {
        previousSelectedOptions.push(selectedOption);
      }
      this.selectedOption = previousSelectedOptions;
    }
    else {
      selectedOption.selected = true;
      previousOptions.map(option => (option.selected = false));
      previousOptions[index] = selectedOption;
      this.selectedOption = [selectedOption];
    }
    this.optionsArray = previousOptions;
    if (emit) {
      this.optionSelected.emit({
        name: this.name,
        option: this.selectedOption
      });
    }
  }
  selectOption(event, index) {
    this.setSelected(index);
    if (!this.multiple) {
      this.toggle();
    }
    else {
      event.stopPropagation();
    }
  }
  bodyClickHandler(e) {
    if (!e.target.closest(`.ds-combo-${this.uid}`)) {
      this.close();
    }
  }
  render() {
    var _a, _b;
    return (h("div", { id: "ds-combo-" +
        (this.name ||
          [
            ...document.querySelectorAll("ds-combo")
          ].length.toString()), class: {
        "ds-combo": true,
        "ds-combo--open": this.showCombo,
        [`ds-combo-${this.uid}`]: true,
        [`ds-combo--position-${this.position}`]: true,
        [`ds-combo--${this.mode}`]: !!this.mode,
      } }, this.overlay && (h("div", { class: "ds-overlay", onClick: this.close })), this.mode !== "dropdown" && (h("div", { class: "ds-combo__selected-option", onClick: () => {
        this.toggle();
      } }, this.multiple && (h("span", null, this.name, this.selectedOption.length > 0 && (h("span", null, "(", this.selectedOption.length, ")")))), !this.multiple && (h("span", null, this.customLabel ||
      (this.selectedOption.length > 0 &&
        ((_a = this.selectedOption[0]) === null || _a === void 0 ? void 0 : _a.name)) ||
      ((_b = this.optionsArray[0]) === null || _b === void 0 ? void 0 : _b.name))))), (this.showCombo || this.mode === "image") && (h("menu", null, h("ul", { class: {
        "ds-combo__option-list": true,
        "ds-js--hidden": this.mode === "image" && !this.showCombo
      } }, this.optionsArray.map((option, optionIndex) => (h("li", { class: {
        "ds-combo__option": true,
        "ds-bombo__option--disabled": option.disabled,
        "ds-combo__option--selected": option.selected
      }, onClick: evt => {
        this.selectOption(evt, optionIndex);
      } }, this.mode === "image" && (h("img", { src: option.image, alt: option.name })), option.url ? (h("a", { href: option.url }, option.name)) : (h("span", null, option.name))))))))));
  }
  static get watchers() { return {
    "options": ["optionsChangeHandler"]
  }; }
  static get style() { return comboCss; }
}, [0, "ds-combo", {
    "options": [1544],
    "name": [1],
    "mode": [1537],
    "customLabel": [1537, "custom-label"],
    "multiple": [4],
    "overlay": [4],
    "position": [1],
    "selectedOption": [1040],
    "selected": [1040],
    "uid": [32],
    "showCombo": [32],
    "optionsArray": [32],
    "close": [64],
    "open": [64],
    "toggle": [64]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-combo"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-combo":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSCombo);
      }
      break;
  } });
}

const DsCombo = DSCombo;
const defineCustomElement = defineCustomElement$1;

export { DsCombo, defineCustomElement };

//# sourceMappingURL=ds-combo.js.map