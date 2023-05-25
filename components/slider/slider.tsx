import { Component, Element, Event, EventEmitter, h, Prop, State, Watch, Listen } from '@stencil/core/internal';
import { AnyHTMLElement } from '@stencil/core/internal';
import _ds from '../dot-stash';

export interface DSSliderPrams extends Record<string, unknown> {
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

const DSSliderDefaults: DSSliderPrams = {
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

  @Element() host: HTMLDivElement;

  @Prop({ mutable: true, reflect: true }) sliderId: string;
	@Prop({ mutable: true, reflect: true }) mods: string | string[] = "";
	@Prop({ mutable: true, reflect: true }) dsParams: DSSliderPrams | string = {};
	@Prop({ mutable: true, reflect: true }) type = "sld";

	@State() currentItem: { obj: HTMLElement; index: number; dTime?: number | null; } = {
		obj: null,
		index: 0,
		dTime: null
	};

  sliderContener: HTMLDivElement;
	list: HTMLElement;
	items: HTMLElement[];	
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
  
	isScrollable = false;
	isDraggable = false;
	isTransitionStarted = false;
	isPlaying = true;
	isReady = false;
  CSSClassList: Record<string, boolean>;

  params: DSSliderPrams;

  @Watch('mods')
  modsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-slider", newMods);
  }

