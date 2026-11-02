import { Component, Element, Event, EventEmitter, Fragment, h, Host, Prop, State, Method } from '@stencil/core';
import { isTrue, toArray, toClassList } from '../../utils/props';
import debounce from '../../utils/debounce';

type VideoFormat = 'mp4' | 'mov' | 'wmv' | 'webm' | 'avi' | 'flv' | 'mks' | 'mts';

interface VideoSource {
  path: string;
  fileFormat: VideoFormat;
}
type VideoSources = VideoSource[];
const allowedVideoFormat: VideoFormat[] = ['mp4', 'mov', 'wmv', 'webm', 'avi', 'flv', 'mks', 'mts'];

/**
 * A video player. The host has the `--playing` class while the video plays, `--paused` once paused, neither when
 * stopped (`stop()`), and `--muted` while muted. When the browser refuses to play, it keeps its former state (see `playError`).
 */
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

  /**
   * Emitted when the browser refuses to play the video (the promise of the player's `play()` is rejected), for
   * example with a `NotAllowedError` when autoplay is blocked. The component is then back to its state before the
   * call: not playing. Detail: `{ error }`. A `play()` interrupted by `pause()` or `stop()` emits nothing.
   */
  @Event() playError: EventEmitter<{ error: unknown }>;

  //#region METHODS

  /**
   * Plays the video. Resolves at once, without waiting for the player (which can wait for its source for ever):
   * a refusal of the player is reported with `playError`.
   */
  @Method()
  async play() {
    if (this.isPlaying) {
      return;
    }

    const wasPaused = this.isPaused;
    this.isReady = true;
    this.isPlaying = true;
    this.isPaused = false;

    // A promise in all browsers (some returned undefined), and an exception thrown by play() is a rejection too.
    new Promise(resolve => resolve(this.getPlayer().play())).catch(error => this.playRejectionHandler(error, wasPaused));
  }

  /** Stops the video: paused, back to the beginning, reloaded. Neither `--playing` nor `--paused`. */
  @Method()
  async stop() {
    this.isPlaying = false;
    this.isPaused = false;
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

  /** The player refused to play: back to the state before play(), and `playError`. */
  playRejectionHandler(error: unknown, wasPaused: boolean) {
    // A pending play() interrupted by pause(), stop() or load() is rejected with an AbortError: they set the state.
    if ((error as Error)?.name === 'AbortError') {
      return;
    }
    // Unless another call has changed the state meanwhile.
    if (this.isPlaying) {
      this.isPlaying = false;
      this.isPaused = wasPaused;
    }
    this.playError.emit({ error });
  }

  /** The player started playing on its own (native controls, autoplay): the state follows, without a new play() call. */
  videoPlayHandler = () => {
    this.isReady = true;
    this.isPlaying = true;
    this.isPaused = false;
  };

  /**
   * The player paused (native controls, end of the video): paused, if it was playing. A pause caused by pause() or
   * stop() changes nothing: stop() must not end paused.
   */
  videoPauseHandler = () => {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.isPaused = true;
    }
  };

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
          onPlay={this.videoPlayHandler}
          onPause={this.videoPauseHandler}
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
