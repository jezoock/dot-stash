import { Component, Element, Event, EventEmitter, forceUpdate, h, Prop, Watch, Listen, Method, State } from '@stencil/core';
import { set as setCss, toNumber as cssToNumber } from '../../utils/css';
import { getFocusedElement } from '../../utils/focus';
import { fromJSON, toClassList } from '../../utils/props';
import { TransitionWait, waitForTransition } from '../../utils/transition';
import { formatLabel } from '../../utils/labels';
import { DSSliderDefaultLabels } from './slider.constants';
import { DSSliderLabels, DSSliderParams } from './slider.types';

let sliderId = 0;

const defaultSliderSelectors = {
  sliderContainer: '.ds-slider',
  menu: 'ds-slider-menu',
  list: '.ds-slider__list:not(ds-slider-item .ds-slider__list)',
  items: 'ds-slider-item:not(ds-slider-item ds-slider-item)',
};

const DSSliderDefaults: DSSliderParams = {
  orientation: 'hrt',
  direction: 1,
  index: 0,
  loop: true,
  autoplay: false,
  autoHeight: true,
  step: 1,
  duration: 4000,
  forceItemDspCount: 0,
  minItemDspCount: 0,
  selectors: defaultSliderSelectors,
  isActive: true,
  controls: true,
  draggable: true,
};

const prefersReducedMotion = (): boolean => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A carousel (WAI-ARIA carousel pattern): its slides (`ds-slider-item`) slide in a row, moved by the previous and next
 * buttons, the dots of its menu (`params.menu`), a swipe, or the automatic rotation (`params.autoplay`).
 * The slider is a `region` (`aria-roledescription="carousel"`) named by `label`; each slide a `group`
 * (`aria-roledescription="slide"`) named "2 of 5"; the slides out of view are inert. With the automatic rotation, the
 * slider renders a button that stops and starts it, first in the Tab order; the rotation stops when the focus enters the
 * slider, and pauses while the pointer is over it; it does not start with less motion. The list of slides is a polite
 * live region (`aria-live`) but while it rotates. The texts read by assistive technologies are `labels`.
 *
 * @slot - The `ds-slider-item` elements.
 */
@Component({
  tag: 'ds-slider',
  styleUrl: 'slider.scss',
})
export class DSSlider {
  @Element() host: HTMLDivElement;

