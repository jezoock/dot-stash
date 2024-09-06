import { Component, Prop, h } from '@stencil/core';


@Component({
  tag: 'ds-category-list',
  styleUrl: 'category-list.scss'
})
export class DSCategoryList {

  @Prop({ reflect: true }) showImage: boolean = false;

  render() {
    return (
      <div class="ds-category-list">
        <div class="ds-category-list__root-category">
          <slot name="rootCategory" />
        </div>
        <div class="ds-category-list__sub-categories">
          <slot name="subCategories" />
        </div>
      </div>
    );
  }
}