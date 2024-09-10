import { Component, h, Prop, State } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-search-bar',
  styleUrl: 'search-bar.scss'
})
export class DSSearchBar {
  
  @Prop({ mutable: true, reflect: true }) dsSearchUrl: string;
  @Prop({ mutable: true, reflect: true }) dsSearchString: string;
  @Prop({ mutable: true, reflect: true }) dsPlaceholder: string;

  @State() results: any[] = [];
  @State() value: string = "";

  isFetchingResults: boolean = false;
  searchForm: HTMLFormElement;

  constructor() {
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.formSubmitHandler = this.formSubmitHandler.bind(this);
  }

  clearResults() {
    this.isFetchingResults = false;
    this.results = [];
  }

  inputChangeHandler( event ) {
    const { value } = event.target;
    this.value = value;
    if( value.length > 2 ) {
      /* _ds.form.submit( this.searchForm ); */
      this.searchForm.submit();
    } else {
      this.clearResults();
    }
  }

  async formSubmitHandler( ) {
    /* event.preventDefault();
    try {
      this.isFetchingResults = true;
      const results = await _ds.ajax.post( this.dsSearchUrl, { s: this.value, resultsPerPage: 10 });
      this.results = results?.products || [];
    } catch(err) {
      console.error(err);
      this.clearResults();
    } */
  }

  render() {
    return (
      <div class="ds-search-bar">

        <form
          ref={ el => this.searchForm = el }
          class="ds-search-bar__form"
          method="post"
          action={this.dsSearchUrl}
          onSubmit={ this.formSubmitHandler }
        >
          
          <input
            type="hidden"
            name="controller"
            value="search"
          />
          
          <div class="ds-search-bar__field">

            <div class="ds-search-bar__input">
              <input
                autocomplete="off"
                type="text"
                name="s"
                value={this.dsSearchString}
                placeholder={this.dsPlaceholder}
                onInput={ this.inputChangeHandler }
              />
            </div>

            <ds-button
              class="ds-search-bar__submit-button"
              mods={['searh-bar-submit']}
              type="submit"
            />

          </div>

          {this.results?.length > 0 && (
            <div class="ds-search-bar__results">
              <ul>
                {this.results.map( product => 
                  <li>
                    {!!product.category_name && (
                      <strong>{product.category_name}</strong>
                    )}
                    {!!product.name && (
                      <span>{product.name}</span>
                    )}
                  </li>
                )}
              </ul>
            </div>
          )}

        </form>

      </div>
    );
  }
}