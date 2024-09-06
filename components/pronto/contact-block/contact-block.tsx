import { Component, h } from '@stencil/core';
import { AnyHTMLElement, Element, Prop } from '@stencil/core/internal';

@Component({
  tag: 'ds-contact-block',
  styleUrl: 'contact-block.scss'
})
export class DSContactBlock {

  @Element() blockContener: AnyHTMLElement;

  @Prop() dsEmail: string;
  @Prop() dsPhone: string;
  @Prop() dsFax: string;
  @Prop() dsAddress: string;

  componentDidLoad() {
    const emailContener = this.blockContener.querySelector(".ds-contact-block__email");
    if(emailContener) {
      emailContener.innerHTML = `<a href="mailto: ${this.dsEmail}">${this.dsEmail}</a>`;
    }
    
    const phoneContener = this.blockContener.querySelector(".ds-contact-block__phone");
    if(phoneContener) {
      phoneContener.innerHTML = `<a href="tel: ${this.dsPhone}">${this.dsPhone}</a>`
    }
    
    const faxContener = this.blockContener.querySelector(".ds-contact-block__fax");
    if(faxContener) {
      faxContener.innerHTML = `<a href="tel: ${this.dsFax}">${this.dsFax}</a>`
    }
    
    const addressContener = this.blockContener.querySelector(".ds-contact-block__address");
    if(addressContener) {
      addressContener.innerHTML = `<address>${this.dsAddress}</address>`
    }
  }
  
  render() {
    return (
      <div class="ds-contact-block">
        <slot />
      </div>
    );
  }
}