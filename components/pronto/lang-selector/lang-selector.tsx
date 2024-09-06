import { Component, h, Prop } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';
import { DSOption } from '../../ui/dropdown/dropdown';

@Component({
  tag: 'ds-lang-selector',
  styleUrl: 'lang-selector.scss'
})
export class DSLangSelector {
  
  @Prop({ mutable: true, reflect: true }) currentLang: string;
  @Prop({ attribute: 'languages' }) languagesFromProp: DSOption[] | string = [];

  languages: DSOption[];

  constructor() {
    this.languages = _ds.props.fromJSON(this.languagesFromProp);
  }

  render() {
    return (
      <div class="ds-lang-selector">
        <ds-combo
          mods="lang-selector"
          options={this.languages}
          selectedOption={[this.languages.find(lang => lang.selected)]}
        />
      </div>
    );
  }
}