import { proxyCustomElement, HTMLElement, h } from '@stencil/core/internal/client';
import { d as defineCustomElement$9 } from './block.js';
import { d as defineCustomElement$8 } from './button.js';
import { d as defineCustomElement$7 } from './control.js';
import { d as defineCustomElement$6 } from './grid.js';
import { d as defineCustomElement$5 } from './grid-item.js';
import { d as defineCustomElement$4 } from './header.js';
import { d as defineCustomElement$3 } from './sidebar.js';
import { d as defineCustomElement$2 } from './title.js';

const globalCss = "@font-face{font-family:\"Garamond\";src:url(\"../fonts/GaramondPremrPro-LtDisp.woff2\");font-weight:normal;font-style:normal;font-display:swap}@font-face{font-family:\"Now\";src:url(\"../assets/fonts/Now-Light.woff2\");font-weight:200;font-style:normal;font-display:swap}@font-face{font-family:\"Now\";src:url(\"../fonts/Now-Regular.woff2\");font-weight:normal;font-style:normal;font-display:swap}@font-face{font-family:\"Now\";src:url(\"../fonts/Now-Bold.woff2\");font-weight:bold;font-style:normal;font-display:swap}.ds-block{box-sizing:border-box}.ds-block__header:not(:has([slot])){display:none}ds-paragraph{padding:0 0 1.5rem 0;display:block}ds-paragraph[mods=intro]{max-width:770px}ds-paragraph[mods=description]{max-width:870px}ds-paragraph[mods=capital]{box-sizing:border-box;max-width:1540px;margin:0 auto;font-weight:bold;font-size:1.625rem;padding:4rem 875px 4rem 0}ds-paragraph[data-align=right]{font-size:1.5rem;text-align:right}ds-paragraph[mods=talent]{display:block;font-size:1.5rem;padding:2rem 0;border-bottom:1px solid #000}ds-paragraph[mods=talent] span{font-size:20px;display:block}ds-paragraph[data-closed]{height:0;overflow:hidden;transition:height ease 0.4s;padding:0}ds-paragraph[mods=invert]{font-size:1.25rem}.ds-grid img{vertical-align:top}.ds-grid.--home{padding:0 180px;margin:0 auto}.ds-grid.--categories{padding:0 40px}.ds-grid.--categories img{width:100%}.ds-grid.--conseil{background-color:#dbd5dc}.ds-grid.--capital{background-color:#dbd5dc}.ds-grid.--capital .ds-grid__row{align-items:center}[data-layout=fieldset]{display:flex;flex-wrap:wrap}[data-layout=fieldset][data-align=left]{justify-content:flex-start}[data-layout=fieldset][data-align=left][data-gutter=\"1\"]>[data-layout=cell]{padding-left:0.25rem}[data-layout=fieldset][data-align=left][data-gutter=\"2\"]>[data-layout=cell]{padding-left:0.5rem}[data-layout=fieldset][data-align=left][data-gutter=\"3\"]>[data-layout=cell]{padding-left:1rem}[data-layout=fieldset][data-align=left][data-gutter=\"4\"]>[data-layout=cell]{padding-left:1.25rem}[data-layout=fieldset][data-align=left][data-gutter=\"5\"]>[data-layout=cell]{padding-left:2.5rem}[data-layout=fieldset][data-align=left][data-gutter]>[data-layout=cell]:first-child{padding-left:0}@media (max-width: ){[data-layout=fieldset][data-align=left][data-gutter][data-cols=\"3\"]>[data-layout=cell]{padding-left:0}}@media (min-width: 1200px) and (max-width: ){[data-layout=fieldset][data-align=left][data-gutter][data-cols=\"3\"]>[data-layout=cell]:nth-child(2n+1){padding-left:0}}@media (min-width: ){[data-layout=fieldset][data-align=left][data-gutter][data-cols=\"3\"]>[data-layout=cell]:nth-child(3n+1){padding-left:0}}@media (max-width: ){[data-layout=fieldset][data-align=left][data-gutter][data-cols=\"4\"]>[data-layout=cell]{padding-left:0}}@media (min-width: 992px) and (max-width: ){[data-layout=fieldset][data-align=left][data-gutter][data-cols=\"4\"]>[data-layout=cell]:nth-child(2n+1){padding-left:0}}@media (min-width: 1400px) and (max-width: ){[data-layout=fieldset][data-align=left][data-gutter][data-cols=\"4\"]>[data-layout=cell]:nth-child(3n+1){padding-left:0}}@media (min-width: 1600px){[data-layout=fieldset][data-align=left][data-gutter][data-cols=\"4\"]>[data-layout=cell]:nth-child(4n+1){padding-left:0}}[data-layout=fieldset][data-align=center]{justify-content:center}[data-layout=fieldset][data-align=center][data-gutter=\"1\"]{column-gap:0.25rem}[data-layout=fieldset][data-align=center][data-gutter=\"2\"]{column-gap:0.5rem}[data-layout=fieldset][data-align=center][data-gutter=\"3\"]{column-gap:1rem}[data-layout=fieldset][data-align=center][data-gutter=\"4\"]{column-gap:1.25rem}[data-layout=fieldset][data-align=center][data-gutter=\"5\"]{column-gap:2.5rem}[data-layout=fieldset][data-align=right]{justify-content:flex-end}[data-layout=fieldset][data-align=right][data-gutter=\"1\"]>[data-layout=cell]{padding-right:0.25rem}[data-layout=fieldset][data-align=right][data-gutter=\"2\"]>[data-layout=cell]{padding-right:0.5rem}[data-layout=fieldset][data-align=right][data-gutter=\"3\"]>[data-layout=cell]{padding-right:1rem}[data-layout=fieldset][data-align=right][data-gutter=\"4\"]>[data-layout=cell]{padding-right:1.25rem}[data-layout=fieldset][data-align=right][data-gutter=\"5\"]>[data-layout=cell]{padding-right:2.5rem}[data-layout=fieldset][data-align=right][data-gutter][data-cols=\"3\"]>:nth-child(3n+1){padding-right:0}[data-layout=fieldset][data-align=right][data-gutter][data-cols=\"4\"]>:nth-child(4n+1){padding-right:0}[data-layout=fieldset][data-v-align=top]{align-items:flex-start}[data-layout=fieldset][data-v-align=center]{align-items:center}[data-layout=fieldset][data-v-align=bottom]{align-items:flex-end}@media (max-width: ){[data-layout=fieldset][data-cols=\"3\"]>[data-layout=cell]{width:100%}}@media (min-width: 1200px) and (max-width: ){[data-layout=fieldset][data-cols=\"3\"]>[data-layout=cell]{width:50%}}@media (min-width: ){[data-layout=fieldset][data-cols=\"3\"]>[data-layout=cell]{width:33.333%}}[data-layout=fieldset][data-cols=\"4\"]>[data-layout=cell]{}@media (max-width: ){[data-layout=fieldset][data-cols=\"4\"]>[data-layout=cell]{width:100%}}@media (min-width: 992px) and (max-width: ){[data-layout=fieldset][data-cols=\"4\"]>[data-layout=cell]{width:50%}}@media (min-width: 1400px) and (max-width: ){[data-layout=fieldset][data-cols=\"4\"]>[data-layout=cell]{width:33.333%}}@media (min-width: 1600px){[data-layout=fieldset][data-cols=\"4\"]>[data-layout=cell]{width:25%;}}.ds-link.--home strong{display:block;text-align:center;font-size:1.5rem;padding:2.5rem 0 0 0;text-transform:uppercase}.ds-link.--category{white-space:nowrap}.ds-link.--back-button{position:absolute;top:0;right:40px}.ds-list{font-size:1.625rem;margin:0;list-style-type:none}.ds-list.--services{font-weight:bold;flex-grow:1;padding:1rem 0 0 4rem}.ds-list.--capital{font-weight:bold;padding:0}.ds-nav-menu.--main{display:flex;justify-content:flex-end;align-items:center}.ds-nav-menu.--main>ds-nav-menu-item{padding:0 1.25rem 4rem 1.25rem}.ds-nav-menu.--main>ds-nav-menu-item:last-child{padding:0 0 4rem 1.25rem}.ds-nav-menu.--footer{display:flex;justify-content:space-between;align-items:flex-start}.ds-nav-menu.--footer>ds-nav-menu-item{padding:0 0 1.5rem 3.5rem}.ds-nav-menu-item{position:relative}.ds-nav-menu-item__link{display:inline-block}.ds-nav-menu-item__link>a{color:#000;text-decoration:none}.ds-nav-menu-item.--depth-0>.ds-nav-menu-item__link{font-size:1.375rem;font-weight:bold;padding:1.25rem 0 1.5rem 0}.ds-nav-menu-item.--depth-0.--active a{color:#8a2334}.ds-nav-menu-item.--depth-1>.ds-nav-menu-item__link{font-size:1rem}.ds-section{box-sizing:border-box}.ds-section__content a{font-weight:bold;text-underline-offset:3px}.ds-section.--primary{background-color:#8a2334;color:#fff}.ds-section.--primary .ds-section__content{padding:2.5rem 0}.ds-section.--primary .ds-section__content a{color:#fff}.ds-section.--default{padding:0 40px;background-color:#fff}.ds-section.--default img:not(footer img,.--category img){width:100%}.ds-section.--default a{color:#000}.ds-section.--home{background-color:#fff}.ds-section.--home a{color:#000}.ds-section.--home.--slider{padding:0 40px}.ds-section.--codif{padding:100px 180px 0 180px}.ds-section.--services{padding:0 180px}.ds-section.--services .ds-section__content{padding:4rem 0 3.125rem 0;border-bottom:1px solid #000}.ds-section.--services.--category .ds-section__content{padding:3.125rem 0;display:flex;align-items:flex-start;justify-content:space-between}.ds-section.--services.--category .ds-section__content>a{align-self:flex-end;font-size:1.625rem}.ds-slider{width:100%;min-height:200px}.ds-slider__list{width:100%}.ds-slider-item{width:100%}.ds-slider__item{display:block}.ds-slider.--home{max-width:1820px;margin:0 auto}.ds-slider.--home img{width:100%;max-height:1085px;vertical-align:top}ds-title{}ds-title:not([sub])[page]{font-size:3rem}ds-title:not([sub])[page] h1,ds-title:not([sub])[page] h2,ds-title:not([sub])[page] h3,ds-title:not([sub])[page] h4,ds-title:not([sub])[page] h5,ds-title:not([sub])[page] h6,ds-title:not([sub])[page] strong{font-size:3rem}ds-title:not([sub])[section]{font-size:2rem}ds-title:not([sub])[section] h1,ds-title:not([sub])[section] h2,ds-title:not([sub])[section] h3,ds-title:not([sub])[section] h4,ds-title:not([sub])[section] h5,ds-title:not([sub])[section] h6,ds-title:not([sub])[section] strong{font-size:2rem}ds-title:not([sub])[block]{font-size:1rem}ds-title:not([sub])[block] h1,ds-title:not([sub])[block] h2,ds-title:not([sub])[block] h3,ds-title:not([sub])[block] h4,ds-title:not([sub])[block] h5,ds-title:not([sub])[block] h6,ds-title:not([sub])[block] strong{font-size:1rem}ds-title[sub][page]{font-size:3rem}ds-title[sub][page] h1,ds-title[sub][page] h2,ds-title[sub][page] h3,ds-title[sub][page] h4,ds-title[sub][page] h5,ds-title[sub][page] h6,ds-title[sub][page] strong{font-size:3rem}ds-title[sub][section]{font-size:2rem}ds-title[sub][section] h1,ds-title[sub][section] h2,ds-title[sub][section] h3,ds-title[sub][section] h4,ds-title[sub][section] h5,ds-title[sub][section] h6,ds-title[sub][section] strong{font-size:2rem}ds-title[sub][block]{font-size:1rem}ds-title[sub][block] h1,ds-title[sub][block] h2,ds-title[sub][block] h3,ds-title[sub][block] h4,ds-title[sub][block] h5,ds-title[sub][block] h6,ds-title[sub][block] strong{font-size:1rem}body{margin:0;padding:0;font-family:\"Now\"}body::before{content:'{ \"breakpoints\": {\"min\": 319,\"xxs\": 320,\"xs\": 576,\"sm\": 768,\"md\": 992,\"lg\": 1200,\"xl\": 1400,\"xxl\": 1600}, \"palettes\": {\"primary\": { \"base\": \"#e60078\"} } }';height:0;display:block;overflow:hidden}";

