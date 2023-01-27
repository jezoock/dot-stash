import { Component, h, Prop, Watch, Event } from '@stencil/core';
import { EventEmitter } from '@stencil/core/internal';
import _ds from '../../../dot-stash';

export type DSButtonType = 'button' | 'submit' | 'trigger';
export type ButtonType = 'button' | 'submit';

@Component({
  tag: 'ds-button',
  styleUrl: 'button.scss',
})
export class DSButton {
  @Prop() type: DSButtonType = 'button';
  @Prop() mods: string | string[] = [];
  @Prop() url: string;
  @Prop() styles: string;
  @Prop() color: string;
  @Prop() disabled: string | boolean;

  CSSClassList: Record<string, boolean>;
  buttonType: ButtonType;
  isDisabled: boolean;

  @Watch('disabled')
  disabledPropChangeHandler(newDisabled: string | boolean) {
    this.isDisabled = _ds.props.isTrue(newDisabled);
  }

  @Watch('mods')
  modsPropChangeHanler(newMods: string | string[]) {
    this.CSSClassList = _ds.props.toClassList(
      'ds-button',
      [
        ..._ds.props.toArray(newMods),
        this.styles,
        this.color
      ]
    );
  }

  @Event() dsButtonClick: EventEmitter;

  constructor() {
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList(
      'ds-button',
      [
        ..._ds.props.toArray(this.mods),
        this.styles,
        this.color,
      ]
    );
    this.buttonType = this.type === 'trigger' ? 'button' : this.type;
    this.isDisabled = _ds.props.isTrue(this.disabled);
  }

  buttonClickHandler(event: MouseEvent) {
    this.dsButtonClick.emit();
    if (this.buttonType === 'button') {
      event.preventDefault();
      event.stopPropagation();
      if (this.url) {
        window.location.href = this.url;
      }
    }
  }

  render() {
    return (
      <button 
        class={this.CSSClassList}
        type={this.buttonType}
        disabled={this.isDisabled}
        onClick={this.buttonClickHandler}
      >
        <slot name="before" />
        <slot />
        <slot name="after" />
      </button>
    );
  }
}
