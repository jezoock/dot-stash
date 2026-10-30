import { Component, Element, h, Host, Prop, Watch, Method } from '@stencil/core';
import { toNumber } from '../../../utils/props';
import { DSGridItemStyles } from '../grid.types';

@Component({
  tag: 'ds-grid-item',
  styleUrl: 'grid-item.scss',
})
export class DSGridItem {
  ratio: number;
  useRatio = false;

  @Element() container: HTMLDivElement;
  @Prop({ reflect: true, attribute: 'ratio' }) ratioFromProps: number | string;
  @Prop({ reflect: true, mutable: true }) width = 1;

  @Watch('ratioFromProps')
  ratioPropsWatcher(ratio: number) {
    this.useRatio = true;
    this.ratio = toNumber(ratio);
  }

  @Method()
  async getWidth() {
    return this.width;
  }

  @Method()
  async setStyles(styles: DSGridItemStyles): Promise<void> {
    for (const prop in styles) {
      this.container.style[prop] = styles[prop];
    }
  }

  componentWillLoad() {
    if (this.ratioFromProps) {
      const ratio = toNumber(this.ratioFromProps);
      if (ratio > 0) {
        this.useRatio = true;
        this.ratio = ratio * 100;
      }
    }
  }

  componentDidLoad() {
    if (this.useRatio) {
      const paddingBlockStart = `${this.ratio}% 0 0 0`;
      this.container.style.paddingBlockStart = paddingBlockStart;
    }
  }

  render() {
    return (
      <Host
        class={{
          'ds-grid-item': true,
          '--with-ratio': this.useRatio,
        }}
      >
        <div class="ds-grid-item__content">
          <slot />
        </div>
      </Host>
    );
  }
}
