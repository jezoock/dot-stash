export interface DSSliderSelectors {
  sliderContainer: string;
  menu: string;
  list: string;
  items: string;
}

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
