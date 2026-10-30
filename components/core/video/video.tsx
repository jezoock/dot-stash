import { Component, Element, Fragment, h, Host, Prop, State, Method } from '@stencil/core';
import { isTrue, toArray, toClassList } from '../../utils/props';
import debounce from '../../utils/debounce';

type VideoFormat = 'mp4' | 'mov' | 'wmv' | 'webm' | 'avi' | 'flv' | 'mks' | 'mts';

interface VideoSource {
  path: string;
  fileFormat: VideoFormat;
}
type VideoSources = VideoSource[];
const allowedVideoFormat: VideoFormat[] = ['mp4', 'mov', 'wmv', 'webm', 'avi', 'flv', 'mks', 'mts'];

@Component({
  tag: 'ds-video',
  styleUrl: 'video.scss',
})
export class DSVideo {
  @Element() container: HTMLDivElement;

  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) sources: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) poster: string;
  @Prop({ mutable: true, reflect: true }) autoplay = false;
  @Prop({ mutable: true, reflect: true }) controls = false;
  @Prop({ mutable: true, reflect: true }) loop = false;
  @Prop({ mutable: true, reflect: true }) playsinline = false;

  @State() isPlaying = false;
  @State() isPaused = false;
  @State() isMuted = false;

  isReady = false;
  useControls = false;
  playOnload = false;
  playOnLoop = false;
  videoSources: VideoSources;

  //#region METHODS

  @Method()
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

  @Method()
  async stop() {
    const videoPlayer = this.getPlayer();
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.load();
  }

  @Method()
  async pause() {
    this.isPlaying = false;
    this.isPaused = true;
    const videoPlayer = this.getPlayer();
    videoPlayer.pause();
  }

  @Method()
  async mute() {
    this.isMuted = true;
  }

  @Method()
  async unmute() {
    this.isMuted = false;
  }

  //#endregion

  //#region LYFECYCLE

  constructor() {
    this.playButtonclickHandler = this.playButtonclickHandler.bind(this);
    this.pauseButtonclickHandler = this.pauseButtonclickHandler.bind(this);
    this.stopButtonclickHandler = this.stopButtonclickHandler.bind(this);
    this.muteButtonclickHandler = this.muteButtonclickHandler.bind(this);
    this.unmuteButtonclickHandler = this.unmuteButtonclickHandler.bind(this);
  }

  componentWillLoad() {
    this.useControls = isTrue(this.controls);
    this.playOnload = isTrue(this.autoplay);
    this.playOnLoop = isTrue(this.loop);
    // Browsers only autoplay muted videos.
    this.isMuted = this.playOnload;

    const videoSources = toArray(this.sources).map(videoSource => ({ path: videoSource, fileFormat: this.getVideoFileFormat(videoSource) }));
    this.videoSources = videoSources;

    if (this.playOnload && !this.isOnScreen()) {
      window.addEventListener('scroll', this.scrollWatcher, false);
    }
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.scrollWatcher, false);
  }

  //#endregion

  //#region UTILS

  getPlayer() {
    return this.container.querySelector('video');
  }

  isOnScreen() {
    const { offsetTop } = this.container;
    return offsetTop - 50 < window.scrollY + window.innerHeight;
  }

  getVideoFileFormat(fileLocation: string): VideoFormat {
    const filename = fileLocation.split('/').pop();
    const fileExtension = filename.substring(filename.lastIndexOf('.') + 1, filename.length).toLowerCase() as VideoFormat;
    let videoFileFormat: VideoFormat = 'mp4';

    if (allowedVideoFormat.includes(fileExtension)) {
      videoFileFormat = fileExtension;
    }

    return videoFileFormat;
  }

  //#endregion

  //#region HANDLERS

  /** Autoplay below the fold: plays the video once it is scrolled on screen. Debounced once, and added and removed as is. */
  scrollWatcher = debounce(() => {
    if (this.isOnScreen()) {
      window.removeEventListener('scroll', this.scrollWatcher, false);
      this.play();
    }
  }, 50);

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
    return (
      <Host
        class={{
          ...toClassList('ds-video', this.mods),
          [`--playing`]: this.isPlaying,
          [`--paused`]: this.isPaused,
          [`--muted`]: this.isMuted,
        }}
      >
        <video
          class="ds-video__player"
          poster={this.poster}
          controls={this.useControls && this.isReady}
          muted={this.isMuted}
          autoplay={this.playOnload && this.isOnScreen()}
          onPlay={this.playButtonclickHandler}
          onPause={this.pauseButtonclickHandler}
          loop={this.playOnLoop}
          playsinline={this.playsinline}
        >
          {this.videoSources.map(({ path, fileFormat }) => (
            <source src={path} type={`video/${fileFormat}`} />
          ))}
        </video>
        <slot name="controls" />
        {this.useControls && (
          <Fragment>
            <ds-button class="ds-video__pause-button" mods={['video-player', 'pause']} label="Pause" onClick={this.pauseButtonclickHandler} />
            <ds-button class="ds-video__play-button" mods={['video-player', 'play']} label="Play" onClick={this.playButtonclickHandler} />
            <ds-button class="ds-video__mute-button" mods={['video-player', 'mute']} label="Mute" onClick={this.muteButtonclickHandler} />
            <ds-button class="ds-video__unmute-button" mods={['video-player', 'unmute']} label="Unmute" onClick={this.unmuteButtonclickHandler} />
          </Fragment>
        )}
      </Host>
    );
  }
}
