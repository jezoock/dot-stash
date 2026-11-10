import { DSSliderLabels } from './slider.types';

/** The texts of ds-slider and ds-slider-menu read by assistive technologies (`labels`), in English by default. */
export const DSSliderDefaultLabels: Required<DSSliderLabels> = {
  carousel: 'carousel',
  slide: 'slide',
  slideName: '{index} of {count}',
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic slide show',
  pause: 'Stop automatic slide show',
  menu: 'Choose a slide',
  menuItem: 'Slide {index}',
};
