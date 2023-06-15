import { Component, h, Prop, Watch, Event } from '@stencil/core/internal';
import { EventEmitter } from '@stencil/core/internal';
import _ds from '../dot-stash';

export type DSButtonType = 'button' | 'submit' | 'trigger';
export type ButtonType = 'button' | 'submit';

@Component({
  tag: 'ds-button',
  styleUrl: 'button.scss',
})
export class DSButton {
  CSSClassList: Record<string, boolean>;
  buttonType: ButtonType;
  isDisabled: boolean;

  @Prop({ reflect: true, mutable: true }) type: DSButtonType = 'button';
  @Prop({ reflect: true, mutable: true }) mods: string[] = [];
  @Prop({ reflect: true, mutable: true }) url: string;
  @Prop({ reflect: true, mutable: true }) styles: string;
  @Prop({ reflect: true, mutable: true }) color: string;
  @Prop({ reflect: true, mutable: true }) disabled: boolean;

  @Watch('disabled')
  disabledPropChangeHandler(isDisabled: boolean) {
    this.isDisabled = _ds.props.isTrue(isDisabled);
  }

  @Watch('mods')
  modsPropChangeHanler(mods: string[]) {
    this.CSSClassList = this.generateClassList(mods);
  }

  @Event() buttonClick: EventEmitter;

  componentWillLoad() {
    this.CSSClassList = this.generateClassList(this.mods);
    this.buttonType = this.type === 'trigger' ? 'button' : this.type;
    this.isDisabled = _ds.props.isTrue(this.disabled);
  }

  generateClassList(modifiers: string[]) {
    const newModifiers = _ds.props.toArray(modifiers);
    if (typeof this.styles === "string") {
      newModifiers.push(this.styles);
    }
    if (typeof this.color === "string") {
      newModifiers.push(this.color);
    }
    return _ds.props.toClassList(
      'ds-button',
      newModifiers
    );
  }

  buttonClickHandler = (event: MouseEvent) => {
    this.buttonClick.emit();
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