  @Event() dsSliderEvent: EventEmitter;

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
    this.handlePrevButtonClickHandler = this.handlePrevButtonClickHandler.bind(this);
    this.handleNextButtonClickHandler = this.handleNextButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.params = {...DSSliderDefaults, ..._ds.props.fromJSON(this.dsParams) };
    this.CSSClassList = _ds.props.toClassList("ds-slider", this.mods);
  }
  
  componentDidLoad() {
    this.sliderContener = this.host.querySelector('.ds-slider');
    this.list = this.getList();
    this.items = Array.from(this.getListItems());
    this.listLen = this.items.length;
    this.dspDim = this.sliderContener[ `offset${this.params.orientation === "vtc" ? "Height" : "Width"}` ];

    this.initialize();
  }

  initialize() {

    if( !this.isReady ) {

			/* if( this.params.index !== 0 ) {

				if( this.params.index === "rand" ) {
          this.params.index = Math.floor( Math.random()*this.listLen );
        }
				
				this.items = this.list.children(":visible");
				const start = this.items.slice(0, this.params.index).clone(true,true);
				const end = this.items.slice( this.params.index ).clone(true,true);
					
				this.list.empty().append(end).append(start);
				this.items = this.list.children(":visible");
				
			}	 */
			
			this.refresh(true); 

			if( this.isScrollable ) {
				if(this.params.autoHeight && this.params.orientation === "hrt" ) {
          _ds.css.set({ height: this.itemHeight }, [this.sliderContener]);
        }
        this.step = this.params.step;
        if( this.params.menu ) {
          this.menu = this.host.querySelector("ds-slider-menu") as AnyHTMLElement;
        }
      }
      this.isReady = true;

    }
      
  }

  getList(): HTMLElement {
    return this.host.querySelector(".ds-slider > .ds-slider__container > .ds-slider__list");
  }

  getListItems(): AnyHTMLElement[] {
    return Array.from(this.host.querySelectorAll<AnyHTMLElement>(".ds-slider > .ds-slider__container > .ds-slider__list > .ds-slider__item"));
  }

  refresh( reset ) {
    
    if( !this.isTransitionStarted ) {

      this.list = this.getList();
      this.items = this.getListItems();
      this.listLen = this.items.length;
      this.itemWidth = 0;
      this.itemHeight = 0;
      
      this.params.xOffset = _ds.css.toNumber( "margin-left", this.list);
      
      _ds.css.set({ width: "", height: "" }, [this.list, ...this.items]);
      
      this.dspDim = this.sliderContener[ `offset${this.params.orientation === "vtc" ? "Height" : "Width"}` ];
      
      if( this.params.autoplay ) {
        clearTimeout( this.timer );
      }

      let listWidth = 0;
      let listHeight = 0;

      this.items.forEach( item => {
        if( !this.params.autoWidth ) {
          listWidth += item.offsetWidth;
          listHeight += item.offsetHeight;
          _ds.css.set({ width: `${item.offsetWidth}px`, maxWidth: `${item.offsetWidth}px`, height: `${item.offsetHeight}px`}, [item]);
        }
        
        if(item.offsetWidth > this.itemWidth) {
          this.itemWidth = item.offsetWidth;
        }

        if(item.offsetHeight > this.itemHeight) {
          this.itemHeight = item.offsetHeight;
        }
      });
      
      if ( this.params.forceItemDspCount ) {
        this[ `item${this.params.orientation == "hrt" ? "Width" : "Height"}` ] = Math.ceil(this.dspDim/this.params.forceItemDspCount);
      }
  
      const itemHeight = this.params.forceHeight
        ? this.params.forceHeight
        : this.params.orientation === "hrt"
          ? this.params.autoHeight
            ? this.itemHeight
            : "auto"
          : this.itemHeight 

      if( this.params.autoWidth ) {
        _ds.css.set({ height: `${itemHeight}px`, width: `${this.itemWidth}px`}, this.items);
        this.listDim = this.listLen*this[ this.params.orientation === "vtc" ? "itemHeight" : "itemWidth" ];
      } else {
        this.listDim = this.params.orientation === "vtc" ? listHeight : listWidth;
      }

      this.dspItems = this.params.forceItemDspCount
        ? this.params.forceItemDspCount
        : Math.ceil(this.dspDim/this[ this.params.orientation === "vtc" ? "itemHeight" : "itemWidth" ]);

      if( this.dspItems < this.params.minItemDspCount ) {
        this.dspItems = this.params.minItemDspCount;
      }

      
      this.isScrollable = this.listDim > this.dspDim || this.params.loop && this.dspItems === this.listLen;

      this.list.classList.add( this.params.orientation );
      
      if( this.params.orientation === "vtc" ) {
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

      if( this.params.step > this.dspItems || this.listLen === 1 ) {
        this.params.step = this.dspItems;
        this.isScrollable = false;
      }

      if( this.isScrollable ) {
        
        if( this.currentItem.obj === null || (reset||false) ) {
          this.currentItem = {
            index: this.params.index,
            obj: this.items[ this.params.index ],
            dTime: this.params.duration
          }
        }
        
        if( this.params.autoplay && this.isPlaying ) {
          this.timer = setTimeout(
            () => this[ ( this.params.direction === 1 ? "next" : "prev" ) ](),
            this.currentItem.dTime
          );
        }
        
      }
      
      _ds.css.set({opacity: 1}, [this.sliderContener]);
    
    }
    
  }

  next( step: number = this.step ) {

		if( this.params.autoplay ) {
			clearTimeout( this.timer );
		}
			
    if( !this.isTransitionStarted ) {

			this.dsSliderEvent.emit({ 'slide': 'start-slide', 'direction': 1 });
      this.isTransitionStarted = true;
			this.items = this.getListItems();

      const from: Record<string, unknown> = { transform: 'translate3d(0,0,0)' };
      const to: Record<string, unknown> = {};
    
      if( this.params.orientation === "vtc" ) {
        from.height = `${this.listDim + this.itemHeight*step}px`;
        to.transform = `translate3d( 0, -${this.itemHeight*step}px, 0 )`;
      } else {

        let distance = this.itemWidth*step;
        let nextItemWidth = this.itemWidth*step;
        if( !this.params.autoWidth ) {
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
        const newElem = document.createElement('div');
        newElem.classList.add(...this.items[i].classList.value.split(' '));
        newElem.style.cssText = this.items[i].style.cssText;
        newElem.innerHTML = this.items[i].innerHTML;
        this.list.appendChild( newElem );
      }
      
      this.getList().classList.add("--sliding");
      this.getList().addEventListener( 'transitionend', this.slideNextTransitionEndHandler );
      setTimeout( () => _ds.css.set( to, [this.list]), 0 );

    }	
  }

  prev( step? ) {

		if( this.params.autoplay ) {
			clearTimeout( this.timer );
		}
		
		if( !this.params.loop && (this.currentItem.index - step < 0) ) {
			step = this.currentItem.index;
    }

    if( !this.isTransitionStarted ) {

      this.dsSliderEvent.emit({ 'slide': 'start-slide', 'direction': -1 });
      this.isTransitionStarted = true;
      this.items = this.getListItems();

      const from: Record<string, unknown> = {};
      const to: Record<string, unknown> = { transform: 'translate3d(0,0,0)' };

      if( this.params.orientation === "vtc" ) {
        from.height = `${this.listDim + this.itemHeight*step}px`;
        from.transform = `translate3d( 0, -${this.itemHeight*step}px, 0 )`;
      } else {
        
        let distance = this.itemWidth*step;
        let prevItemWidth = this.itemWidth*step;
        if( !this.params.autoWidth ) {
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

      for( let i=this.listLen-1; i > this.listLen-1-step; i-- ) {
        const newElem = document.createElement('div');
        newElem.classList.add(...this.items[i].classList.value.split(' '));
        newElem.style.cssText = this.items[i].style.cssText;
        newElem.innerHTML = this.items[i].innerHTML;
        this.list.prepend( newElem );
      }
      
      setTimeout( () => this.getList().classList.add("--sliding"), 0 );
      this.getList().addEventListener( 'transitionend', this.slidePrevTransitionEndHandler )
      setTimeout( () => _ds.css.set( to, [this.list]), 0 );

    }

  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    this.isPlaying = true;
  }

  //#region Handlers

  slideNextTransitionEndHandler() {

    const {step} = this;
    this.list.classList.remove("--sliding");

    this.items = this.getListItems();

    for( let i=0; i < step; i++ ) {
      while(this.items[i+this.listLen].firstChild) {
        this.items[i+this.listLen].removeChild(this.items[i+this.listLen].firstChild)
      }
      this.getList().appendChild(this.items[i]);
      this.items[i+this.listLen].remove();
    }

    this.list = this.getList();
    this.items = this.getListItems();
					
    _ds.css.set( {
      "transform": 'translate3d(0,0,0)',
      "width": `${this.listDim}px`
    }, [this.list] );

    this.isTransitionStarted = false;
    this.currentItem.index += this.currentItem.index + step > this.listLen-1 ? -(this.listLen-1) : step;

    this.dsSliderEvent.emit({ 'slide': 'stop-slide', 'direction': 1, 'currentIndex': this.currentItem.index });
    if( typeof this.params.menu === "boolean" && this.params.menu && this.menu ) {
      this.menu.dsCurrentItemIndex = this.currentItem.index;
    }
    this.list.removeEventListener( 'transitionend', this.slideNextTransitionEndHandler );
    
    if(this.params.autoplay) {
      this.timer = setTimeout(
        () => {
          if( this.isPlaying ) {
            this.next();
          }
        },
        this.params.duration
        );
    }
  }
    
  slidePrevTransitionEndHandler() {
    
    const { step } = this;
    this.list.classList.remove("--sliding");
    this.items = this.getListItems();
    
    for( let i=0; i < step; i++ ) {
      while(this.items[i].firstChild) {
        this.items[i].removeChild(this.items[i].firstChild)
      }
      this.getList().prepend(this.items[this.items.length-1]);
      this.items[i].remove();
      this.items = this.getListItems();
    }
    
    this.isTransitionStarted = false;
    this.currentItem.index -= this.currentItem.index-step < 0 ? this.listLen - 1 : step;
    this.dsSliderEvent.emit({ 'slide': 'stop-slide', 'direction': -1, 'currentIndex': this.currentItem.index });
    if( typeof this.params.menu === "boolean" && this.params.menu && this.menu ) {
      this.menu.dsCurrentItemIndex = this.currentItem.index;
    }
    this.list.removeEventListener( 'transitionend', this.slidePrevTransitionEndHandler );

    if(this.params.autoplay) {
      this.timer = setTimeout(
        () => {
          if( this.isPlaying ) {
            this.prev();
          }
        },
        this.params.duration
      );
    }
  }

  handlePrevButtonClickHandler() {
    this.prev( this.step );
  }

  handleNextButtonClickHandler() {
    this.next( this.step );
  }

  //#endregion
  
  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          "--playing": this.isPlaying,
          "--paused": !this.isPlaying,
          "--scrollable": this.isScrollable,
          "--draggable": this.isDraggable,
          "--isReady": this.isReady,
          "--transition": this.isTransitionStarted,
        }}
      >

        {(this.params.loop || this.currentItem.index > 0) && (
          <ds-button
            class="ds-slider__prev-button"
            mods={['slider', 'prev']}
            onDsButtonClick={this.handlePrevButtonClickHandler}
          />
        )}

        <div class="ds-slider__container">
          <div class="ds-slider__list">
            <slot/>
            <slot name="content" />
          </div>
        </div>
        
        {(this.params.loop || this.currentItem.index + this.dspItems < this.listLen) && ( 
          <ds-button
            class="ds-slider__next-button"
            mods={['slider', 'next']}
            onDsButtonClick={this.handleNextButtonClickHandler}
          />
        )}

        {this.params.menu && (
          <ds-slider-menu
            dsItemCount={this.listLen}
            dsCurrentItemIndex={this.currentItem.index}
          />
        )}

      </div>
    );
  }
}
