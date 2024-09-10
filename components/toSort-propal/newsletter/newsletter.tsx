import { Component, h, Prop } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-newsletter',
  styleUrl: 'newsletter.scss'
})
export class DSNewsletter {
  
  @Prop() dsSubscribeUrl: string;
  @Prop() dsPlaceholder: string;
  @Prop() dsDisplayedBy: string;
  @Prop({ mutable: true }) dsInputValue: string;

  constructor() {
    this.subscribeButtonClickHandler = this.subscribeButtonClickHandler.bind(this);
  }

  async subscribeButtonClickHandler() {
    /* const result =  */await _ds.ajax.post( this.dsSubscribeUrl, { email: this.dsInputValue, blockHookName: this.dsDisplayedBy } )
    //console.log(result);
  }

  render() {
    return (
      <form class="ds-newsletter">
        
        <input type="hidden" name="blockHookName" value="{$hookName}" />
        <input type="hidden" name="action" value="0" />

        <slot name="header" />

        <fieldset>
          <input
            name="email"
            type="email"
            value={this.dsInputValue}
            placeholder={this.dsPlaceholder}
            aria-labelledby="block-newsletter-label"
            required
          />
          <ds-button
            class="ds-newsletter__submit-button"
            mods="subscribe"
            onClick={ this.subscribeButtonClickHandler }
          >
            S'inscrire
          </ds-button>
        </fieldset>

        <slot name="footer" />

      </form>
    );
  }
}