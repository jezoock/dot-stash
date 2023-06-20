import { Component, h, Prop, Watch } from '@stencil/core/internal';
import _ds from '../../typescript/dot-stash';

@Component({
  tag: 'ds-section',
  styleUrl: 'section.scss'
})
export class DSSection {

  @Prop({ mutable: true, reflect: true}) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true}) background: string;

  CSSClassList: Record<string, boolean>;

  @Watch('mods')
  modsWatcher( mods: string | string[] ) {
    this.CSSClassList = _ds.props.toClassList("ds-section", _ds.props.toArray(mods));
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList("ds-section", _ds.props.toArray(this.mods));
  }
  
  render() {
    const componentProps = {class: this.CSSClassList } as Record<string, unknown>;
    if (this.background) {
      componentProps.style = { backgroundImage: `url(${this.background})` };
    }
    return (
      <div
        {...componentProps}
      >
        <div class="ds-section__content">
          <slot />
        </div>
      </div>
    );
  }
}