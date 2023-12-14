import { Component, Event, EventEmitter, h, Method, Prop, Watch } from '@stencil/core';
import _ds from '../../../typescript/dot-stash';
import CssClassList from '../../types/css-class-list.interface';

@Component({
  tag: 'ds-toggle',
  styleUrl: 'toggle.scss',
})
export class DSToggle {
  @Prop() mods: string | string[] = [];
  @Prop() value: any;
  @Prop({ reflect: true }) name: string;
  @Prop({ reflect: true }) type: string;
  @Prop({ reflect: true, mutable: true }) disabled: boolean;
  @Prop({ reflect: true, mutable: true }) checked: boolean;

  CSSClassList: CssClassList;
  @Prop({ mutable: true }) group: any;

  @Method()
  async bindToGroup(groupContext) {
    this.group = groupContext;
    await this.group.registerToggle(this.checked, this.value);
  }

  @Watch('mods')
  dsModsWatcher(newMods) {
    this.CSSClassList = _ds.props.toClassList('ds-toggle', newMods);
  }

  @Watch('group')
  groupWatcher(newGroup) {
    console.log(newGroup);
  }

  @Event() toggle: EventEmitter;

  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-toggle', [..._ds.props.toArray(this.mods), this.type]);
  }

  componentWillRender() {
    console.log(this.group?.getValue());
  }

  toggleClickHandler = () => {
    if (!this.disabled) {
      this.group.toggleHandler(!this.checked);
      this.checked = !this.checked;
      this.toggle.emit({ value: this.value, checked: this.checked });
    }
  };

  setChecked = (checked: boolean) => {
    this.checked = checked;
  };

  render() {
    return (
      <div
        class={{
          ...this.CSSClassList,
        }}
        onClick={this.toggleClickHandler}
      >
        <slot />
      </div>
    );
  }
}
