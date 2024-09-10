import { Component, Event, EventEmitter, h, Host, Prop } from '@stencil/core';


@Component({
  tag: 'ds-tag',
  styleUrl: 'tag.scss'
})
export class DSTag {

  @Prop({ mutable: true }) tagId: string;

  @Event() requestDeleteTag: EventEmitter;

  constructor() {
    this.deleteButtonClickHandler = this.deleteButtonClickHandler.bind(this);
  }

  deleteButtonClickHandler() {
    this.requestDeleteTag.emit({ tagId: this.tagId });
  }

  render() {
    return (
      <Host>
        <ds-trigger type="button" mods="xs, rounded, stl-1" onClick={this.deleteButtonClickHandler}>
          <slot />
          <span>X</span>
        </ds-trigger>
      </Host>
    );
  }
}