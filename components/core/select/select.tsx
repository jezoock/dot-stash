import { Component, h, Method, Prop, State, Event, Host, Element, EventEmitter } from '@stencil/core';
import { toClassList } from '../../utils/props';

@Component({
  tag: 'ds-select',
})
export class DSSelect {
  @Element() hostContainer: HTMLElement;

  @State() value: string = '';
  @State() label: string = '';
  @State() opened: boolean;

  @Prop() name: string;
  @Prop({ reflect: true }) disabled: boolean;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ reflect: true, mutable: true }) defaultValue: string;

  @Event() valueChange: EventEmitter;

  @Method()
  async getValue() {
    const { value, label } = this;
    return { value, label };
  }

  inputChangeHandler = () => {
    if (!this.disabled) {
      const select = this.hostContainer.querySelector('select');
      const [selectedOption] = Array.from(select.selectedOptions);
      if (selectedOption) {
        this.label = selectedOption.innerHTML;
        this.value = selectedOption.value;
      }
      this.valueChange.emit({ selectedOption });
    }
  };

  inputClickHandler = () => {
    if (!this.disabled) {
      const { opened } = this;
      this.opened = !opened;
    }
  };

  inputFocusOutHandler = () => {
    this.opened = false;
  };

  connectedCallback() {
    let selectedOption = this.hostContainer.querySelector('option[selected]') as HTMLOptionElement;
    if (!selectedOption) {
      Array.from(this.hostContainer.querySelectorAll('option')).map(option => option.selected && (selectedOption = option));
    }
    if (!selectedOption) {
      Array.from(this.hostContainer.querySelectorAll('option')).map((option, index) => index === 0 && (selectedOption = option));
    }
    if (selectedOption) {
      this.label = selectedOption.innerHTML;
      this.value = selectedOption.value;
    }
  }

  componentWillLoad() {
    if (this.defaultValue) {
      this.value = this.defaultValue;
    }
  }

  render() {
    return (
      <Host
        class={{
          ...toClassList('ds-select', this.mods),
          '--opened': this.opened,
          '--disabled': this.disabled,
        }}
        onClick={this.inputClickHandler}
      >
        <div class="ds-select__label">{this.label}</div>
        <select class="ds-select__input" name={this.name} id={this.name} onFocusout={this.inputFocusOutHandler} onChange={this.inputChangeHandler}>
          <slot />
        </select>
      </Host>
    );
  }
}
