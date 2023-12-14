import { Component, h, Event, EventEmitter, Prop, State, Watch } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

@Component({
  tag: 'ds-input',
  styleUrl: 'input.scss'
})

export class DSInput {
  @Prop() type = 'text';
  @Prop() inputId: string;
  @Prop() inputName: string;
  @Prop() min: number;
  @Prop() max: number;
  @Prop() isDisabled: boolean;
  @Prop() value: any;
  @Prop() isInError: boolean;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = '';
  @Prop({ mutable: true, reflect: true }) autocomplete = 'on';
  @Prop({ mutable: true, reflect: true }) placeholder = '';

  @State() isHovered = false;

  inputValue = '';
  CSSClassList: any;

  @Watch('mods')
  modsWatcher(newMods) {
    this.CSSClassList = _ds.props.toClassList('ds-input', newMods);
  }
  
  @Event() dSKeyDown: EventEmitter;
  @Event() dSKeyUp: EventEmitter;
  @Event() dSInput: EventEmitter;
  @Event() dSInputBlur: EventEmitter;
  
  constructor() {
    this.CSSClassList = _ds.props.toClassList('ds-input', this.mods);

    this.inputHandler = this.inputHandler.bind(this);
    this.inputBlurHandler = this.inputBlurHandler.bind(this);
    this.inputMouseOverHandler = this.inputMouseOverHandler.bind(this);
    this.inputMouseOutHandler = this.inputMouseOutHandler.bind(this);
  }

  inputHandler(event: any): void {
    const { value } = event.target;
    this.inputValue = value;
    this.dSInput.emit({ name: this.inputName, value });
  }
  
  inputBlurHandler(event: any): void {
    const { value } = event.target;
    this.inputValue = value;
    this.dSInputBlur.emit({ name: this.inputName, value });
  }

  inputMouseOverHandler(): void {
    this.isHovered = true;
  }
  
  inputMouseOutHandler(): void {
    this.isHovered = false;
  }

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
          '--valid': this.value && !this.isInError,
          '--error': this.isInError,
          '--disabled': this.isDisabled,
          '--hovered': this.isHovered,
          '--filled': !!this.inputValue,
          '--ltr-border': true
        }}
        onMouseOver={ this.inputMouseOverHandler }
        onMouseOut={ this.inputMouseOutHandler }
      >
        <input
          class="ds-input__input"
          name={this.inputName}
          type={this.type}
          id={this.inputId}
          placeholder={this.placeholder}
          min={this.min}
          max={this.max}
          disabled={this.isDisabled}
          onInput={this.inputHandler}
          onBlur={this.inputBlurHandler}
          autocomplete={this.autocomplete}
          value={this.value}
        />
      </div>
    );
  }
}
