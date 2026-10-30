import { Component, h, Method, Prop, State, Event, Host, Element, EventEmitter, Watch } from '@stencil/core';
import CssClassList from '../../types/css-class-list.interface';
import _ds from '../../utils/dot-stash';


@Component({
  tag: 'ds-select',
})
export class DSSelect {
  CSSClassList: CssClassList;
  
  @Element() hostContainer: HTMLElement;
  
  @State() value: string = '';
  @State() label: string = '';
  @State() opened: boolean;

  @Prop() name: string;
  @Prop({ reflect: true }) disabled: boolean;
  @Prop({ reflect: true, mutable: true }) mods: string | string[] = [];
  @Prop({ reflect: true, mutable: true }) defaultValue: string;

	@Watch('mods')
	modsChangeHandler(mods: string | string[]) {
		this.CSSClassList = _ds.props.toClassList("ds-select", mods);
	}

  @Event() valueChange: EventEmitter;

  @Method()
  async getValue() {
    const { value, label } = this;
    return { value, label }; 
  }
  
  inputChangeHandler = () => {
    /* this.opened = false; */
    if (!this.disabled) {
      const select = this.hostContainer.querySelector("select");
      const [selectedOption] = Array.from(select.selectedOptions);
      if (selectedOption) {
        this.label = selectedOption.innerHTML;
        this.value = selectedOption.value;
      }
      this.valueChange.emit({ selectedOption });
    }
  }

  inputClickHandler = () => {
    if (!this.disabled) {
      const { opened } = this;
      this.opened = !opened;
    }
  }

  inputFocusOutHandler = () => {
    this.opened = false;
  }
  
  connectedCallback() {
    let selectedOption = this.hostContainer.querySelector("option[selected]") as HTMLOptionElement;
    if (!selectedOption) {
      Array.from(this.hostContainer.querySelectorAll("option")).map( option => option.selected && (selectedOption = option));
    }
    if (!selectedOption) {
      Array.from(this.hostContainer.querySelectorAll("option")).map( (option, index) => index === 0 && (selectedOption = option));
    }
    if (selectedOption) {
      this.label = selectedOption.innerHTML;
      this.value = selectedOption.value;
    }
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-select", _ds.props.toArray(this.mods));
    if (this.defaultValue) {
      this.value = this.defaultValue;
    }
  }
  
  render() {
    return (
      <Host 
        class={{
          ...this.CSSClassList,
          "--opened": this.opened,
          "--disabled": this.disabled,
        }}
        onClick={this.inputClickHandler}
      >
        <div class="ds-select__label">
          {this.label}
        </div>
        <select
          class="ds-select__input"
          name={this.name}
          id={this.name}
          
          onFocusout={this.inputFocusOutHandler}
          onChange={this.inputChangeHandler}
        >
          <slot />
        </select>
      </Host>
    );
  }
}