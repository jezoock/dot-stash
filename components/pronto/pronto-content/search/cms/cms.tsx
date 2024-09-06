import { Component, h, Host, Prop } from '@stencil/core';

const jQuery = window.$;

@Component({
  tag: 'ds-cms-search',
})
export class DSCMSSearch {

  @Prop({ mutable: true, reflect: true }) route: string;
  @Prop({ reflect: true, mutable: true }) value: string;

  selectedPages: {name: string; id: string;}[] = [];

  constructor() {
    this.cmsSearchChangeHandler = this.cmsSearchChangeHandler.bind(this);
    this.deleteTagHanler = this.deleteTagHanler.bind(this);
  }
  
  componentDidLoad() {
    jQuery('#cmsFilter').autocomplete(
      this.route+'&ajax=1&action=getCMSPages', {
          minChars: 2,
          max: 50,
          width: 400,
          selectFirst: false,
          scroll: false,
          mustMatch:false,
          cacheLength:0,
          formatItem: function(item) {
            const [name, id] = item;
            return `[ ${id} ] ${name}`;
          }
        }
      ).result((_, data) => {
        if (data==null)
          return false;
        this.cmsSearchChangeHandler(data);
        //getContentStat(data[2],0,false,true);
      });
  }

  disconnectedCllback() {
    jQuery('#cmsFilter').autocomplete("destroy");
    jQuery('#cmsFilter').removeData('autocomplete');
  }

  cmsSearchChangeHandler(page) {
    const [ name, id ] = page;
    const selectedPages = this.selectedPages.filter( ({id: productId}) => id !== productId);
    const selectedPagesId = selectedPages.map( ({id}) => id);
    
    selectedPages.push({id, name: `[ ${id} ] - ${name}`});
    selectedPagesId.push(id);

    this.selectedPages = selectedPages;
    this.value = selectedPagesId.join(',');

    $('#cmsFilter').val('');
  }

  deleteTagHanler({detail: { tagId }}: CustomEvent) {
    const { selectedPages } = this;
    const newPages = selectedPages.filter( ({id}) => id !== tagId );
    const newPagesId = newPages.map(({id}) => id);
    this.selectedPages = newPages;
    this.value = newPagesId.join(',');
  }

  render() {
    return (
      <Host class="ds-cms-search">
      {this.selectedPages.length > 0 && (
        <div class="ds-product-search__selected-products">
          {this.selectedPages.map(
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
      <input type="text" id="cmsFilter" name="cmsFilter" value="" />
    </Host>
    );
  }
}