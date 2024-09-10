import { Component, Element, h, Host, Prop, State, Watch } from '@stencil/core/internal';
import _ds from '../../typescript/dot-stash';
import CssClassList from '../../components/types/css-class-list.interface';

@Component({
  tag: 'ds-vimeo',
})
export class DSVimeo {
  @Element() container: HTMLDivElement;

  @Prop({ mutable: true, reflect: true }) mods: string[] = [];
  @Prop() videoId: string;
  @Prop({ mutable: true, reflect: true }) loadingDelay: string = '10';
  
  @State() displayVideo: boolean = false;
  
  CSSClassList: CssClassList = {};

  //#region PROP WATCHERS

  @Watch('mods')
  modsChangeHandler( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-vimeo", _ds.props.toArray(mods));
  }

  //#endregion

  //#region LYFECYCLE
  
  constructor() {
    this.cleanListeners = this.cleanListeners.bind(this);
    this.injectIframe = this.injectIframe.bind(this);
  }

  componentWillLoad() {
    if (this.mods) {
      this.CSSClassList = _ds.props.toClassList("ds-vimeo", _ds.props.toArray(this.mods));
    }
  }

  componentDidLoad() {
    document.addEventListener("pointerdown", this.injectIframe, false)
    window.addEventListener("scroll", this.injectIframe, false);

    setTimeout(() => {
      if (!this.displayVideo) {
        this.injectIframe();
      }
    }, 2000)
  }
 
  disconnectedCallback() {
    this.cleanListeners();
  }

  //#endregion

  //#region UTILS

  cleanListeners() {
    window.removeEventListener("pointerdown", this.injectIframe);
    window.removeEventListener("scroll", this.injectIframe);
  }

  injectIframe() {
    setTimeout( () => {
        this.displayVideo = true;
        this.cleanListeners();
      }, parseInt(this.loadingDelay, 10)
    );
  }

  getPlayer() {
    return this.container.querySelector("video");
  }

  //#endregion

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
        }}
      >
        {this.displayVideo && (
          <iframe
            src={`https://player.vimeo.com/video/${this.videoId}?autoplay=1&loop=1&muted=1&title=0&portrait=0&byline=0&controls=0&keyboard=0&speed=0`}
            width="100%" 
            height="100%" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write" 
            title="Maloo intime - Libère la puissance de ta féminité avec Maloo"
          />
        )}
      </Host>
    );
  }
}