import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

@Component({
  tag: 'ds-customer-page'
})
export class DSCustomerPage {

  @Prop() dsMods: string | string[] = "";

  CSSClassList: any;

	@Watch('dsMods')
  dsModsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-customer-page", newMods);
  }

	constructor() { }
	
	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-customer-page", this.dsMods);
	}

  componentDidLoad() {
    const customerEmailParam = window.location.search.substring(1).split('&').find( param => param.split('=')[0] === 'customer_email' );
    
    if(customerEmailParam) {
      const emailInput = document.querySelector("#customer-form input[name='email']") as HTMLInputElement;
      emailInput.value = customerEmailParam.split('=')[1];
    }
  }
  
  render() {
    return (
      <div class="ds-customer-page">
        <div class="ds-customer-page__title">
          <slot name="header" />
        </div>
        <div class="ds-customer-page__menu">
          <slot name="menu" />
        </div>
        <div class="ds-customer-page__body">
          <slot />
        </div>
      </div>
    );
  }
}