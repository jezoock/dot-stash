import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'ds-slider-menu',
  styleUrl: 'slider-menu.scss'
})
export class DSSliderMenu {

  @Prop({ reflect: true, mutable: true, attribute: "itemCount" }) dsItemCount: number = 0;
  @Prop({ reflect: true, mutable: true, attribute: "currentItemIndex" }) dsCurrentItemIndex: number = 0;

  @Event() request_displaySliderItem_event: EventEmitter;

  constructor() {
    this.itemClickHandler = this.itemClickHandler.bind(this);
  }

  itemClickHandler(index: number): void {
    this.request_displaySliderItem_event.emit({ index });
  }
  
  render() {
    return (
      <ul class="ds-slider-menu">
        {[...Array(this.dsItemCount)].map( (_, index) => (
          <li
            class={{
              "ds-slider-menu__item": true,
              "--active": index === this.dsCurrentItemIndex
            }}
            onClick={ () => this.itemClickHandler(index) }
          >
            <span class="ds-slider-menu__label">
              {index}
            </span>
          </li>
        ))}
      </ul>
    );
  }
}