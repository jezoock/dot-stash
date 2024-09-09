import { proxyCustomElement, HTMLElement, h, Fragment } from '@stencil/core/internal/client';
import { _ as _ds } from './dot-stash.js';
import { d as defineCustomElement$2 } from './button.js';

const videoCss = ".ds-button.--video.--play{font-size:10rem}.ds-button.--video.--play:before{color:#fff;cursor:pointer}.ds-button.--video.--pause{font-size:10rem}.ds-button.--video.--pause:before{color:#fff;cursor:pointer}.ds-video{position:relative;width:100%;overflow:hidden}.ds-video__player{width:100%}.ds-video__pause-button,.ds-video__play-button{position:absolute;top:50%;left:50%;transform:translate3d(-50%, -50%, 0);transition:opacity ease 0.4s;z-index:10}.ds-video__play-button{opacity:0.2}.ds-video__pause-button{opacity:0}.ds-video:hover .ds-video__pause-button,.ds-video:hover .ds-video__play-button{opacity:0.7}";

const DSVideo = /*@__PURE__*/ proxyCustomElement(class DSVideo extends HTMLElement {
  //#region PROP WATCHERS
  dsmodsChangeHandler(mods) {
    this.CSSClassList = _ds.props.toClassList("ds-video", _ds.props.toArray(mods));
  }
  //#endregion
  //#region METHODS
  async play() {
    if (!this.isPlaying) {
      if (!this.isReady) {
        this.isReady = true;
      }
      this.isPlaying = true;
      this.isPaused = false;
      const videoPlayer = this.getPlayer();
      videoPlayer.play();
    }
  }
  async stop() {
    const videoPlayer = this.getPlayer();
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.load();
  }
  async pause() {
    this.isPlaying = false;
    this.isPaused = true;
    const videoPlayer = this.getPlayer();
    videoPlayer.pause();
  }
  async mute() {
    this.isMuted = true;
  }
  async unmute() {
    this.isMuted = false;
  }
  //#endregion
  //#region LYFECYCLE
  constructor() {
    super();
    this.__registerHost();
    this.isReady = false;
    this.useControls = false;
    this.playOnload = false;
    this.mods = [];
    this.sources = [];
    this.poster = undefined;
    this.autoplay = false;
    this.controls = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.isMuted = false;
    this.playButtonclickHandler = this.playButtonclickHandler.bind(this);
    this.pauseButtonclickHandler = this.pauseButtonclickHandler.bind(this);
    this.stopButtonclickHandler = this.stopButtonclickHandler.bind(this);
    this.muteButtonclickHandler = this.muteButtonclickHandler.bind(this);
    this.unmuteButtonclickHandler = this.unmuteButtonclickHandler.bind(this);
  }
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-video", _ds.props.toArray(this.mods));
    this.useControls = _ds.props.isTrue(this.controls);
    this.playOnload = _ds.props.isTrue(this.autoplay);
    this.videoSources = _ds.props.toArray(this.sources);
  }
  componentDidLoad() {
    if (this.autoplay) {
      this.play();
    }
  }
  //#endregion
  //#region UTILS
  getPlayer() {
    return this.container.querySelector("video");
  }
  //#endregion
  //#region HANDLERS
  playButtonclickHandler() {
    this.play();
  }
  pauseButtonclickHandler() {
    this.pause();
  }
  stopButtonclickHandler() {
    this.stop();
  }
  muteButtonclickHandler() {
    this.mute();
  }
  unmuteButtonclickHandler() {
    this.unmute();
  }
  //#endregion
  render() {
    return (h("div", { class: Object.assign(Object.assign({}, this.CSSClassList), { [`--playing`]: this.isPlaying, [`--paused`]: this.isPaused, [`--muted`]: this.isMuted }) }, h("video", { class: "ds-video__player", poster: this.poster, controls: this.useControls && this.isReady, muted: this.autoplay, autoplay: this.autoplay, onPlay: this.playButtonclickHandler, onPause: this.pauseButtonclickHandler }, this.videoSources.map(source => h("source", { src: source, type: `video/${_ds.tools.getFileExtension(source)}` }))), h("slot", { name: "controls" }), this.useControls && (h(Fragment, null, h("ds-button", { class: "ds-video__pause-button", mods: ['video-player', 'pause'], onClick: this.pauseButtonclickHandler }), h("ds-button", { class: "ds-video__play-button", mods: ['video-player', 'play'], onClick: this.playButtonclickHandler }), h("ds-button", { class: "ds-video__mute-button", mods: ['video-player', "mute"], onClick: this.muteButtonclickHandler }), h("ds-button", { class: "ds-video__unmute-button", mods: ['video-player', "unmute"], onClick: this.unmuteButtonclickHandler })))));
  }
  get container() { return this; }
  static get watchers() { return {
    "mods": ["dsmodsChangeHandler"]
  }; }
  static get style() { return videoCss; }
}, [4, "ds-video", {
    "mods": [1040],
    "sources": [1040],
    "poster": [1537],
    "autoplay": [1540],
    "controls": [1540],
    "isPlaying": [32],
    "isPaused": [32],
    "isMuted": [32],
    "play": [64],
    "stop": [64],
    "pause": [64],
    "mute": [64],
    "unmute": [64]
  }]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["ds-video", "ds-button"];
  components.forEach(tagName => { switch (tagName) {
    case "ds-video":
      if (!customElements.get(tagName)) {
        customElements.define(tagName, DSVideo);
      }
      break;
    case "ds-button":
      if (!customElements.get(tagName)) {
        defineCustomElement$2();
      }
      break;
  } });
}

const DsVideo = DSVideo;
const defineCustomElement = defineCustomElement$1;

export { DsVideo, defineCustomElement };

//# sourceMappingURL=ds-video.js.map