import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch, Listen, Method } from '@stencil/core/internal';
/* import { AnyHTMLElement } from '@stencil/core/internal'; */
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

export interface DSSliderParams extends Record<string, unknown> {
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
}


@Component({
  tag: 'ds-slider',
  styleUrl: 'slider.scss'
})
export class DSSlider {

  @Element() host: HTMLDsSliderElement;

	@Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
	@Prop({ mutable: true, reflect: true }) params: DSSliderParams | string = {};
	@Prop({ mutable: true, reflect: true }) type = "sld";

  @State() isTransitionStarted = false;
	@State() currentItem: { obj: HTMLDsSliderItemElement; index: number; dTime?: number | null; } = {
		obj: null,
		index: 0,
		dTime: null
	};

  sliderContener: HTMLDivElement;
	list: HTMLDivElement;
	items: HTMLDsSliderItemElement[];	
  listLen = 0;
  dspDim = 0;
  itemWidth = 0;
  itemHeight = 0;
  displayedItems = 0;
  listDim = 0;
  step = 1;
  timer: NodeJS.Timeout = null;
  duration = 4000;
  
	isScrollable = false;
	isDraggable = false;
	isPlaying = true;
	isReady = false;
  CSSClassList: CssClassList;

  options: DSSliderParams;

  @Watch('mods')
  modsChangeHandler( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-slider", newMods);
  }

  @Event() sliderEvent: EventEmitter<{slide: string; direction: number; currentIndex?: number;}>;

  @Listen("request_displaySliderItem_event")
  request_displaySliderItem_eventHandler({ detail: { index }}) {
    const step = index - this.currentItem.index;
    if( step !== 0 && !this.isTransitionStarted ) {
      this[ step < 0 ? "prev" : "next" ](Math.abs(step));
    }
  }

  constructor() {
    this.slidePrevTransitionEndHandler = this.slidePrevTransitionEndHandler.bind(this);
    this.slideNextTransitionEndHandler = this.slideNextTransitionEndHandler.bind(this);
    this.prevButtonClickHandler = this.prevButtonClickHandler.bind(this);
    this.nextButtonClickHandler = this.nextButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.options = {...DSSliderDefaults, ..._ds.props.fromJSON(this.params) };
    this.CSSClassList = _ds.props.toClassList("ds-slider", this.mods);
  }
  
  componentDidLoad() {
    this.sliderContener = this.host.querySelector('.ds-slider__container');
    this.list = this.getList();
    this.items = this.getListItems();
    this.listLen = this.items.length;
    this.dspDim = this.sliderContener[ `offset${this.options.orientation === "vtc" ? "Height" : "Width"}` ];

    this.initialize();
  }

  initialize() {

    if( !this.isReady ) {

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

			if( this.isScrollable ) {
				if(this.options.autoHeight && this.options.orientation === "hrt" ) {
          _ds.css.set({height: `${this.itemHeight}px` }, [this.sliderContener]);
        }
        this.step = this.options.step;
      }
      this.isReady = true;

    }
      
  }

  getList = (): HTMLDivElement => this.host.querySelector(".ds-slider__list:not(ds-slider-item .ds-slider__list)")

  getListItems = (): HTMLDsSliderItemElement[] => Array.from(this.host.querySelectorAll<HTMLDsSliderItemElement>("ds-slider-item:not(ds-slider-item ds-slider-item)"))

