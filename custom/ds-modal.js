import { proxyCustomElement, HTMLElement, createEvent, h, Host } from '@stencil/core/internal/client';
import { F as Fragment } from './index2.js';
import { d as defineCustomElement$2 } from './button.js';

const throttle = (func, wait, leading = false, trailing = false, context) => {
  let ctx, args, result;
  let timeout = null;
  let previous = 0;
  const later = function () {
    previous = new Date();
    timeout = null;
    result = func.apply(ctx, args);
  };
  return function (...rest) {
    const now = new Date();
    if (!previous && !leading) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    ctx = context || this;
    args = rest;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(ctx, args);
    }
    else if (!timeout && trailing) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

const modalCss = "ds-modal>[slot]{display:none}.ds-lightbox{position:fixed;top:0;left:0;bottom:0;right:0;z-index:10000}.ds-lightbox__container{position:absolute;top:0;left:0;bottom:0;right:0;z-index:100}.ds-lightbox__container .ds-modal{position:relative;z-index:10;background:#fff;margin:0 auto;max-height:100%}.ds-lightbox.--overlay:before{content:\"\";display:block;position:fixed;top:0;left:0;bottom:0;right:0;z-index:10}.ds-lightbox.--dark-overlay{background:rgba(0, 0, 0, 0.5)}.ds-lightbox.--page .ds-lightbox__container .ds-modal{display:flex;flex-direction:column;overflow-y:auto;height:100%}.ds-lightbox.--dialog .ds-lightbox__container{position:absolute;top:50%;left:50%;transform:translate3d(-50%, -50%, 0);width:100%;height:100%;max-width:1000px;max-height:950px;display:flex;align-items:center}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal{box-shadow:5px 5px 20px rgba(0, 0, 0, 0.2);border:1px solid color(gray, light);border-radius:3px;display:flex;flex-direction:column;width:100%}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal__header{flex-shrink:0;position:relative;color:#000}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal__header>button{z-index:5000;position:absolute;right:0;top:0}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal__header>button:before{color:#000;font-size:1rem;font-weight:600;border:2px solid #000}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal__title{font-size:1rem;font-weight:600;padding:0 4rem 0 0}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal__sub-title{font-size:1rem;padding:1rem 0 0 0}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal__content{flex-shrink:1;flex-grow:1;position:relative;overflow-y:auto;-webkit-overflow-scrolling:touch}.ds-lightbox.--dialog .ds-lightbox__container .ds-modal__footer{flex-shrink:0}.ds-lightbox.--mini-cart .ds-lightbox__container{padding:0 2rem}.ds-lightbox.--mini-cart .ds-lightbox__container .ds-modal{border-radius:0}.ds-lightbox.--mini-cart .ds-lightbox__container .ds-modal__header{position:relative}.ds-lightbox.--mini-cart .ds-lightbox__container .ds-modal__header .ds-button{position:absolute;top:0;right:0}.ds-lightbox.--mini-cart .ds-lightbox__container .ds-modal__title{padding:1.625rem 3rem 0.375rem 0.75rem}.ds-lightbox.--mini-cart .ds-lightbox__container .ds-modal__content{padding:1.25rem 0.75rem}.ds-js--modal-open{overflow:hidden}";

const DSModal = /*@__PURE__*/ proxyCustomElement(class DSModal extends HTMLElement {
  lightboxClassWatcher() {
    this.refreshCSSClasses();
  }
  shownWatchHandler() {
    const body = document.querySelector("body");
    if (this.shown) {
      body.classList.add("ds-js--modal-open");
      this.modalInit();
    }
    else {
      this.modalCloseHandler();
      this.isReady = false;
    }
    this[`modal${this.shown ? "Open" : "Close"}`].emit();
  }
  request_toggleModal_eventHandler(event) {
    const { show } = event.details;
    this.toggle(show);
  }
  request_showModal_eventHandler() {
    this.toggle(true);
  }
  request_hideModal_eventHandler() {
    this.toggle(false);
  }
  constructor() {
    super();
    this.__registerHost();
    this.modalClose = createEvent(this, "modalClose", 7);
    this.modalOpen = createEvent(this, "modalOpen", 7);
    this.documentKeyDownHandler = throttle(e => {
      e = e || window.event;
      let isEscape = false;
      if ("key" in e) {
        isEscape = e.key === "Escape" || e.key === "Esc";
      }
      else {
        isEscape = e.keyCode === 27;
      }
      if (isEscape) {
        this.hide();
      }
    }, 500, true, false);
    this.shown = false;
    this.overlay = false;
    this.redirectToOnClose = false;
    this.isHeaderDisabled = false;
    this.isSubtitleDisabled = false;
    this.isFooterDisabled = false;
    this.isLayoutDisabled = false;
    this.isClosingDisabled = false;
    this.lightboxClass = { "--dialog": true };
    this.lightboxClassObject = undefined;
    this.useSnack = false;
    this.darkBackground = false;
    this.closeButtonMods = ["modal-close"];
    this.isReady = false;
    this.refreshCSSClasses();
    this.closeButtonClickHandler = this.closeButtonClickHandler.bind(this);
    this.modalMouseDownHandler = this.modalMouseDownHandler.bind(this);
    this.modalMouseUpHandler = this.modalMouseUpHandler.bind(this);
  }
  disconnectedCallback() {
    this.modalCloseHandler();
  }
  refreshCSSClasses() {
    this.lightboxClassObject = typeof this.lightboxClass === "string"
      ? JSON.parse(this.lightboxClass)
      : this.lightboxClass;
  }
  /**
   * Toggle modal display
   *
   * @param {boolean} mustShow: Wether to show or hide modal
   */
  toggle(mustShow) {
    this.shown = mustShow;
  }
  /**
   * Request modal show
   */
  show() {
    this.toggle(true);
  }
  /**
   * Request modal hide
   */
  hide() {
    if (this.redirectToOnClose) {
      window.location.href = window.location.origin;
    }
    if (this.modalClose) {
      this.modalClose.emit();
    }
    else {
      this.toggle(false);
    }
  }
  /**
   * Initialize modal
   */
  modalInit() {
    if (!this.isReady) {
      if (!this.isClosingDisabled) {
        document.addEventListener("keyup", this.documentKeyDownHandler);
      }
      this.isReady = true;
    }
  }
  modalCloseHandler() {
    const body = document.querySelector("body");
    body.classList.remove("ds-js--modal-open");
    body.style.overflow = "visible";
    document.removeEventListener("keyup", this.documentKeyDownHandler);
  }
  modalMouseDownHandler(event) {
    if (!this.isClosingDisabled &&
      !event.target.closest(".ds-modal")) {
      this.hide();
    }
  }
  modalMouseUpHandler(event) {
    event.preventDefault();
  }
  closeButtonClickHandler() {
    this.hide();
  }
  render() {
    return (h(Host, null, this.shown && (h("div", { class: Object.assign({ "ds-lightbox": true, "--no-layout": this.isLayoutDisabled, "--overlay": this.overlay, "--dark-overlay": !this.overlay && this.darkBackground }, this.lightboxClassObject), onMouseDown: this.modalMouseDownHandler, onMouseUp: this.modalMouseUpHandler }, h("div", { class: "ds-lightbox__container" }, h("div", { class: "ds-modal" }, this.isLayoutDisabled ? (h("div", { class: "ds-modal__content" }, h("slot", { name: "content" }))) : (h(Fragment, null, !this.isHeaderDisabled && (h("header", { class: "ds-modal__header" }, h("div", { class: "ds-modal__title" }, h("slot", { name: "title" })), !this.isSubtitleDisabled && (h("div", { class: "ds-modal__sub-title" }, h("slot", { name: "subTitle" }))), !this.isClosingDisabled && (h("ds-button", { mods: this.closeButtonMods, onClick: this.closeButtonClickHandler })))), h("div", { class: "ds-modal__content" }, h("slot", null), h("slot", { name: "content" })), !this.isFooterDisabled && (h("footer", { class: "ds-modal__footer" }, h("slot", { name: "footer" })))))))))));
  }
  get container() { return this; }
  static get watchers() { return {
    "lightboxClass": ["lightboxClassWatcher"],
    "shown": ["shownWatchHandler"]
  }; }
  static get style() { return modalCss; }
}, [4, "ds-modal", {
    "shown": [1540],
    "overlay": [4],
    "redirectToOnClose": [4, "redirect-to-pronto-on-close"],
    "isHeaderDisabled": [4, "is-header-disabled"],
    "isSubtitleDisabled": [4, "is-subtitle-disabled"],
    "isFooterDisabled": [4, "is-footer-disabled"],
    "isLayoutDisabled": [4, "is-layout-disabled"],
    "isClosingDisabled": [1028, "is-closing-disabled"],
    "lightboxClass": [1032, "lightbox-class"],
    "lightboxClassObject": [8, "lightbox-class-object"],
    "useSnack": [4, "use-pronto"],
    "darkBackground": [4, "dark-background"],
    "closeButtonMods": [1040],
    "isReady": [32]
  }, [[0, "request_toggleModal_event", "request_toggleModal_eventHandler"], [0, "request_showModal_event", "request_showModal_eventHandler"], [0, "request_hideModal_event", "request_hideModal_eventHandler"]]]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-modal", "ds-button"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-modal":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSModal);
      }
      break;
    case "ds-button":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
  } });
}

const DsModal = DSModal;
const defineCustomElement = defineCustomElement$1;

export { DsModal, defineCustomElement };

//# sourceMappingURL=ds-modal.js.map