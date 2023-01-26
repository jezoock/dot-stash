import { Component, Element, Event, EventEmitter, h, Prop, State, Watch, Listen } from '@stencil/core';
import { AnyHTMLElement } from '@stencil/core/internal';
import _ds from '../../../dot-stash';

const DSSliderDefaults = {
  orientation: 'hrt',
  direction: 1, 
  index: 0,
  loop: true,
  autoplay: false,
  autoHeight: true,
  step: 1,
  duration: 4000,
  forceItemDspCount: false,
  minItemDspCount: 0,
}   

@Component({
  tag: 'ds-slider',
  styleUrls: ['slider.scss', './scss/button.scss']
})
export class DSSlider {

  @Element() host: HTMLDivElement;

  @Prop({ mutable: true, reflect: true }) sliderId: string;
	@Prop({ mutable: true, reflect: true }) dsMods: string | string[] = "";
	@Prop({ mutable: true, reflect: true }) dsParams: any | string = {};
	@Prop({ mutable: true, reflect: true }) type: string = "sld";

	@State() currentItem: any = {
		obj: null,
		index: 0,
		dTime: null
	};

  sliderContener: HTMLDivElement;
	list: any;
	items: any;	
  listLen: number = 0;
  dspDim: number = 0;
  itemWidth: number = 0;
  itemHeight: number = 0;
  dspItems: number = 0;
  listDim: number = 0;
  step: number = 1;
  timer: NodeJS.Timeout = null;
  duration: number = 4000;
  menu: AnyHTMLElement;
  
	isScrollable: boolean = false;
	isDraggable: boolean = false;
	isTransitionStarted: boolean = false;
	isPlaying: boolean = true;
	isReady: boolean = false;
  CSSClassList: any;

  @Watch('dsMods')
  dsModsWatcher( newMods ) {
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
    this.dsParams = {...DSSliderDefaults, ..._ds.props.fromJSON(this.dsParams) };
    this.CSSClassList = _ds.props.toClassList("ds-slider", this.dsMods);
  }
  
  componentDidLoad() {
    this.sliderContener = this.host.querySelector('.ds-slider');
    this.list = this.getList();
    this.items = this.getListItems();
    this.listLen = this.items.length;
    this.dspDim = this.sliderContener[ `offset${this.dsParams.orientation === "vtc" ? "Height" : "Width"}` ];

    this.initialize();
  }

  initialize() {

    if( !this.isReady ) {

			/* if( this.dsParams.index !== 0 ) {

				if( this.dsParams.index === "rand" ) {
          this.dsParams.index = Math.floor( Math.random()*this.listLen );
        }
				
				this.items = this.list.children(":visible");
				const start = this.items.slice(0, this.dsParams.index).clone(true,true);
				const end = this.items.slice( this.dsParams.index ).clone(true,true);
					
				this.list.empty().append(end).append(start);
				this.items = this.list.children(":visible");
				
			}	 */
			
			this.refresh(true); 

			if( this.isScrollable ) {
				if(this.dsParams.autoHeight && this.dsParams.orientation === "hrt" ) {
          _ds.css.set({ height: this.itemHeight }, [this.sliderContener]);
        }
        this.step = parseInt(this.dsParams.step, 10);
        if( this.dsParams.menu ) {
          this.menu = this.host.querySelector("ds-slider-menu") as AnyHTMLElement;
        }
      }
      this.isReady = true;

    }
      
  }

  getList(): HTMLElement {
    return this.host.querySelector(".ds-slider > .ds-slider__container > .ds-slider__list");
  }

  getListItems(): NodeList {
    return this.host.querySelectorAll(".ds-slider > .ds-slider__container > .ds-slider__list > .ds-slider__item");
  }