  @Method()
  async refresh( reset: boolean ) {
    
    if( !this.isTransitionStarted ) {

      this.list = this.getList();
      this.items = this.getListItems();
      this.listLen = this.items.length;
      this.itemWidth = 0;
      this.itemHeight = 0;
      
      this.options.xOffset = _ds.css.toNumber( "marginLeft", this.list);
      
      _ds.css.set({ width: "", height: "" }, [this.list, ...this.items]);
      
      this.dspDim = this.sliderContener[ `offset${this.options.orientation === "vtc" ? "Height" : "Width"}` ];
      
      if( this.options.autoplay ) {
        clearTimeout( this.timer );
      }

      let listWidth = 0;
      let listHeight = 0;

      this.items.forEach( item => {
        const { offsetWidth: itemWidth, offsetHeight: itemHeight } = item;

        if( !this.options.autoWidth ) {
          listWidth += itemWidth;
          listHeight += itemHeight;
          _ds.css.set({ 
            width: `${itemWidth}px`, 
            maxWidth: `${itemWidth}px`, 
            height: `${itemHeight}px`
          }, [
            item
          ]);
        }
        
        if(itemWidth > this.itemWidth) {
          this.itemWidth = itemWidth;
        }

        if(itemHeight > this.itemHeight) {
          this.itemHeight = itemHeight;
        }
      });
      
      if ( this.options.forceItemDspCount ) {
        this[ `item${this.options.orientation == "hrt" ? "Width" : "Height"}` ] = Math.ceil(this.dspDim/this.options.forceItemDspCount);
      }
  
      const itemHeight = this.options.forceHeight
        ? this.options.forceHeight
        : this.options.orientation === "hrt"
          ? this.options.autoHeight
            ? this.itemHeight
            : "auto"
          : this.itemHeight 

      if( this.options.autoWidth ) {
        _ds.css.set({ 
            height: `${itemHeight}px`, 
            width: `${this.itemWidth}px`
          },
          this.items
        );
        this.listDim = this.listLen*this[ this.options.orientation === "vtc" ? "itemHeight" : "itemWidth" ];
      } else {
        this.listDim = this.options.orientation === "vtc" ? listHeight : listWidth;
      }

      this.displayedItems = this.options.forceItemDspCount
        ? this.options.forceItemDspCount
        : Math.ceil(this.dspDim/this[ this.options.orientation === "vtc" ? "itemHeight" : "itemWidth" ]);

      if( this.displayedItems < this.options.minItemDspCount ) {
        this.displayedItems = this.options.minItemDspCount;
      }
      
      this.isScrollable = this.listDim > this.dspDim || this.options.loop && this.displayedItems === this.listLen;

      if( this.options.orientation === "vtc" ) {
        _ds.css.set({
          height: `${this.listDim}px`
        }, [this.list]);
      } else {
        _ds.css.set({
          width: `${this.listDim}px`,
          height: `${this.itemHeight}px`
        }, [this.list]);
        _ds.css.set({
          height: `${this.itemHeight}px`
        }, [this.sliderContener]);
      }

      if( this.options.step > this.displayedItems || this.listLen === 1 ) {
        this.options.step = this.displayedItems;
        this.isScrollable = false;
      }

      if( this.isScrollable ) {
        
        if( this.currentItem.obj === null || (reset||false) ) {
          this.currentItem = {
            index: this.options.index,
            obj: this.items[ this.options.index ],
            dTime: this.options.duration
          }
        }
        
        if( this.options.autoplay && this.isPlaying ) {
          this.timer = setTimeout(
            () => this[ ( this.options.direction === 1 ? "next" : "prev" ) ](),
            this.currentItem.dTime
          );
        }
        
      }
      
      _ds.css.set({opacity: "1"} as Partial<CSSStyleDeclaration>, [this.sliderContener]);
    
    }
    
  }

  @Method()
  async next( step: number = this.step ) {
		if( this.options.autoplay ) {
			clearTimeout( this.timer );
		}
			
    if( !this.isTransitionStarted ) {

			this.sliderEvent.emit({ 'slide': 'start-slide', 'direction': 1 });
			this.items = this.getListItems();

      const from: Partial<CSSStyleDeclaration> = { transform: 'translate3d(0,0,0)' };
      const to: Partial<CSSStyleDeclaration> = {};
    
      if( this.options.orientation === "vtc" ) {
        from.height = `${this.listDim + this.itemHeight*step}px`;
        to.transform = `translate3d( 0, -${this.itemHeight*step}px, 0 )`;
      } else {

        let distance = this.itemWidth*step;
        let nextItemWidth = this.itemWidth*step;
        if( !this.options.autoWidth ) {
          distance = 0;
          for( let i=0; i<step; i++ ) {
            distance += this.items[i].offsetWidth;
          }
          nextItemWidth = distance; //this.items[ step-1 ].offsetWidth;
        }

        from.width = `${this.listDim + nextItemWidth}px`;
        to.transform = `translate3d( -${distance}px, 0, 0 )`;
      }

      _ds.css.set( from, [this.list] );

      for( let i=0; i < step; i++ ) {
        this.getList().appendChild( this.items[i].cloneNode(true) );
      }
      
      this.isTransitionStarted = true;
      this.getList().addEventListener( 'transitionend', this.slideNextTransitionEndHandler );
      setTimeout( () => _ds.css.set( to, [this.list]), 0 );

    }	
  }

