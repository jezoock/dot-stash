import { Component, h, Prop, Watch, Event } from '@stencil/core';
import { Element, EventEmitter, Host } from '@stencil/core/internal';
import _ds from '../../../dot-stash';
import Breakpoint from '../../../interfaces/breakpoint';

export type DSButtonType = 'button' | 'submit' | 'trigger';
export type ButtonType = 'button' | 'submit';

const Breakpoints: () => PropertyDecorator = () => {
  return (target: any, propertyKey: string) => {
    const rspComponent = document.querySelector("ds-rsp");
    target[propertyKey] = async (): Promise<{ breakpoints: Breakpoint[]; }> => { return await rspComponent.getData(); };
  };
};

const Responsive: () => PropertyDecorator = () => {
  return (target: any, propertyKey: string) => {
    const rspComponent = document.querySelector("ds-rsp");
    target[propertyKey] = async (element: HTMLDsButtonElement) => { return await rspComponent.subscribe(element); };
  };
};

@Component({
  tag: 'ds-button',
  styleUrl: 'button.scss',
})
export class DSButton {
  @Element() button: any;

  @Prop() type: DSButtonType = 'button';
  @Prop() mods: string | string[] = [];
  @Prop() url: string;
  @Prop() styles: string;
  @Prop() color: string;
  @Prop() disabled: string | boolean;

  @Breakpoints() breakpoints: any;
  @Responsive() subscribeResponsive: any;

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

  componentDidLoad() {
    this.subscribeResponsive(this.button);
  }

  buttonClickHandler(event: MouseEvent) {
    this.dsButtonClick.emit();
    console.log(this.breakpoints());
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
      <Host>
      <button 
        class={this.CSSClassList}
        type={this.buttonType}
        disabled={this.isDisabled}
        onClick={this.buttonClickHandler}
      >
        <slot name="before" />
        <slot />
        <slot name="after" />
      </button></Host>
    );
  }
}
