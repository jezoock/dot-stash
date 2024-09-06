import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, Watch } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

/* type ToogleType = "radio" | "icon" | "checkbox" | "switch" | string; */

@Component({
  tag: 'ds-toggle',
  styleUrl: 'toggle.scss',
})
export class DSToggle {
  @Element() hostContainer: HTMLDsToggleElement;

  @Prop({ mutable: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) value: any;
  @Prop({ mutable: true, reflect: true }) name: string;
  @Prop({ mutable: true, reflect: true }) type: "radio" | "icon" | "checkbox" | "switch" | string = "switch";
  @Prop({ reflect: true, mutable: true }) disabled: boolean;
  @Prop({ reflect: true, mutable: true }) checked: boolean;

  CSSClassList: CssClassList;

  @Watch('mods')
  modsWatcher(newMods) {
    this.CSSClassList = _ds.props.toClassList('ds-toggle', [..._ds.props.toArray(newMods), this.type]);
  }

  @Event() toggle: EventEmitter;

  @Method()
  async setChecked(checked: boolean) {
    this.checked = checked;
  }

  @Method()
  async setType(type: "radio" | "icon" | "checkbox" | "switch" | string) {
    if (typeof this.type === "undefined") {
      this.type = type;
    }
  }

  @Method()
  async setName(name: string) {
    if (typeof this.name === "undefined") {
      this.name = name;
    }
  }

  @Method()
  async setProps(properties: Record<string, unknown>) {
    Object.entries(properties).map( ([ key, value ]) => this[key] && value && (this[key] = value) )    
  }

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-toggle', [..._ds.props.toArray(this.mods), this.type]);
  }

  toggleClickHandler = () => {
    const { checked: previousChecked, value, name } = this;

    if (!this.disabled && !previousChecked) {
      const checked = !previousChecked;
      this.checked = checked;
      this.toggle.emit({ name, value, checked });
    }
  };

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
        }}
        onClick={this.toggleClickHandler}
      >
        <slot />
      </Host>
    );
  }
}
