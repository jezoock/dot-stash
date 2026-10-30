import { Component, Element, Event, EventEmitter, h, Prop, Watch, Listen, Method, State } from '@stencil/core/internal';
import { AnyHTMLElement } from '@stencil/core/internal';
import CssClassList from '../../types/css-class-list.interface';
import _ds from '../../utils/dot-stash';

let sliderId = 0;

export interface DSSliderSelectors {
  sliderContainer: string;
  menu: string;
  list: string;
  items: string;
}

const defaultSliderSelectors = {
  sliderContainer: '.ds-slider',
  menu: 'ds-slider-menu',
  list: '.ds-slider__list:not(ds-slider-item .ds-slider__list)',
  items: 'ds-slider-item:not(ds-slider-item ds-slider-item)',
};

export interface DSSliderParams {
  orientation?: 'hrt' | 'vtc';
  direction?: number;
  index?: number;
  loop?: boolean;
  autoplay?: boolean;
  autoHeight?: boolean;
  step?: number;
  duration?: number;
  forceItemDspCount?: number;
  minItemDspCount?: number;
  menu?: AnyHTMLElement;
  xOffset?: number;
  yOffset?: number;
  forceHeight?: boolean;
  autoWidth?: boolean;
  selectors?: DSSliderSelectors;
  isActive?: boolean;
  controls?: boolean;
  draggable?: boolean;
}

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

@Component({
  tag: 'ds-slider',
  styleUrl: 'slider.scss',
})
export class DSSlider {
  @Element() host: HTMLDivElement;