const DSMainTest = /*@__PURE__*/ proxyCustomElement(class DSMainTest extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.data = {
      mockup: {
        data: {
          name: 'bob',
          description: 'description',
          price: 4.5,
          products: [
            { name: 'raoul', number: 'test5' },
            { name: 'djibril', number: 'test12121212' },
            { name: 'djibril', number: 'test12121212' },
          ],
        },
      },
    };
    this.changeHandler = event => {
      console.log(event);
    };
  }
  async getData(key) {
    const keys = key.split('.');
    let pointer = this.data;
    keys.forEach(key => {
      pointer = pointer[key];
    });
    const data = pointer;
    return data;
  }
  render() {
    return (h("div", { class: "ds-components-demo" }, h("ds-sidebar", { position: 'top' }, "sdfhlsdfklsdfk", h("div", null, "sdkfljsdklfkl")), h("ds-control", { target: "ds-sidebar", action: 'toggle' }, "sidebar"), h("ds-block", { type: "section" }, h("ds-header", { slot: "block-header" }, h("ds-button", { slot: "before" }, "Retour", h("ds-icon", { type: "back", slot: "before" })), h("h2", { slot: "title" }, "Titre de block"), h("p", { slot: "sub-title" }, "Sous-titre de block de test"), h("div", null, "Plein de texte ne plus parce que c'est la classe \u00E0 dallas."), h("ds-button", { slot: "after" }, h("ds-icon", { type: "close", slot: "after" }), "Fermer")), h("ds-block", null, h("ds-header", { slot: "block-header" }, h("ds-button", { slot: "before" }, "Retour", h("ds-icon", { type: "back", slot: "before" })), h("h2", { slot: "title" }, "Titre de block"), h("p", { slot: "sub-title" }, "Sous-titre de block de test"), h("div", null, "Plein de texte ne plus parce que c'est la classe \u00E0 dallas."), h("ds-button", null, h("ds-icon", { type: "close", slot: "after" }), "Fermer"))), h("ds-block", null, h("ds-title", { slot: "header" }, "Default button"), h("ds-grid", { class: "ds-button-list", hGap: "10px", type: "fluid", cols: "3" }, h("ds-grid-item", { width: 2 }, h("ds-button", { mods: "default,sm" }, "Click me !")), h("ds-grid-item", null, h("ds-button", { mods: ["default", "md"] }, "Click me !")), h("ds-grid-item", null, h("ds-button", { mods: ["default", "lg"] }, "Click me !")), h("ds-grid-item", null, h("ds-button", { mods: "default,sm" }, "Click me !")), h("ds-grid-item", null, h("ds-button", { mods: ["default", "md"] }, "Click me !")), h("ds-grid-item", null, h("ds-button", { mods: ["default", "lg"] }, "Click me !")))))));
  }
  static get style() { return globalCss; }
}, [0, "ds-main", {
    "getData": [64]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-main", "ds-block", "ds-button", "ds-control", "ds-grid", "ds-grid-item", "ds-header", "ds-sidebar", "ds-title"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-main":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSMainTest);
      }
      break;
    case "ds-block":
      if (!customElements.get(tagName)) {
        defineCustomElement$9();
      }
      break;
    case "ds-button":
      if (!customElements.get(tagName)) {
        defineCustomElement$8();
      }
      break;
    case "ds-control":
      if (!customElements.get(tagName)) {
        defineCustomElement$7();
      }
      break;
    case "ds-grid":
      if (!customElements.get(tagName)) {
        defineCustomElement$6();
      }
      break;
    case "ds-grid-item":
      if (!customElements.get(tagName)) {
        defineCustomElement$5();
      }
      break;
    case "ds-header":
      if (!customElements.get(tagName)) {
        defineCustomElement$4();
      }
      break;
    case "ds-sidebar":
      if (!customElements.get(tagName)) {
        defineCustomElement$3();
      }
      break;
    case "ds-title":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
  } });
}

const DsMain = DSMainTest;
const defineCustomElement = defineCustomElement$1;

export { DsMain, defineCustomElement };

//# sourceMappingURL=ds-main.js.map