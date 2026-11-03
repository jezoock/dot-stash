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

/** A label template with its values: `formatLabel('{index} of {count}', { index: 2, count: 5 })` gives `2 of 5`. */
export const formatLabel = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
