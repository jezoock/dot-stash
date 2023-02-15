import { Component, h, Prop, Watch } from '@stencil/core';
import _ds from '../dot-stash';

@Component({
  tag: 'ds-section',
  styleUrl: 'section.scss'
})
export class DSSection {

  @Prop({ mutable: true, reflect: true}) mods: string | string[] = "";
  @Prop({ mutable: true, reflect: true}) background: string;

  CSSClassList: Record<string, boolean>;

  @Watch('mods')
  modsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-section", newMods);
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-section", this.mods);
  }
  
  render() {
    const style = {} as Record<string, unknown>;
    if (this.background) {
      style.style = { backgroundImage: `url(${this.background})` };
    }
    return (
      <div
        class={this.CSSClassList}
        {...style}
      >
        <div class="ds-section__content">
          <slot />
        </div>
      </div>
    );
  }
}