import { Component, Element, h, Prop, State, Watch, Method } from '@stencil/core/internal';
import { Fragment } from '@stencil/core/internal';
import _ds from '../dot-stash';

@Component({
  tag: 'ds-video',
  styleUrl: 'video.scss'
})
export class DSVideo {
  isReady = false;
  CSSClassList: Record<string, boolean>;
  useControls = false;
  playOnload = false;
  videoSources: string[];

  @Element() container: HTMLDivElement;

  @Prop({ mutable: true, reflect: true }) mods: string[] = [];
  @Prop({ mutable: true, reflect: true }) sources: string[] = [];
  @Prop({ mutable: true, reflect: true }) poster: string;
  @Prop({ mutable: true, reflect: true }) autoplay = false;
  @Prop({ mutable: true, reflect: true }) controls = false;
  
  @State() isPlaying = false;
  @State() isPaused = false;
  @State() isMuted = false;
  

  //#region PROP WATCHERS

  @Watch('mods')
  dsModsWatcher( mods: string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-video", _ds.props.toArray(mods));
  }

  //#endregion

  //#region METHODS

  @Method()
  async play() {
    if (!this.isPlaying) {
      if( !this.isReady ) {
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
    this.CSSClassList = _ds.props.toClassList("ds-video", _ds.props.toArray(this.mods));
    this.useControls = _ds.props.isTrue(this.controls);
    this.playOnload = _ds.props.isTrue(this.autoplay);
    this.videoSources = _ds.props.toArray(this.sources);
  }
  
  componentDidLoad() {
    if( this.autoplay ) {
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
    return (
      <div class={{
        ...this.CSSClassList,
        [`--playing`]: this.isPlaying,
        [`--paused`]: this.isPaused,
        [`--muted`]: this.isMuted
      }}>
        <video
          class="ds-video__player"
          poster={this.poster}
          controls={this.useControls && this.isReady}
          muted={this.autoplay}
          autoplay={this.autoplay}
          onPlay={this.playButtonclickHandler}
          onPause={this.pauseButtonclickHandler}
        >
          {this.videoSources.map( source => 
            <source
              src={source}
              type={`video/${_ds.tools.getFileExtension(source)}`}
            />
          )}
        </video>
        <slot name="controls" />
        {this.useControls && (
          <Fragment>
            <ds-button
              class="ds-video__pause-button"        
              mods={['video-player', 'pause']}
              onClick={this.pauseButtonclickHandler}
            />
            <ds-button
              class="ds-video__play-button"        
              mods={['video-player', 'play']}
              onClick={this.playButtonclickHandler}
            />
            <ds-button
              class="ds-video__mute-button"        
              mods={['video-player', "mute"]}
              onClick={this.muteButtonclickHandler}
            />
            <ds-button
              class="ds-video__unmute-button"        
              mods={['video-player', "unmute"]}
              onClick={this.unmuteButtonclickHandler}
            />
          </Fragment>
        )}
      </div>
    );
  }
}