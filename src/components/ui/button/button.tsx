import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../dot-stash';

@Component({
  tag: 'ds-button',
  styleUrl: 'button.scss',
})
export class DSButton {
  @Prop() dsType = 'button';
  @Prop() dsMods: string | string[] = [];
  @Prop() dsUrl: string;
  @Prop() dsStyle: string;
  @Prop() dsColor: string;

  CSSClassList: any;

  @Watch('dsMods')
  dsModsWatcher(newMods) {
    this.CSSClassList = _ds.props.toClassList('ds-button', newMods);
  }

  constructor() {
    this.buttonClickHandler = this.buttonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-button', [..._ds.props.toArray(this.dsMods), this.dsStyle, this.dsColor]);
  }

  buttonClickHandler(event) {
    if (this.dsUrl) {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = this.dsUrl;
    }
  }

  render() {
    return (
      <button type={this.dsType} class={this.CSSClassList} onClick={this.buttonClickHandler}>
        <slot name="before" />
        <slot />
        <slot name="after" />
      </button>
    );
  }
}
