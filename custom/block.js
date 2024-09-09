import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const blockCss = ".ds-section,.ds-block{box-sizing:border-box;padding:0;margin:0}.ds-section__header:not(:has([slot=block-header])),.ds-block__header:not(:has([slot=block-header])){display:none}.ds-section__footer:not(:has([slot=block-footer])),.ds-block__footer:not(:has([slot=block-footer])){display:none}";

var DsBlockTypeToTag;
(function (DsBlockTypeToTag) {
  DsBlockTypeToTag["PAGE"] = "Host";
  DsBlockTypeToTag["SECTION"] = "section";
  DsBlockTypeToTag["BLOCK"] = "div";
  DsBlockTypeToTag["CONTENT"] = "div";
})(DsBlockTypeToTag || (DsBlockTypeToTag = {}));
const DSBlock = /*@__PURE__*/ proxyCustomElement(class DSBlock extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.blockName = "ds-block";
    this.blockTag = DsBlockTypeToTag.BLOCK;
    this.type = undefined;
    this.ext = "";
    this.mods = [];
  }
  modsChangeHandler(mods) {
    this.CSSClassList = _ds.props.toClassList(this.blockName, mods);
  }
  componentWillLoad() {
    const blockName = 'ds';
    const blockType = this.type || "block";
    if (this.ext) {
      this.blockName = `${blockName}-${this.ext}`;
    }
    this.blockName = `${blockName}-${blockType}`;
    this.blockTag = DsBlockTypeToTag[blockType.toUpperCase()];
    this.CSSClassList = _ds.props.toClassList(this.blockName, this.mods);
  }
  render() {
    const { blockTag: BlockTag } = this;
    return (h(BlockTag, { class: this.CSSClassList }, h("header", { class: `${this.blockName}__header` }, h("slot", { name: "block-header" })), h("div", { class: `${this.blockName}__body` }, h("slot", null)), h("footer", { class: `${this.blockName}__footer` }, h("slot", { name: "block-footer" }))));
  }
  static get watchers() { return {
    "mods": ["modsChangeHandler"]
  }; }
  static get style() { return blockCss; }
}, [4, "ds-block", {
    "type": [1],
    "ext": [1],
    "mods": [1537]
  }]);
function defineCustomElement() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-block"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-block":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSBlock);
      }
      break;
  } });
}

export { DSBlock as D, defineCustomElement as d };

//# sourceMappingURL=block.js.map