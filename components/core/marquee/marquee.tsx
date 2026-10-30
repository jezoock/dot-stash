import { Component, Method, h, Host, Prop, Watch, State, Element } from '@stencil/core';
import CssClassList from '../../types/css-class-list.interface';
import _ds from '../../utils/dot-stash';

export enum DSMarqueeTransitionEnum {
  SLIDE_TOP_TO_BOTTOM = 'slide-ttb',
  SLIDE_BOTTOM_TO_TOP = 'slide-btt',
  SLIDE_LEFT_TO_RIGHT = 'slide-ltr',
  SLIDE_RIGHT_TO_LEFT = 'slide-rtl'
}

interface DSMarqueeParams {
  transition: DSMarqueeTransitionEnum;
  speed: number;
  pauseOnHover: boolean;
}

const DSMarqueeDefaultParams = {
  transition: DSMarqueeTransitionEnum.SLIDE_RIGHT_TO_LEFT,
  speed: 10,
  pauseOnHover: false,
}

@Component({
  tag: 'ds-marquee',
  styleUrl: 'marquee.scss'
})
export class DSSlideMsg {
  
  CSSClassList: CssClassList;
	blockName = "ds-marquee";
  params: DSMarqueeParams = DSMarqueeDefaultParams;
  messageContainer: HTMLDivElement;
  
  @Element() container: HTMLDivElement;

  @Prop({ reflect: true, mutable: true }) mods: string | string[] = [];
  @Prop() speed: string | number = 10;
  @Prop() transition: string | DSMarqueeTransitionEnum = "slide-left-to-right";
  @Prop() pauseOnHover: string | boolean = false;
  @Prop() color: string;
  @Prop() bgColor: string;

  @State() isPlaying: boolean = true;

  @Watch('speed')
	speedCahngeHandler(newSpeed: number) {
		this.params = {
      ...this.params,
      speed: newSpeed,
    }
	}

  @Watch('pauseOnHover')
	pauseOnHoverCahngeHandler(pause: boolean) {
		this.params = {
      ...this.params,
      pauseOnHover: pause,
    }
	}

  @Watch('mods')
	modsChangeHandler(mods: string | string[]) {
		this.CSSClassList = _ds.props.toClassList(this.blockName, mods);
	}

  constructor() {
    this.containerMouseInHandler = this.containerMouseInHandler.bind(this);
    this.containerMouseOutHandler = this.containerMouseOutHandler.bind(this);
    this.containerMouseMoveHandler = this.containerMouseMoveHandler.bind(this);
  }

  connectedCallback() {
    this.CSSClassList = _ds.props.toClassList(this.blockName, this.mods);
    this.params = {
      ...DSMarqueeDefaultParams,
      transition: this.transition as DSMarqueeTransitionEnum,
      speed: _ds.props.toNumber(this.speed),
      pauseOnHover: _ds.props.isTrue(this.pauseOnHover),
    }
  }

  componentDidLoad() {
    const messageContainer = this.container.querySelector(`.${this.blockName}__content`) as HTMLDivElement;
    const clone = messageContainer.innerHTML;
    const { speed } = this.params;

    this.messageContainer = messageContainer;
    
    if (speed > 0) {
      messageContainer.insertAdjacentHTML('beforeend', clone);
      messageContainer.insertAdjacentHTML('beforeend', clone);
      this.start();
    }
  }

  pause() {
    if (this.params.pauseOnHover && this.messageContainer) {
      this.isPlaying = false;
    }
  }

  @Method()
  async start() {
    const messageContainer = this.container.querySelector(`.${this.blockName}__content`) as HTMLDivElement;
    const firstElement = messageContainer.children[0] as HTMLElement;
    let i = 0;

    this.isPlaying = true;

    setInterval(() => {
      firstElement.style.marginLeft = `-${i}px`;
      if (i > firstElement.clientWidth) {
        i = 0;
      }
      if (this.isPlaying) {
        i = i + this.params.speed / 10;
      }
    }, 0);
  }

  play() {
    if (this.params.pauseOnHover && this.messageContainer) {
      this.isPlaying = true;
    }
  }

  containerMouseMoveHandler() {
    if(!window.ontouchstart) {
      this.pause();
    }
  }
  
  containerMouseInHandler() {
    if(!window.ontouchstart) {
      this.pause();
    }
  }
  
  containerMouseOutHandler() {
    if(!window.ontouchstart) {
      this.play();
    }
  }
  
  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          "--playing": this.isPlaying,
          "--paused": !this.isPlaying,
          [`--transition-${this.params.transition}`]: true,
          "--no-scroll": this.params.speed === 0
        }}
        onMouseOver={this.containerMouseMoveHandler}
        onMouseOut={this.containerMouseOutHandler}
      >
        <div class={`${this.blockName}__container`}>
          <div class={`${this.blockName}__content`}
            style={{ 
              color: this.color, 
              backgroundColor: this.bgColor 
            }}
          >
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}