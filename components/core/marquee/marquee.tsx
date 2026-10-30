import { Component, Method, h, Host, Prop, Watch, State, Element } from '@stencil/core';
import CssClassList from '../../utils/interfaces/css-class-list';
import { isTrue, toClassList, toNumber } from '../../utils/props';
import { DSMarqueeTransitionEnum } from './marquee.types';

interface DSMarqueeParams {
  transition: DSMarqueeTransitionEnum;
  speed: number;
  pauseOnHover: boolean;
}

const DSMarqueeDefaultParams = {
  transition: DSMarqueeTransitionEnum.SLIDE_RIGHT_TO_LEFT,
  speed: 10,
  pauseOnHover: false,
};

/**
 * Scrolling messages. The `--transition-<DSMarqueeTransitionEnum>` class names the transition
 * (`slide-rtl` by default); the messages scroll to the left at `speed` (see `start()`).
 */
@Component({
  tag: 'ds-marquee',
  styleUrl: 'marquee.scss',
})
export class DSSlideMsg {
  CSSClassList: CssClassList;
  blockName = 'ds-marquee';
  params: DSMarqueeParams = DSMarqueeDefaultParams;
  messageContainer: HTMLDivElement;
  /** requestAnimationFrame id of the running animation. */
  frameId: number;

  @Element() container: HTMLDivElement;

  @Prop({ reflect: true, mutable: true }) mods: string | string[] = [];
  /** Scrolling speed: `speed / 10` px every 4 ms (10 = 250 px/s); `0` does not scroll. */
  @Prop() speed: string | number = 10;
  /** Transition class (`DSMarqueeTransitionEnum`): `slide-ttb`, `slide-btt`, `slide-ltr` or `slide-rtl`. */
  @Prop() transition: string | DSMarqueeTransitionEnum = DSMarqueeDefaultParams.transition;
  @Prop() pauseOnHover: string | boolean = false;
  @Prop() color: string;
  @Prop() bgColor: string;

  @State() isPlaying: boolean = true;

  @Watch('speed')
  speedCahngeHandler(newSpeed: string | number) {
    this.params = {
      ...this.params,
      speed: toNumber(newSpeed),
    };
  }

  @Watch('pauseOnHover')
  pauseOnHoverCahngeHandler(pause: string | boolean) {
    this.params = {
      ...this.params,
      pauseOnHover: isTrue(pause),
    };
  }

  @Watch('mods')
  modsChangeHandler(mods: string | string[]) {
    this.CSSClassList = toClassList(this.blockName, mods);
  }

  constructor() {
    this.containerMouseInHandler = this.containerMouseInHandler.bind(this);
    this.containerMouseOutHandler = this.containerMouseOutHandler.bind(this);
    this.containerMouseMoveHandler = this.containerMouseMoveHandler.bind(this);
  }

  connectedCallback() {
    this.CSSClassList = toClassList(this.blockName, this.mods);
    this.params = {
      ...DSMarqueeDefaultParams,
      transition: this.transition as DSMarqueeTransitionEnum,
      speed: toNumber(this.speed),
      pauseOnHover: isTrue(this.pauseOnHover),
    };

    // componentDidLoad only runs once: restart the animation when the element is put back in the document.
    if (this.messageContainer && this.params.speed > 0) {
      this.start();
    }
  }

  disconnectedCallback() {
    this.stopAnimation();
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

  stopAnimation() {
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
    }
  }

  /**
   * Starts scrolling the messages to the left, from the beginning (a running animation is replaced).
   * The offset grows by `speed / 10` px every 4 ms: the pace of the former `setInterval(…, 0)`, which browsers
   * run every 4 ms; it is now computed on animation frames, which follow the display and stop in background tabs.
   */
  @Method()
  async start() {
    const messageContainer = this.container.querySelector(`.${this.blockName}__content`) as HTMLDivElement;
    const firstElement = messageContainer?.children[0] as HTMLElement;
    let offset = 0;
    let previousTime: number;

    this.stopAnimation();
    this.isPlaying = true;

    if (!firstElement) {
      return;
    }

    const step = (time: number) => {
      // Capped, so that the messages do not jump when a background tab comes back.
      const elapsed = previousTime === undefined ? 0 : Math.min(time - previousTime, 100);
      previousTime = time;

      if (this.isPlaying) {
        offset += (this.params.speed / 10) * (elapsed / 4);
      }
      if (offset > firstElement.clientWidth) {
        offset = 0;
      }
      firstElement.style.marginLeft = `-${offset}px`;

      this.frameId = requestAnimationFrame(step);
    };

    this.frameId = requestAnimationFrame(step);
  }

  play() {
    if (this.params.pauseOnHover && this.messageContainer) {
      this.isPlaying = true;
    }
  }

  containerMouseMoveHandler() {
    if (!window.ontouchstart) {
      this.pause();
    }
  }

  containerMouseInHandler() {
    if (!window.ontouchstart) {
      this.pause();
    }
  }

  containerMouseOutHandler() {
    if (!window.ontouchstart) {
      this.play();
    }
  }

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          '--playing': this.isPlaying,
          '--paused': !this.isPlaying,
          [`--transition-${this.params.transition}`]: true,
          '--no-scroll': this.params.speed === 0,
        }}
        onMouseOver={this.containerMouseMoveHandler}
        onMouseOut={this.containerMouseOutHandler}
      >
        <div class={`${this.blockName}__container`}>
          <div
            class={`${this.blockName}__content`}
            style={{
              color: this.color,
              backgroundColor: this.bgColor,
            }}
          >
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
