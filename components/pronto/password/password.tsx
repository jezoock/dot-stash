import { Component, h, Host, Prop, Watch, State } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';


@Component({
  tag: 'ds-password',
  styleUrl: 'password.scss'
})
export class DSPassword {
  CSSClassList: CssClassList;

  @Prop() defaultValue: string = '';
  @Prop({ reflect: true }) pattern: string;
  @Prop({ reflect: true }) name: string;
  @Prop() type: 'text' | 'password' = 'password'
  @Prop({ reflect: true, mutable: true }) mods: string | string[] = [];

  @State() value: string;

	@Watch('mods')
	modsChangeHandler(mods: string | string[]) {
		this.CSSClassList = _ds.props.toClassList("ds-password", mods);
	}

  constructor() {
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-password", _ds.props.toArray(this.mods));
    this.value = this.defaultValue;
  }

  buttonClickHandler() {
    const {type} = this;
    this.type = type === 'text' ? 'password' : 'text';
  }

  render() {
    return (
      <Host 
        class={{
          ...this.CSSClassList,
          [`--password-shown`]: this.type === 'text',
          [`--password-hidden`]: this.type === 'password',
        }}
      >
        <input
          name={this.name}
          type={this.type}
          value={this.value}
          pattern={this.pattern}
          class="ds-password__input"
        />
        <ds-trigger
          type="button"
          class="ds-password__button"
          mods="input-password"
          onClick={this.buttonClickHandler}
        >
          <slot />
        </ds-trigger>
      </Host>
    );
  }
}