  @Method()
  async prev( step: number = this.step ) {
		if( this.options.autoplay ) {
			clearTimeout( this.timer );
		}
		
		if( !this.options.loop && (this.currentItem.index - step < 0) ) {
			step = this.currentItem.index;
    }

    if( !this.isTransitionStarted ) {

      this.sliderEvent.emit({ 'slide': 'start-slide', 'direction': -1 });
      this.items = this.getListItems();

      const from: Partial<CSSStyleDeclaration> = {};
      const to: Partial<CSSStyleDeclaration> = { transform: 'translate3d(0,0,0)' };

      if( this.options.orientation === "vtc" ) {
        from.height = `${this.listDim + this.itemHeight*step}px`;
        from.transform = `translate3d( 0, -${this.itemHeight*step}px, 0 )`;
      } else {
        
        let distance = this.itemWidth*step;
        let prevItemWidth = this.itemWidth*step;
        if( !this.options.autoWidth ) {
          distance = 0;
          for( let i=1; i<=step; i++ ) {
            distance += this.items[this.listLen-i].offsetWidth;
          }
          prevItemWidth = distance;
        }

        
        from.transform = `translate3d( -${distance}px, 0, 0 )`;
        from.width = `${this.listDim + prevItemWidth}px`;
        
      }

      _ds.css.set( from, [this.list] );

      const newItems: Node[] = [];
      for( let i=this.listLen-1; i > this.listLen-1-step; i-- ) {
        newItems.push(this.items[i].cloneNode(true));
      }
      newItems.forEach( item => this.getList().prepend( item ) );
      
      this.isTransitionStarted = true;
      this.getList().addEventListener( 'transitionend', this.slidePrevTransitionEndHandler );
      setTimeout( () => _ds.css.set( to, [this.list]), 0 );
      
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
    this.list.classList.remove("--sliding");
    this.isTransitionStarted = false;
    this.list.removeEventListener( 'transitionend', this.slideNextTransitionEndHandler );
    this.list.removeEventListener( 'transitionend', this.slidePrevTransitionEndHandler );
    _ds.css.set( {
      "transform": 'translate3d(0,0,0)',
      "width": `${this.listDim}px`
    }, [this.list] );
  }

  continue = (nextAction: "prev" | "next") => {
    if(this.options.autoplay) {
      this.timer = setTimeout(
        () => {
          if( this.isPlaying ) {
            this[nextAction]();
          }
        },
        this.options.duration
      );
    }
  }

  //#region Handlers

  slideNextTransitionEndHandler() {
    const {step} = this;
    this.items = this.getListItems();

    for( let i=0; i < step; i++ ) {
      while(this.items[i+this.listLen].firstChild) {
        this.items[i+this.listLen].removeChild(this.items[i+this.listLen].firstChild)
      }
      this.getList().appendChild(this.items[i]);
      this.items[i+this.listLen].remove();
    }

    this.items = this.getListItems();

    this.transitionCleanUp();
    this.currentItem.index += this.currentItem.index + step > this.listLen-1 ? -(this.listLen-1) : step;
    this.sliderEvent.emit({ 'slide': 'stop-slide', 'direction': 1, 'currentIndex': this.currentItem.index });
    
    this.continue("next");
  }
    
  slidePrevTransitionEndHandler() {
    const { step } = this;
    this.items = this.getListItems();
    
    for( let i=0; i < step; i++ ) {
      while(this.items[i].firstChild) {
        this.items[i].removeChild(this.items[i].firstChild)
      }
      this.items[i].remove();
      this.getList().prepend(this.items[this.items.length-1]);
      this.items = this.getListItems();
    }
    
    this.transitionCleanUp();
    this.currentItem.index -= this.currentItem.index-step < 0 ? this.listLen - 1 : step;
    this.sliderEvent.emit({ 'slide': 'stop-slide', 'direction': -1, 'currentIndex': this.currentItem.index });

    this.continue("prev");
  }

  prevButtonClickHandler() {
    this.prev();
  }

  nextButtonClickHandler() {
    this.next();
  }

  //#endregion
  
  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
          "--playing": this.isPlaying,
          "--paused": !this.isPlaying,
          "--scrollable": this.isScrollable,
          "--draggable": this.isDraggable,
          "--ready": this.isReady,
          "--sliding": this.isTransitionStarted,
          [`--${this.options.orientation}`]: true
        }}
      >
        <div class="ds-slider__container">
          <div class="ds-slider__list">
            <slot/>
          </div>
        </div>
      </Host>
    );
  }
}
