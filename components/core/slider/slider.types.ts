export interface DSSliderSelectors {
  sliderContainer: string;
  menu: string;
  list: string;
  items: string;
}

export interface DSSliderParams {
  orientation?: 'hrt' | 'vtc';
  direction?: number;
  /**
   * The slide shown first, from 0 (`0` by default), at the load and on `refresh(true)`. With `loop`, an index out of the
   * slides counts round them (`-1` is the last one); without, it is at most the first slide of the last view.
   */
  index?: number;
  loop?: boolean;
  autoplay?: boolean;
  autoHeight?: boolean;
  step?: number;
  duration?: number;
  forceItemDspCount?: number;
  minItemDspCount?: number;
  /** Renders a ds-slider-menu (the menu element itself is found with selectors.menu). */
  menu?: boolean;
  xOffset?: number;
  yOffset?: number;
  forceHeight?: boolean;
  autoWidth?: boolean;
  selectors?: DSSliderSelectors;
  isActive?: boolean;
  controls?: boolean;
  draggable?: boolean;
}

/**
 * The texts of ds-slider read by assistive technologies (its `labels` prop), to translate them. `{index}` and `{count}`
 * are the number of a slide and the number of slides.
 */
export interface DSSliderLabels {
  /** The `aria-roledescription` of the slider: `carousel`. */
  carousel?: string;
  /** The `aria-roledescription` of a slide: `slide`. */
  slide?: string;
  /** The name of a slide (`aria-label`): `{index} of {count}`. */
  slideName?: string;
  /** The name of the previous button: `Previous slide`. */
  previous?: string;
  /** The name of the next button: `Next slide`. */
  next?: string;
  /** The name of the rotation button while the rotation is stopped: `Start automatic slide show`. */
  play?: string;
  /** The name of the rotation button while the slides rotate: `Stop automatic slide show`. */
  pause?: string;
  /** The name of the menu (`params.menu`): `Choose a slide`. */
  menu?: string;
  /** The name of a dot of the menu: `Slide {index}`. */
  menuItem?: string;
}
