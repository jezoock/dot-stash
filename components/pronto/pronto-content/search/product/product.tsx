import { Component, Event, EventEmitter, h, Host, Prop } from '@stencil/core';
import _ds from '../../../../../typescript/dot-stash';

const jQuery = window.$;

@Component({
  tag: 'ds-product-search',
})
export class DSProductSearch {

  @Prop({ mutable: true, reflect: true }) route: string;
  @Prop({ reflect: true, mutable: true }) value: string | string[] = [];

  selectedProducts: {name: string; id: string;}[] = [];

  @Event() valueChange: EventEmitter;

  constructor() {
    this.productSearchChangeHandler = this.productSearchChangeHandler.bind(this);
    this.deleteTagHanler = this.deleteTagHanler.bind(this);
  }

  componentWillLoad() {
    let defaultValue = [];
    if (typeof this.value === "string" && this.value !== '') {
      defaultValue = this.value.indexOf(",") > - 1 ? this.value.split(',') : [ this.value ];
    }
    if (Array.isArray(this.value)) {
      defaultValue = this.value;
    }
    this.selectedProducts = defaultValue.map( id => ({ id, name: id }));
  }
  
  componentDidLoad() {
    jQuery('#productFilter').autocomplete(
      `${this.route}&ajax=1&action=getProducts`, {
          minChars: 2,
          max: 50,
          width: 400,
          selectFirst: false,
          scroll: false,
          mustMatch:false,
          cacheLength:0,
          formatItem: function(item) {
            const [name, reference, id] = item;
            return `[ ${id} | ${reference} ] ${name}`;
          }
        }
      ).result((_, data) => {
        if (data === null)
          return false;
        this.productSearchChangeHandler(data);
        //getContentStat(data[2],0,false,true);
      });
  }

  disconnectedCllback() {
    jQuery('#productFilter').autocomplete("destroy");
    jQuery('#productFilter').removeData('autocomplete');
  }

  productSearchChangeHandler(product) {
    const [ name, reference, id ] = product;
    const selectedProducts = this.selectedProducts.filter( ({id: productId}) => id !== productId);
    const selectedProductsId = selectedProducts.map( ({id}) => id);
    
    selectedProducts.push({id, name: `[${reference}] - ${name}`});
    selectedProductsId.push(id);

    this.selectedProducts = selectedProducts;
    this.value = selectedProductsId.join(',');

    this.valueChange.emit({ value: this.value });

    $('#productFilter').val('');
  }

  deleteTagHanler({detail: { tagId }}: CustomEvent) {
    const { selectedProducts } = this;
    const newProducts = selectedProducts.filter( ({id}) => id !== tagId );
    const newProductsId = newProducts.map(({id}) => id);
    this.selectedProducts = newProducts;
    this.value = newProductsId.join(',');
  }

  render() {
    return (
      <Host class="ds-product-search">
        {this.selectedProducts.length > 0 && (
          <div class="ds-product-search__selected-products">
            {this.selectedProducts.map(
              ({ name, id }) => (
                <ds-tag 
                  tag-id={id} 
                  onRequestDeleteTag={this.deleteTagHanler}
                >
                  <span>{name}</span>
                </ds-tag>
              )
            )}
          </div>
        )}
        <input type="text" id="productFilter" name="productFilter" value="" />
      </Host>
    );
  }
}