import { Component, h, Host, Prop } from '@stencil/core';

const jQuery = window.$;

@Component({
  tag: 'ds-category-search',
})
export class DSCategorySearch {

  @Prop({ mutable: true, reflect: true }) controllerUrl: string;

  constructor() {
    this.categorySearchChangeHandler = this.categorySearchChangeHandler.bind(this);
  }
  
  componentDidLoad() {
    jQuery('#categoryFilter').autocomplete(
      this.controllerUrl+'&ajax=1&action=getCategories', {
          minChars: 2,
          max: 50,
          width: 400,
          selectFirst: false,
          scroll: false,
          mustMatch:false,
          cacheLength:0,
          formatItem: function(item) {
              return item[1]+' - '+item[0];
          },
          select: this.categorySearchChangeHandler
        }
      ).result(function(_, data) {
        if (data==null)
          return false;
        $('#id_category').val(data[2]);
        $('#categoryFilter').val(data[0]);
        //getContentStat(data[2],0,false,true);
      });
  }

  disconnectedCllback() {
    jQuery('#categoryFilter').autocomplete("destroy");
    jQuery('#categoryFilter').removeData('autocomplete');
  }

  categorySearchChangeHandler(_, ui: any) {
    const { item: { value, label }} = ui;
    console.log(label, value);
  }

  render() {
    return (
      <Host class="ds-category-search">
        <label htmlFor="categoryFilter">
          {"Search category"}
        </label>
        <input type="text" id="categoryFilter" name="categoryFilter" value="" />
      </Host>
    );
  }
}