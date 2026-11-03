import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { DSSliderDefaultLabels, formatLabel } from '../slider.constants';

/**
 * The menu of `ds-slider` (`params.menu`): a list of dots, one per slide, each one a button that shows its slide. The
 * list is named by `label`, each button by `item-label` ("Slide 2"); the button of the current slide has
 * `aria-current="true"`. `ds-slider` renders it and gives it its texts (its `labels`).
 */
@Component({
  tag: 'ds-slider-menu',
  styleUrl: 'slider-menu.scss',
})
export class DSSliderMenu {
  @Prop({ reflect: true, mutable: true, attribute: 'itemCount' }) dsItemCount: number = 0;
  @Prop({ reflect: true, mutable: true, attribute: 'currentItemIndex' }) dsCurrentItemIndex: number = 0;
  /** The accessible name of the menu (`aria-label` of its list). */
  @Prop() label: string = DSSliderDefaultLabels.menu;
  /** The accessible name of a dot: `{index}` is the number of its slide, `{count}` the number of slides. */
  @Prop() itemLabel: string = DSSliderDefaultLabels.menuItem;

  @Event() request_displaySliderItem_event: EventEmitter;

  constructor() {
    this.itemClickHandler = this.itemClickHandler.bind(this);
  }

  itemClickHandler(index: number): void {
    this.request_displaySliderItem_event.emit({ index });
  }

  render() {
    return (
      <ul class="ds-slider-menu" aria-label={this.label}>
        {[...Array(this.dsItemCount)].map((_, index) => (
          <li
            class={{
              'ds-slider-menu__item': true,
              '--active': index === this.dsCurrentItemIndex,
            }}
          >
            <button
              type="button"
              class="ds-slider-menu__button"
              aria-label={formatLabel(this.itemLabel, { index: index + 1, count: this.dsItemCount })}
              aria-current={index === this.dsCurrentItemIndex ? 'true' : undefined}
              onClick={() => this.itemClickHandler(index)}
            >
              <span class="ds-slider-menu__label">{index}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }
}