  @Prop({ mutable: true, reflect: true }) sliderId: string = `slide-${sliderId++}`;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) params: DSSliderParams | string = {};
  @Prop({ mutable: true, reflect: true }) type = 'sld';
  /** The accessible name of the carousel (`aria-label`): what its slides are ("Featured products"). */
  @Prop() label: string;
  /**
   * The texts read by assistive technologies, to translate them (JSON as an attribute): `carousel` and `slide` (the
   * `aria-roledescription` of the slider and of a slide), `slideName` (the name of a slide, `{index} of {count}`),
   * `previous`, `next`, `play`, `pause` (the names of the buttons), `menu` and `menuItem` (the names of the menu and of a
   * dot, `Slide {index}`). Each one has an English default.
   */
  @Prop() labels: DSSliderLabels | string = {};

  @State() isTransitionStarted = false;

  /**
   * Whether initialize() has measured the slider. Not a @State: initialize() runs in componentDidLoad, where a state
   * change makes Stencil warn; it requests the render that shows the measured state itself (see initialize()).
   */
  isReady = false;
  softCleanup = false;

  currentItem: { obj: HTMLDsSliderItemElement; index: number; dTime?: number | null } = {
    obj: null,
    index: 0,
    dTime: null,
  };

  sliderContener: HTMLDivElement;
  list: HTMLElement;
  items: HTMLDsSliderItemElement[];
  listLen = 0;
  dspDim = 0;
  itemWidth = 0;
  itemHeight = 0;
  dspItems = 0;
  listDim = 0;
  step = 1;
  timer: ReturnType<typeof setTimeout> = null;
  duration = 4000;
  menu: HTMLElement;
  transitionDirection: string;

  isScrollable = false;
  isDraggable = false;
  /**
   * Whether the automatic rotation is on (`params.autoplay`): stopped by `stop()`, the rotation button, or the focus
   * entering the slider; started again by `play()` or the button. Not a @State: changed in componentDidLoad too, it
   * requests its render (forceUpdate).
   */
  isPlaying = true;
  /** Whether the pointer is over the slider: the rotation pauses. */
  isHovered = false;

  isDragging = false;
  xStart = 0;
  yStart = 0;
  startDrag = 0;
  swipeDelay = 200;

  options: DSSliderParams;

  /** The wait for the end of the slide, while it runs. */
  private slide: TransitionWait;
  /** The start of a slide, 50 ms after its first state. */
  private slideTimer: ReturnType<typeof setTimeout>;
  /** The index of each slide among the slides, from 0: a copy made for the loop has the index of its slide. */
  private slideIndexes = new WeakMap<Element, number>();
  /** The slides that have an `aria-label` of their own, which the slider keeps. */
  private ownLabels = new WeakSet<Element>();
  /** The previous / next button that had the focus before a render: it is given to the other one if it is removed. */
  private focusedButton: HTMLElement | null = null;

  @Watch('params')
  paramsChangeHandler(newParams: DSSliderParams) {
    if (newParams) {
      const { isActive: previousIsActive } = this.options;
      const { isActive } = newParams;
      this.options = { ...this.options, ...fromJSON(newParams) };

      if (typeof isActive !== 'undefined' && previousIsActive !== isActive) {
        if (isActive) {
          this.initialize();
        } else {
          this.reset();
        }
      }
    }
  }

  @Watch('labels')
  labelsChangeHandler() {
    this.labelSlides();
  }

  @Event() sliderEvent: EventEmitter<{ slide: string; direction: number; currentIndex?: number }>;

  @Listen('request_displaySliderItem_event')
  async request_displaySliderItem_eventHandler({ detail: { index } }) {
    const step = index - this.currentItem.index;
    if (step !== 0 && !this.isTransitionStarted) {
      await this[step < 0 ? 'prev' : 'next'](Math.abs(step));
    }
  }

  /** The focus entering the slider stops the rotation (WAI-ARIA carousel pattern): it starts again from the button only. */
  @Listen('focusin')
  focusInHandler(event: FocusEvent) {
    const from = event.relatedTarget as Node | null;
    if (this.options.autoplay && this.isPlaying && !(from && this.host.contains(from))) {
      this.stop();
    }
  }

  /** The pointer over the slider pauses the rotation, until it leaves. */
  @Listen('mouseenter')
  mouseEnterHandler() {
    this.isHovered = true;
    if (this.options.autoplay) {
      clearTimeout(this.timer);
      forceUpdate(this);
    }
  }

  @Listen('mouseleave')
  mouseLeaveHandler() {
    this.isHovered = false;
    if (this.options.autoplay) {
      if (!this.isTransitionStarted) {
        this.continue();
      }
      forceUpdate(this);
    }
  }

  constructor() {
    this.prevButtonClickHandler = this.prevButtonClickHandler.bind(this);
    this.nextButtonClickHandler = this.nextButtonClickHandler.bind(this);
    this.rotationButtonClickHandler = this.rotationButtonClickHandler.bind(this);
    this.pointerDownHandler = this.pointerDownHandler.bind(this);
    this.pointerUpHandler = this.pointerUpHandler.bind(this);
    this.pointerMoveHandler = this.pointerMoveHandler.bind(this);
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
    clearTimeout(this.slideTimer);
    this.slide?.cancel();
    this.slide = undefined;
    this.list?.removeEventListener('touchstart', this.pointerDownHandler, false);
    this.list?.removeEventListener('touchend', this.pointerUpHandler, false);
    this.list?.removeEventListener('touchmove', this.pointerMoveHandler, false);
  }

  componentWillLoad() {
    const optionsFromProps = fromJSON(this.params);
    this.options = { ...DSSliderDefaults, ...optionsFromProps, selectors: { ...DSSliderDefaults.selectors, ...optionsFromProps.selectors } };
    // Less motion: the automatic rotation does not start; the rotation button can start it.
    if (this.options.autoplay && prefersReducedMotion()) {
      this.isPlaying = false;
    }
  }

  componentDidLoad() {
    this.sliderContener = this.host.querySelector(this.options.selectors.sliderContainer);
    this.list = this.getList();
    this.items = Array.from(this.getListItems());
    this.listLen = this.items.length;
    this.dspDim = this.sliderContener[`offset${this.options.orientation === 'vtc' ? 'Height' : 'Width'}`];
    if (this.options.isActive) {
      this.initialize();
    }
  }

  componentWillRender() {
    const focused = getFocusedElement();
    this.focusedButton = focused?.matches?.('.ds-slider__prev-button, .ds-slider__next-button') && this.host.contains(focused) ? focused : null;
  }

  componentDidRender() {
    // A previous / next button that had the focus is no longer rendered (the first or last slide, without loop): the
    // focus goes to the other one, rather than to the page.
    if (this.focusedButton && !this.focusedButton.isConnected) {
      this.host.querySelector<HTMLElement>('.ds-slider__prev-button, .ds-slider__next-button')?.focus();
    }
    this.focusedButton = null;
  }

  @Method()
  async reset() {}

  @Method()
  async initialize() {
    if (!this.isReady) {
      this.refresh(true);

      if (this.isScrollable) {
        if (this.options.autoHeight && this.options.orientation === 'hrt') {
          setCss({ height: `${this.itemHeight}px` } as Partial<CSSStyleDeclaration>, [this.sliderContener]);
        }
        this.step = this.options.step;
        if (this.options.menu) {
          this.menu = this.host.querySelector<HTMLElement>(this.options.selectors.menu);
        }
      }

      this.isReady = true;
      // The render depends on what refresh() measured in the rendered DOM (the prev/next triggers need isScrollable,
      // the --scrollable and --isReady classes, the menu's item count): one render to show it, as before.
      forceUpdate(this);
    }
  }

  getList(): HTMLElement {
    return this.host.querySelector(this.options.selectors.list);
  }

  getListItems(): HTMLDsSliderItemElement[] {
    return Array.from(this.host.querySelectorAll<HTMLDsSliderItemElement>(this.options.selectors.items));
  }

  /** The texts read by assistive technologies: `labels` over the English defaults. */
  getLabels(): Required<DSSliderLabels> {
    let labels: DSSliderLabels = {};
    try {
      labels = fromJSON(this.labels ?? {}) as DSSliderLabels;
    } catch {
      console.error('[ds-slider] labels is not valid JSON');
    }
    return { ...DSSliderDefaultLabels, ...labels };
  }

  /**
   * The slides are groups (`aria-roledescription="slide"`) named by their place, "2 of 5" (`labels.slideName`), unless
   * they have an `aria-label` of their own. A slide is numbered from its place among the slides the first time the
   * slider sees it; the copies made for the loop keep the number of their slide.
   */
  labelSlides() {
    const labels = this.getLabels();
    const items = this.getListItems();
    const count = this.listLen || items.length;

    items.forEach((item, position) => {
      if (!this.slideIndexes.has(item)) {
        this.slideIndexes.set(item, position);
        if (item.hasAttribute('aria-label')) {
          this.ownLabels.add(item);
        }
      }
      if (!item.hasAttribute('role')) {
        item.setAttribute('role', 'group');
      }
      item.setAttribute('aria-roledescription', labels.slide);
      if (!this.ownLabels.has(item)) {
        item.setAttribute('aria-label', formatLabel(labels.slideName, { index: this.slideIndexes.get(item) + 1, count }));
      }
    });
  }

  /** A copy of a slide, for the loop: it keeps the number and the own label of the slide. */
  cloneSlide(item: HTMLDsSliderItemElement): HTMLDsSliderItemElement {
    const clone = item.cloneNode(true) as HTMLDsSliderItemElement;
    if (this.slideIndexes.has(item)) {
      this.slideIndexes.set(clone, this.slideIndexes.get(item));
    }
    if (this.ownLabels.has(item)) {
      this.ownLabels.add(clone);
    }
    return clone;
  }

  /**
   * The slides out of view are inert (out of the Tab order and of the accessibility tree): those out of
   * `[first, first + the number of slides in view)` in the list. Without a slide to scroll, they are all in view.
   */
  setVisibleSlides(first = 0) {
    this.getListItems().forEach((item, position) => {
      if (!this.isScrollable || (position >= first && position < first + this.dspItems)) {
        item.removeAttribute('inert');
      } else {
        item.setAttribute('inert', '');
      }
    });
  }

  @Method()
  async refresh(reset: boolean = false) {
    if (!this.isTransitionStarted) {
      this.list = this.getList();
      this.items = this.getListItems();
      this.listLen = this.items.length;
      this.itemWidth = 0;
      this.itemHeight = 0;

      this.options.xOffset = cssToNumber('marginLeft', this.list);
      this.dspDim = this.sliderContener[`offset${this.options.orientation === 'vtc' ? 'Height' : 'Width'}`];

      this.list.removeAttribute('style');

      if (this.options.autoplay) {
        clearTimeout(this.timer);
      }

      let listWidth = 0;
      let listHeight = 0;

      this.items.forEach(item => {
        item.removeAttribute('style');
        const { offsetWidth, offsetHeight } = item;

        if (!this.options.autoWidth) {
          listWidth += offsetWidth;
          listHeight += offsetHeight;

          setCss(
            {
              maxWidth: `${offsetWidth}px`,
              maxHeight: `${offsetHeight}px`,
            },
            [item],
          );
        }

        if (offsetWidth > this.itemWidth) {
          this.itemWidth = offsetWidth;
        }

        if (offsetHeight > this.itemHeight) {
          this.itemHeight = offsetHeight;
        }
      });

      if (this.options.forceItemDspCount) {
        this[`item${this.options.orientation == 'hrt' ? 'Width' : 'Height'}`] = Math.ceil(this.dspDim / this.options.forceItemDspCount);
      }

      const itemHeight = this.options.forceHeight
        ? this.options.forceHeight
        : this.options.orientation === 'hrt'
          ? this.options.autoHeight
            ? this.itemHeight
            : 'auto'
          : this.itemHeight;

      if (this.options.autoWidth) {
        setCss({ height: `${itemHeight}px`, width: `${this.itemWidth}px` }, this.items);
        this.listDim = this.listLen * this[this.options.orientation === 'vtc' ? 'itemHeight' : 'itemWidth'];
      } else {
        this.listDim = this.options.orientation === 'vtc' ? listHeight : listWidth;
      }

      this.dspItems = this.options.forceItemDspCount
        ? this.options.forceItemDspCount
        : Math.ceil(this.dspDim / this[this.options.orientation === 'vtc' ? 'itemHeight' : 'itemWidth']);

      if (this.dspItems < this.options.minItemDspCount) {
        this.dspItems = this.options.minItemDspCount;
      }

      this.dspDim = this.sliderContener[`offset${this.options.orientation === 'vtc' ? 'Height' : 'Width'}`];
      this.isScrollable = this.listDim > this.dspDim || (this.options.loop && this.dspItems === this.listLen);

      this.list.classList.add(this.options.orientation);

      if (this.options.orientation === 'vtc') {
        setCss(
          {
            width: `${this.itemWidth}px`,
            height: `${this.listDim}px`,
          },
          [this.list],
        );

        setCss(
          {
            width: `${this.itemWidth}px`,
          },
          [this.sliderContener],
        );
      } else {
        setCss(
          {
            width: `${this.listDim < this.dspDim ? this.dspDim : this.listDim}px`,
            height: `${this.itemHeight}px`,
          },
          [this.list],
        );

        setCss(
          {
            height: `${this.itemHeight}px`,
          },
          [this.sliderContener],
        );
      }

      if (this.options.step > this.dspItems || this.listLen === 1) {
        this.options.step = this.dspItems;
        this.isScrollable = false;
      }

      if (this.isScrollable) {
        if (this.currentItem.obj === null || reset || false) {
          this.currentItem = {
            index: this.options.index,
            obj: this.items[this.options.index],
            dTime: this.options.duration,
          };
        }

        this.continue();
      }

      this.labelSlides();
      this.setVisibleSlides(0);

      setCss({ opacity: '1' } as Partial<CSSStyleDeclaration>, [this.sliderContener]);

      if (this.options.draggable) {
        this.list.addEventListener('touchstart', this.pointerDownHandler, { passive: true });
        this.list.addEventListener('touchend', this.pointerUpHandler, { passive: true });
        this.list.addEventListener('touchmove', this.pointerMoveHandler, { passive: true });
      }
    }
  }

  @Method()
  async pointerDownHandler(event: TouchEvent): Promise<void> {
    const { clientX: xStart } = event.touches[0];
    this.isDragging = true;
    this.xStart = xStart;
    this.startDrag = +new Date();
  }

  @Method()
  async pointerMoveHandler(): Promise<void> {}

  @Method()
  async pointerUpHandler(event: TouchEvent): Promise<void> {
    const dragTime = +new Date() - this.startDrag;

    const { clientX: xEnd } = event.changedTouches[0];
    const translation = this.xStart - xEnd;

    if (this.isDragging) {
      this.isDragging = false;
      const distance = Math.abs(translation);
      const action = translation < 0 ? 'prev' : 'next';

      if (dragTime < this.swipeDelay && distance > 50) {
        setTimeout(() => this[action](), 0);
      } else if (dragTime > 300 && distance > this.itemWidth / 2) {
        this.softCleanup = false;
        const step = Math.floor(distance / this.itemWidth) + 1;
        setTimeout(() => this[action](step, distance), 0);
      }
    }
  }

  @Method()
  async goTo(itemIndex: number) {
    const {
      currentItem: { index },
    } = this;
    const step = index - itemIndex;
    let move = Math.abs(step);
    if (step !== 0) {
      if (step >= this.listLen) {
        move = step - this.listLen;
      }

      if (step < -this.listLen) {
        move = step + this.listLen;
      }

      this[step < 0 ? 'next' : 'prev'](move);
    }
  }

  /**
   * Starts the slide of the list to its transform `to`, after 50 ms, and calls the end handler of the direction at its
   * end: on the `transitionend` event of the list, at once when it does not slide (a duration of 0, less motion), or when
   * its duration is over if the event does not come.
   */
  startSlide(to: Partial<CSSStyleDeclaration>, beforeSlide?: () => void) {
    this.slideTimer = setTimeout(() => {
      beforeSlide?.();
      this.slide?.cancel();
      this.slide = waitForTransition(this.list, () => {
        this.slide = undefined;
        this.slideEndHandler();
      });
      setCss(to, [this.list]);
      this.slide.measure();
    }, 50);
  }

  @Method()
  async next(step: number = this.options.step, startPosition: number = 0) {
    if (this.options.autoplay) {
      clearTimeout(this.timer);
    }

    if (!this.isTransitionStarted) {
      this.transitionDirection = 'next';
      this.sliderEvent.emit({
        slide: 'start-slide',
        direction: 1,
        currentIndex: this.currentItem.index,
      });
      this.isTransitionStarted = true;
      this.items = this.getListItems();

      const from: Partial<CSSStyleDeclaration> = {};
      const to: Partial<CSSStyleDeclaration> = {};

      if (this.options.orientation === 'vtc') {
        from.height = `${this.listDim + this.itemHeight * step}px`;
        from.transform = 'translate3d(0, 0, 0)';
        to.transform = `translate3d( 0, -${this.itemHeight * step}px, 0 )`;
      } else {
        const distance = this.itemWidth * step;
        const nextItemWidth = this.itemWidth * step;
        from.transform = `translate3d(-${startPosition}px, 0, 0)`;
        from.width = `${this.listDim + nextItemWidth}px`;
        to.transform = `translate3d( -${distance}px, 0, 0 )`;
      }

      for (let i = 0; i < step; i++) {
        this.list.appendChild(this.cloneSlide(this.items[i]));
      }
      // The slides that come in view are no longer inert at once (the live region reads them), those that go are.
      this.setVisibleSlides(step);

      setCss(from, [this.list]);

      this.step = step;
      this.getList().classList.add('--sliding');
      this.startSlide(to);
    }
  }

  @Method()
  async prev(step: number = this.options.step, startPosition: number = 0) {
    if (this.options.autoplay) {
      clearTimeout(this.timer);
    }

    if (!this.isTransitionStarted) {
      this.transitionDirection = 'prev';
      this.sliderEvent.emit({
        slide: 'start-slide',
        direction: -1,
        currentIndex: this.currentItem.index,
      });
      this.isTransitionStarted = true;
      this.items = this.getListItems();

      const from: Partial<CSSStyleDeclaration> = {};
      const to: Partial<CSSStyleDeclaration> = { transform: `translate3d(0,0,0)` };

      if (this.options.orientation === 'vtc') {
        from.height = `${this.listDim + this.itemHeight * step}px`;
        from.transform = `translate3d( 0, -${this.itemHeight * step}px, 0 )`;
      } else {
        const distance = this.itemWidth * step - startPosition;
        const prevItemWidth = this.itemWidth * step;

        from.width = `${this.listDim + prevItemWidth}px`;
        from.transform = `translate3d( -${distance}px, 0, 0 )`;
      }

      for (let i = step; i > 0; i--) {
        this.list.insertBefore(this.cloneSlide(this.items[this.listLen - 1]), this.items[0]);
        this.items = this.getListItems();
      }

      this.items = this.getListItems();
      this.setVisibleSlides(0);

      setCss(from, [this.list]);

      this.step = step;

      this.startSlide(to, () => this.list.classList.add('--sliding'));
    }
  }

  /** Stops the automatic rotation (`params.autoplay`): the rotation button then starts it. */
  @Method()
  async stop() {
    this.isPlaying = false;
    clearTimeout(this.timer);
    forceUpdate(this);
  }

  /** Starts the automatic rotation again (`params.autoplay`), unless the pointer is over the slider (it then starts when it leaves). */
  @Method()
  async play() {
    this.isPlaying = true;
    if (!this.isTransitionStarted) {
      this.continue();
    }
    forceUpdate(this);
  }

  transitionCleanUp = () => {
    this.list.classList.remove('--sliding');
    this.isTransitionStarted = false;
    setCss(
      {
        transform: 'translate3d(0,0,0)',
        width: this.options.orientation === 'hrt' ? `${this.listDim}px` : `${this.itemHeight}px`,
        height: this.options.orientation === 'hrt' ? `${this.itemHeight}px` : `${this.listDim}px`,
      },
      [this.list],
    );
  };

  /** Whether the slides rotate now: the automatic rotation is on, and the pointer is not over the slider. */
  get isRotating(): boolean {
    return !!this.options.autoplay && this.isPlaying && !this.isHovered;
  }

  continue = () => {
    clearTimeout(this.timer);
    if (this.isRotating && this.isScrollable) {
      this.timer = setTimeout(() => this[this.options.direction === 1 ? 'next' : 'prev'](), this.currentItem.dTime);
    }
  };

  //#region Handlers

  /** The end of a slide. */
  slideEndHandler() {
    if (this.softCleanup) {
      this.transitionCleanUp();
    } else {
      this[`${this.transitionDirection}TransitionEndHandler`]();
    }
    this.setVisibleSlides(0);
  }

  nextTransitionEndHandler() {
    const { step } = this;
    this.items = this.getListItems();

    for (let i = 0; i < step; i++) {
      while (this.items[0].firstChild) {
        this.items[0].removeChild(this.items[0].firstChild);
      }
      this.items[0].remove();
      this.items = this.getListItems();
    }

    this.items = this.getListItems();

    this.transitionCleanUp();
    const { index: previousIndex } = this.currentItem;

    // Round the slides: from the last one to the first.
    const newIndex = (((previousIndex + step) % this.listLen) + this.listLen) % this.listLen;
    this.currentItem.index = newIndex;

    this.sliderEvent.emit({
      slide: 'stop-slide',
      direction: 1,
      currentIndex: newIndex,
    });

    this.continue();
  }

  prevTransitionEndHandler() {
    const { step } = this;
    this.items = this.getListItems();

    for (let i = 0; i < step; i++) {
      while (this.items[this.listLen].firstChild) {
        this.items[this.listLen].removeChild(this.items[this.listLen].firstChild);
      }
      this.items[this.listLen].remove();
      this.items = this.getListItems();
    }

    this.items = this.getListItems();

    this.transitionCleanUp();
    const { index: previousIndex } = this.currentItem;
    // Round the slides: from the first one to the last.
    const newIndex = (((previousIndex - step) % this.listLen) + this.listLen) % this.listLen;

    this.currentItem.index = newIndex;

    this.sliderEvent.emit({
      slide: 'stop-slide',
      direction: -1,
      currentIndex: this.currentItem.index,
    });

    this.continue();
  }

  async prevButtonClickHandler() {
    await this.prev(this.options.step);
  }

  async nextButtonClickHandler() {
    await this.next(this.options.step);
  }

  async rotationButtonClickHandler() {
    await (this.isPlaying ? this.stop() : this.play());
  }

  //#endregion

  render() {
    const labels = this.getLabels();

    return (
      <div
        class={{
          ...toClassList('ds-slider', this.mods),
          [`--${this.options.orientation}`]: true,
          '--playing': this.isPlaying,
          '--paused': !this.isPlaying,
          '--scrollable': this.isScrollable,
          '--draggable': this.isDraggable,
          '--isReady': this.isReady,
          '--transition': this.isTransitionStarted,
        }}
        role="region"
        aria-roledescription={labels.carousel}
        aria-label={this.label}
      >
        {this.options.autoplay && this.isScrollable && (
          <ds-trigger
            type="button"
            class="ds-slider__rotation-button"
            mods={['slider', this.isPlaying ? 'pause' : 'play']}
            onClick={this.rotationButtonClickHandler}
            label={this.isPlaying ? labels.pause : labels.play}
          />
        )}

        {this.options.controls && this.isScrollable && (this.options.loop || this.currentItem.index > 0) && (
          <ds-trigger type="button" class="ds-slider__prev-button" mods={['slider', 'prev']} onClick={this.prevButtonClickHandler} label={labels.previous} />
        )}

        <div class="ds-slider__container">
          <div class="ds-slider__list" id={this.sliderId} aria-live={this.isRotating ? 'off' : 'polite'}>
            <slot />
          </div>
        </div>

        {this.options.controls && this.isScrollable && (this.options.loop || this.currentItem.index + this.dspItems < this.listLen) && (
          <ds-trigger class="ds-slider__next-button" mods={['slider', 'next']} onClick={this.nextButtonClickHandler} type="button" label={labels.next} />
        )}

        {this.options.menu && <ds-slider-menu dsItemCount={this.listLen} dsCurrentItemIndex={this.currentItem.index} label={labels.menu} itemLabel={labels.menuItem} />}
      </div>
    );
  }
}