  @Prop({ mutable: true, reflect: true }) sliderId: string = `slide-${sliderId++}`;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) params: DSSliderParams | string = {};
  @Prop({ mutable: true, reflect: true }) type = 'sld';

  @State() isTransitionStarted = false;

  @State() isReady = false;
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
  timer: NodeJS.Timeout = null;
  duration = 4000;
  menu: AnyHTMLElement;
  transitionDirection: string;

  isScrollable = false;
  isDraggable = false;
  /* isTransitionStarted = false; */
  isPlaying = true;
  /* isReady = false; */
  CSSClassList: CssClassList;

  isDragging = false;
  xStart = 0;
  yStart = 0;
  startDrag = 0;
  swipeDelay = 200;

  options: DSSliderParams;

  @Watch('params')
  paramsChangeHandler(newParams: DSSliderParams) {
    if (newParams) {
      const { isActive: previousIsActive } = this.options;
      const { isActive } = newParams;
      this.options = { ...this.options, ..._ds.props.fromJSON(newParams) };

      if (typeof isActive !== 'undefined' && previousIsActive !== isActive) {
        if (isActive) {
          this.initialize();
        } else {
          this.reset();
        }
      }
    }
  }

  @Watch('mods')
  modsChangeHandler(newMods: string | string[]) {
    this.CSSClassList = _ds.props.toClassList('ds-slider', newMods);
  }

  @Event() sliderEvent: EventEmitter<{ slide: string; direction: number; currentIndex?: number }>;

  @Listen('request_displaySliderItem_event')
  async request_displaySliderItem_eventHandler({ detail: { index } }) {
    const step = index - this.currentItem.index;
    if (step !== 0 && !this.isTransitionStarted) {
      await this[step < 0 ? 'prev' : 'next'](Math.abs(step));
    }
  }

  constructor() {
    this.slideTransitionEndHandler = this.slideTransitionEndHandler.bind(this);
    this.prevButtonClickHandler = this.prevButtonClickHandler.bind(this);
    this.nextButtonClickHandler = this.nextButtonClickHandler.bind(this);
    this.pointerDownHandler = this.pointerDownHandler.bind(this);
    this.pointerUpHandler = this.pointerUpHandler.bind(this);
    this.pointerMoveHandler = this.pointerMoveHandler.bind(this);
  }

  disconnectedCallback() {
    this.list.removeEventListener('touchstart', this.pointerDownHandler, false);
    this.list.removeEventListener('touchend', this.pointerUpHandler, false);
    this.list.removeEventListener('touchmove', this.pointerMoveHandler, false);
  }

  componentWillLoad() {
    const optionsFromProps = _ds.props.fromJSON(this.params);
    this.options = { ...DSSliderDefaults, ...optionsFromProps, selectors: { ...DSSliderDefaults.selectors, ...optionsFromProps.selectors } };
    this.CSSClassList = _ds.props.toClassList('ds-slider', this.mods);
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

  @Method()
  async reset() {
    console.log('reset');
  }

  @Method()
  async initialize() {
    if (!this.isReady) {
      /* if( this.options.index !== 0 ) {

				if( this.options.index === "rand" ) {
          this.options.index = Math.floor( Math.random()*this.listLen );
        }
				
				this.items = this.list.children(":visible");
				const start = this.items.slice(0, this.options.index).clone(true,true);
				const end = this.items.slice( this.options.index ).clone(true,true);
					
				this.list.empty().append(end).append(start);
				this.items = this.list.children(":visible");
				
			}	 */

      this.refresh(true);

      if (this.isScrollable) {
        if (this.options.autoHeight && this.options.orientation === 'hrt') {
          _ds.css.set({ height: `${this.itemHeight}px` } as Partial<CSSStyleDeclaration>, [this.sliderContener]);
        }
        this.step = this.options.step;
        if (this.options.menu) {
          this.menu = this.host.querySelector(this.options.selectors.menu) as AnyHTMLElement;
        }
      }

      this.isReady = true;
    }
  }

  getList(): HTMLElement {
    return this.host.querySelector(this.options.selectors.list);
  }

  getListItems(): HTMLDsSliderItemElement[] {
    return Array.from(this.host.querySelectorAll<HTMLDsSliderItemElement>(this.options.selectors.items));
  }

  @Method()
  async refresh(reset: boolean = false) {
    if (!this.isTransitionStarted) {
      this.list = this.getList();
      this.items = this.getListItems();
      this.listLen = this.items.length;
      this.itemWidth = 0;
      this.itemHeight = 0;

      this.options.xOffset = _ds.css.toNumber('marginLeft', this.list);
      this.dspDim = this.sliderContener[`offset${this.options.orientation === 'vtc' ? 'Height' : 'Width'}`];

      /* console.log("available space", this.dspDim, this.items, ); */

      /* Array.from(this.list.querySelectorAll("img")).map(img => console.log(img.offsetHeight)) */

      this.list.removeAttribute('style');

      /* console.log(this.options.autoplay); */

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

          _ds.css.set(
            {
              /* width: `${offsetWidth}px`, */
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
        _ds.css.set({ height: `${itemHeight}px`, width: `${this.itemWidth}px` }, this.items);
        this.listDim = this.listLen * this[this.options.orientation === 'vtc' ? 'itemHeight' : 'itemWidth'];
      } else {
        this.listDim = this.options.orientation === 'vtc' ? listHeight : listWidth;
      }

      /* console.log("list dim", this.listDim) */

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
        _ds.css.set(
          {
            width: `${this.itemWidth}px`,
            height: `${this.listDim}px`,
          },
          [this.list],
        );

        _ds.css.set(
          {
            width: `${this.itemWidth}px`,
          },
          [this.sliderContener],
        );
      } else {
        _ds.css.set(
          {
            width: `${this.listDim < this.dspDim ? this.dspDim : this.listDim}px`,
            height: `${this.itemHeight}px`,
          },
          [this.list],
        );

        _ds.css.set(
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

      _ds.css.set({ opacity: '1' } as Partial<CSSStyleDeclaration>, [this.sliderContener]);

      this.list.addEventListener('transitionend', this.slideTransitionEndHandler, { passive: true });
      if (this.options.draggable) {
        this.list.addEventListener('touchstart', this.pointerDownHandler, { passive: true });
        this.list.addEventListener('touchend', this.pointerUpHandler, { passive: true });
        this.list.addEventListener('touchmove', this.pointerMoveHandler, { passive: true });
      }
    }
  }

  @Method()
  async pointerDownHandler(event: PointerEvent): Promise<void> {
    const {
      touches: [{ clientX: xStart }],
    } = event as any;
    this.isDragging = true;
    this.xStart = xStart;
    /* this.yStart = yStart; */
    this.startDrag = +new Date();
  }

  @Method()
  async pointerMoveHandler(/* event: PointerEvent */): Promise<void> {
    /* if (this.isDragging) {
      const dragTime = (+new Date()) - this.startDrag;
      const { touches: [{clientX: currentX}] } = event as any;
      if (dragTime > this.swipeDelay) {
        const distance = currentX - this.xStart;
        const transformation = `translate3d( ${distance}px, 0, 0 )`;
        _ds.css.set({ "transform": transformation}, [this.list]);
      }
    } */
  }

  @Method()
  async pointerUpHandler(event: PointerEvent): Promise<void> {
    const dragTime = +new Date() - this.startDrag;

    const {
      changedTouches: [{ clientX: xEnd }],
    } = event as any;
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
      } /*  else {
        const transform = `translate3d(0, 0, 0)`;
        setTimeout( () => {
          this.softCleanup = true;
          this.list.classList.add("--sliding");
          _ds.css.set( { transform }, [this.list])
        }, 50);
      } */
    }
  }

  @Method()
  async goTo(itemIndex: number) {
    const {
      currentItem: { index },
    } = this;
    let step = index - itemIndex;
    let move = Math.abs(step);
    /*     const step2 = (index + step) % this.listLen
    console.log({"curent": index, "req": itemIndex, "step": step}); */
    if (step !== 0) {
      if (step >= this.listLen) {
        move = step - this.listLen;
      }

      if (step < -this.listLen) {
        move = step + this.listLen;
      }

      /* console.log(step, move); */

      this[step < 0 ? 'next' : 'prev'](move);
    }
  }

  @Method()
  async next(step: number = this.options.step, startPosition: number = 0) {
    if (this.options.autoplay) {
      clearTimeout(this.timer);
    }

    /* console.log("next", {step, startPosition}); */

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
        let distance = this.itemWidth * step;
        let nextItemWidth = this.itemWidth * step;
        /* if( !this.options.autoWidth ) {
          distance = 0;
          for( let i=0; i<step; i++ ) {
            distance += this.items[i].offsetWidth;
          }
          nextItemWidth = distance;
        } */
        from.transform = `translate3d(-${startPosition}px, 0, 0)`;
        from.width = `${this.listDim + nextItemWidth}px`;
        to.transform = `translate3d( -${distance}px, 0, 0 )`;
      }

      for (let i = 0; i < step; i++) {
        const newElem = this.items[i].cloneNode(true);
        this.list.appendChild(newElem);
      }

      _ds.css.set(from, [this.list]);

      this.step = step;
      this.getList().classList.add('--sliding');
      setTimeout(() => _ds.css.set(to, [this.list]), 50);
    }
  }

  @Method()
  async prev(step: number = this.options.step, startPosition: number = 0) {
    if (this.options.autoplay) {
      clearTimeout(this.timer);
    }

    /* if( !this.options.loop && (this.currentItem.index - step < 0) ) {
			step = this.currentItem.index;
    } */

    /* console.log("prev", {step, startPosition}); */

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
        //from.marginTop = `${this.itemHeight*step}px`;
      } else {
        let distance = this.itemWidth * step - startPosition;
        let prevItemWidth = this.itemWidth * step;
        /* if( !this.options.autoWidth ) {
          distance = 0;
          for( let i=1; i<=step; i++ ) {
            distance += this.items[this.listLen-i].offsetWidth;
          }
          prevItemWidth = distance;
        } */

        from.width = `${this.listDim + prevItemWidth}px`;
        from.transform = `translate3d( -${distance}px, 0, 0 )`;
      }

      /* for( let i=this.listLen-1; i > this.listLen-1-step; i-- ) { */
      for (let i = step; i > 0; i--) {
        this.list.insertBefore(this.items[this.listLen - 1].cloneNode(true), this.items[0]);
        this.items = this.getListItems();
      }

      this.items = this.getListItems();

      _ds.css.set(from, [this.list]);

      this.step = step;

      setTimeout(() => {
        this.list.classList.add('--sliding');
        _ds.css.set(to, [this.list]);
      }, 50);
    }
  }

  @Method()
  async stop() {
    this.isPlaying = false;
  }

  @Method()
  async play() {
    this.isPlaying = true;
  }

  transitionCleanUp = () => {
    this.list.classList.remove('--sliding');
    this.isTransitionStarted = false;
    //this.list.removeEventListener( 'transitionend', this.slideTransitionEndHandler );
    _ds.css.set(
      {
        transform: 'translate3d(0,0,0)',
        width: this.options.orientation === 'hrt' ? `${this.listDim}px` : `${this.itemHeight}px`,
        height: this.options.orientation === 'hrt' ? `${this.itemHeight}px` : `${this.listDim}px`,
      },
      [this.list],
    );
  };

  continue = () => {
    if (this.options.autoplay && this.isPlaying) {
      this.timer = setTimeout(() => this[this.options.direction === 1 ? 'next' : 'prev'](), this.currentItem.dTime);
    }
  };

  //#region Handlers

  slideTransitionEndHandler(event: Event) {
    const eventTarget = event.target as HTMLDivElement;
    if (eventTarget.getAttribute('id') === this.sliderId) {
      if (this.softCleanup) {
        this.transitionCleanUp();
      } else {
        this[`${this.transitionDirection}TransitionEndHandler`]();
      }
    }
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

    /* for( let i=0; i < step; i++ ) {
      while(this.items[this.listLen].firstChild) {
        this.items[this.listLen].removeChild(this.items[this.listLen].firstChild)
      }
      this.items[this.listLen].remove();
      this.items = this.getListItems();
    } */

    this.items = this.getListItems();

    /* for( let i=0; i < step; i++ ) {
      this.getList().appendChild(this.items[0]);
      this.items = this.getListItems();
    } */

    this.transitionCleanUp();
    const { index: previousIndex } = this.currentItem;

    /* console.log("nextHandler", {step, previousIndex, newIndex: (previousIndex + step) % this.listLen}); */

    const newIndex = previousIndex + (previousIndex + step > this.listLen - 1 ? -(this.listLen - 1) : step);
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

    /* for( let i=0; i < step; i++ ) {
      while(this.items[0].firstChild) {
        this.items[0].removeChild(this.items[0].firstChild)
      }
      this.items[0].remove();
      this.items = this.getListItems();
    } */

    this.items = this.getListItems();

    /* for( let i=0; i < step; i++ ) {
      this.getList().prepend(this.items[this.items.length-1]);
      this.items = this.getListItems();
    } */

    this.transitionCleanUp();
    const { index: previousIndex } = this.currentItem;
    const newIndex = previousIndex - (previousIndex < 0 ? this.listLen - 1 : step);

    /* console.log("prevHandler", {step, previousIndex, newIndex}); */

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

  //#endregion

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          [`--${this.options.orientation}`]: true,
          '--playing': this.isPlaying,
          '--paused': !this.isPlaying,
          '--scrollable': this.isScrollable,
          '--draggable': this.isDraggable,
          '--isReady': this.isReady,
          '--transition': this.isTransitionStarted,
        }}
      >
        {this.options.controls && this.isScrollable && (this.options.loop || this.currentItem.index > 0) && (
          <ds-trigger type="button" class="ds-slider__prev-button" mods={['slider', 'prev']} onClick={this.prevButtonClickHandler} aria-label="Previous image" />
        )}

        <div class="ds-slider__container">
          <div class="ds-slider__list" id={this.sliderId}>
            <slot />
          </div>
        </div>

        {this.options.controls && this.isScrollable && (this.options.loop || this.currentItem.index + this.dspItems < this.listLen) && (
          <ds-trigger class="ds-slider__next-button" mods={['slider', 'next']} onClick={this.nextButtonClickHandler} type="button" aria-label="Next image" />
        )}

        {this.options.menu && <ds-slider-menu dsItemCount={this.listLen} dsCurrentItemIndex={this.currentItem.index} />}
      </div>
    );
  }
}
