import { Component, Element, h, Prop, Watch, Method } from '@stencil/core/internal';
import _ds from '../../dot-stash';

@Component({
  tag: 'ds-grid-item',
  styleUrl: 'grid-item.scss',
})
export class DSGridItem {
  ratio: number;
  useRatio = false;

  @Element() container: HTMLDivElement;
  @Prop() dsRatio: number | string;

  @Watch('dsRatio')
  ratioWatcher(newRatio: string | number) {
    this.useRatio = true;
    this.ratio = _ds.props.toNumber(newRatio);
  }

  @Method()
  async setStyles(width = '100%', paddingBlockStart = '0',  paddingInlineEnd = '0', paddingBlockEnd = '0', paddingInlineStart = '0') {
    this.container.style.width = width;
    this.container.style.paddingBlockStart = paddingBlockStart;
    this.container.style.paddingInlineEnd = paddingInlineEnd;
    this.container.style.paddingBlockEnd = paddingBlockEnd;
    this.container.style.paddingInlineStart = paddingInlineStart;
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
