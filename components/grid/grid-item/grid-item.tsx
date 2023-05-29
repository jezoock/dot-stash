import { Component, Element, h, Prop, Watch, Method } from '@stencil/core/internal';
import _ds from '../../dot-stash';
import { DSGridItemStyles } from "../grid";

@Component({
  tag: 'ds-grid-item',
  styleUrl: 'grid-item.scss',
})
export class DSGridItem {
  ratio: number;
  useRatio = false;

  @Element() container: HTMLDivElement;
  @Prop() dsRatio: number | string;
  @Prop() width = 1;

  @Watch('dsRatio')
  ratioWatcher(newRatio: string | number) {
    this.useRatio = true;
    this.ratio = _ds.props.toNumber(newRatio);
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
    if (this.dsRatio) {
      const ratio = _ds.props.toNumber(this.dsRatio);
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
      <div
        class={{
          'ds-grid-item': true,
          '--with-ratio': this.useRatio,
        }}
      >
        <div class="ds-grid-item__content">
          <slot />
        </div>
      </div>
    );
  }
}
