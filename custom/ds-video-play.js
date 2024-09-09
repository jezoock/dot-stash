import { proxyCustomElement, HTMLElement, h, Host } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';

const DSVideoPlay = /*@__PURE__*/ proxyCustomElement(class DSVideoPlay extends HTMLElement {
  constructor() {
    super();
    this.__registerHost();
    this.clickHandler = () => {
      this.videoPlayer.play();
    };
    this.target = undefined;
    this.disabled = false;
  }
  componentWillLoad() {
    this.isDisabled = _ds.props.isTrue(this.disabled);
  }
  componentDidLoad() {
    if (this.target) {
      this.videoPlayer = document.querySelector(`ds-video${this.target}`);
    }
    else {
      this.videoPlayer = this.container.closest('ds-video');
    }
  }
  render() {
    return (h(Host, { onClick: this.clickHandler }));
  }
  get container() { return this; }
}, [0, "ds-video-play", {
    "target": [513],
    "disabled": [520]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-video-play"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-video-play":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSVideoPlay);
      }
      break;
  } });
}

const DsVideoPlay = DSVideoPlay;
const defineCustomElement = defineCustomElement$1;

export { DsVideoPlay, defineCustomElement };

//# sourceMappingURL=ds-video-play.js.map