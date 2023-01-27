import { Component, Element, h, Prop, State, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';


@Component({
  tag: 'ds-video',
  styleUrl: 'video.scss'
})
export class DSVideo {

  @Element() container: HTMLDivElement;

  @Prop({mutable: true, reflect: true}) dsMods: string | string[] = [];
  @Prop({mutable: true, reflect: true}) dsSources: string | string[] = [];
  @Prop({mutable: true, reflect: true}) dsPoster: string;
  @Prop({mutable: true, reflect: true}) dsAutoplay: string | boolean = false;
  @Prop({mutable: true, reflect: true}) dsUseControls: string | boolean = false;
  
  @State() isPlaying: boolean = false;
  @State() isPaused: boolean = false;
  
  isReady: boolean = false;
  CSSClassList: any;
  useControls: boolean = false;
  autoplay: boolean = false;

  @Watch('dsMods')
  dsModsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-video", newMods);
  }
  
  constructor() {
    this.playButtonclickHandler = this.playButtonclickHandler.bind(this);
    this.pauseButtonclickHandler = this.pauseButtonclickHandler.bind(this);
    this.stopButtonclickHandler = this.stopButtonclickHandler.bind(this);
  }
  
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-video", this.dsMods);
    this.useControls = _ds.props.isTrue(this.dsUseControls);
    this.autoplay = _ds.props.isTrue(this.dsAutoplay);
    this.dsSources = _ds.props.toArray(this.dsSources);
  }
  
  componentDidLoad() {
    if( this.autoplay ) {
      this.play();
    }
  }

  play() {
    if( !this.isReady ) {
      this.isReady = true;
    }
    this.isPlaying = true;
    const videoPlayer = this.container.querySelector("video");
    videoPlayer.play();
  }

  stop() {
    this.isPlaying = false;
    const videoPlayer = this.container.querySelector("video");
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.load();
  }
  
  pause() {
    this.isPlaying = false;
    this.isPaused = true;
    const videoPlayer = this.container.querySelector("video");
    videoPlayer.pause();
  }

  playButtonclickHandler() {
    this.play();
  }

  pauseButtonclickHandler() {
    this.pause();
  }

  stopButtonclickHandler() {
    this.stop();
  }

  render() {
    return (
      <div class={{
        ...this.CSSClassList,
        [`--${this.isPlaying}`]: this.isPlaying,
        [`--${this.isPaused}`]: this.isPaused
      }}>
        <video
          class="ds-video__player"
          poster={this.dsPoster}
          controls={this.useControls && this.isReady as boolean}
          muted={this.autoplay as boolean}
          autoplay={this.autoplay as boolean}
        >
          {(this.dsSources as string[]).map( (source: string) => 
            <source
              src={source}
              type={`video/${_ds.tools.getFileExtension(source)}`}
            />
          )}
        </video>
        {this.useControls && (
          this.isPlaying ? (
            <ds-button
              class="ds-video__pause-button"        
              mods={['video', 'pause']}
              onClick={this.pauseButtonclickHandler}
            />
          ) : (
            <ds-button
              class="ds-video__play-button"        
              mods={['video', 'play']}
              onClick={this.playButtonclickHandler}
            />
          )
        )}
      </div>
    );
  }
}