  refresh( reset ) {
    
    if( !this.isTransitionStarted ) {

      this.list = this.getList();
      this.items = this.getListItems();
      this.listLen = this.items.length;
      this.itemWidth = 0;
      this.itemHeight = 0;
      
      this.dsParams.xOffset = _ds.css.toNumber( "margin-left", this.list);
      
      _ds.css.set({ width: "", height: "" }, [this.list, ...this.items]);
      
      this.dspDim = this.sliderContener[ `offset${this.dsParams.orientation === "vtc" ? "Height" : "Width"}` ];
      
      if( this.dsParams.autoplay ) {
        clearTimeout( this.timer );
      }

      let listWidth = 0;
      let listHeight = 0;

      this.items.forEach( item => {
        if( !this.dsParams.autoWidth ) {
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
      
      if( this.dsParams.forceItemDspCount ) {
        this[ `item${this.dsParams.orientation == "hrt" ? "Width" : "Height"}` ] = Math.ceil(this.dspDim/this.dsParams.forceItemDspCount);
      }
  
      const itemHeight = this.dsParams.forceHeight
        ? this.dsParams.forceHeight
        : this.dsParams.orientation === "hrt"
          ? this.dsParams.autoHeight
            ? this.itemHeight
            : "auto"
          : this.itemHeight 

      if( this.dsParams.autoWidth ) {
        _ds.css.set({ height: `${itemHeight}px`, width: `${this.itemWidth}px`}, this.items);
        this.listDim = this.listLen*this[ this.dsParams.orientation === "vtc" ? "itemHeight" : "itemWidth" ];
      } else {
        this.listDim = this.dsParams.orientation === "vtc" ? listHeight : listWidth;
      }

      this.dspItems = this.dsParams.forceItemDspCount
        ? this.dsParams.forceItemDspCount
        : Math.ceil(this.dspDim/this[ this.dsParams.orientation === "vtc" ? "itemHeight" : "itemWidth" ]);

      if( this.dspItems < this.dsParams.minItemDspCount ) {
        this.dspItems = this.dsParams.minItemDspCount;
      }

      
      this.isScrollable = this.listDim > this.dspDim || this.dsParams.loop && this.dspItems === this.listLen;

      this.list.classList.add( this.dsParams.orientation );
      
      if( this.dsParams.orientation === "vtc" ) {
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

      if( this.dsParams.step > this.dspItems || this.listLen === 1 ) {
        this.dsParams.step = this.dspItems;
        this.isScrollable = false;
      }

      if( this.isScrollable ) {
        
        if( this.currentItem.obj === null || (reset||false) ) {
          this.currentItem = {
            index: this.dsParams.index,
            obj: this.items[ this.dsParams.index ],
            dTime: this.dsParams.duration
          }
        }
        
        if( this.dsParams.autoplay && this.isPlaying ) {
          this.timer = setTimeout(
            () => this[ ( this.dsParams.direction === 1 ? "next" : "prev" ) ](),
            this.currentItem.dTime
          );
        }
        
      }
      
      _ds.css.set({opacity: 1}, [this.sliderContener]);
    
    }
    
  }

  next( step: number = this.step ) {

		if( this.dsParams.autoplay ) {
			clearTimeout( this.timer );
		}
			
	  if( !this.isTransitionStarted ) {

			this.dsSliderEvent.emit({ 'slide': 'start-slide', 'direction': 1 });
      this.isTransitionStarted = true;
			this.items = this.getListItems();

      const from: any = { transform: 'translate3d(0,0,0)' };
      const to: any = {};
    
      if( this.dsParams.orientation === "vtc" ) {
        from.height = `${this.listDim + this.itemHeight*step}px`;
        to.transform = `translate3d( 0, -${this.itemHeight*step}px, 0 )`;
      } else {

        let distance = this.itemWidth*step;
        let nextItemWidth = this.itemWidth*step;
        if( !this.dsParams.autoWidth ) {
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

		if( this.dsParams.autoplay ) {
			clearTimeout( this.timer );
		}
		
		if( !this.dsParams.loop && (this.currentItem.index - step < 0) ) {
			step = this.currentItem.index;
    }

    if( !this.isTransitionStarted ) {

      this.dsSliderEvent.emit({ 'slide': 'start-slide', 'direction': -1 });
      this.isTransitionStarted = true;
      this.items = this.getListItems();

      const from: any = {};
      const to: any = { transform: 'translate3d(0,0,0)' };

      if( this.dsParams.orientation === "vtc" ) {
        from.height = `${this.listDim + this.itemHeight*step}px`;
        from.transform = `translate3d( 0, -${this.itemHeight*step}px, 0 )`;
      } else {
        
        let distance = this.itemWidth*step;
        let prevItemWidth = this.itemWidth*step;
        if( !this.dsParams.autoWidth ) {
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
    if( typeof this.dsParams.menu === "boolean" && this.dsParams.menu && this.menu ) {
      this.menu.dsCurrentItemIndex = this.currentItem.index;
    }
    this.list.removeEventListener( 'transitionend', this.slideNextTransitionEndHandler );
    
    if(this.dsParams.autoplay) {
      this.timer = setTimeout(
        () => {
          if( this.isPlaying ) {
            this.next();
          }
        },
        this.dsParams.duration
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
    if( typeof this.dsParams.menu === "boolean" && this.dsParams.menu && this.menu ) {
      this.menu.dsCurrentItemIndex = this.currentItem.index;
    }
    this.list.removeEventListener( 'transitionend', this.slidePrevTransitionEndHandler );

    if(this.dsParams.autoplay) {
      this.timer = setTimeout(
        () => {
          if( this.isPlaying ) {
            this.prev();
          }
        },
        this.dsParams.duration
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

        {(this.dsParams.loop || this.currentItem.index) > 0 && (
          <ds-button
            class="ds-slider__prev-button"
            dsMods={['slider', 'prev']}
            onClick={this.handlePrevButtonClickHandler}
          />
        )}

        <div class="ds-slider__container">
          <div class="ds-slider__list">
            <slot/>
            <slot name="content" />
          </div>
        </div>
        
        {(this.dsParams.loop || this.currentItem.index + this.dspItems < this.listLen) && ( 
          <ds-button
            class="ds-slider__next-button"
            dsMods={['slider', 'next']}
            onClick={this.handleNextButtonClickHandler}
          />
        )}

        {this.dsParams.menu && (
          <ds-slider-menu
            dsItemCount={this.listLen}
            dsCurrentItemIndex={this.currentItem.index}
          />
        )}

      </div>
    );
  }
}
