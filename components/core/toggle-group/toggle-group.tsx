import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import CssClassList from '../../types/css-class-list.interface';
import _ds from '../../../typescript/dot-stash';

@Component({
  tag: 'ds-toggle-group',
})
export class DSToggleGroup {
  @Element() host: HTMLDsToggleGroupElement;
  
  @Prop({ reflect: true }) name: string;
  @Prop({ reflect: true }) type: string;
  @Prop({ reflect: true }) disabled: boolean;
  @Prop() count: number[] | string = [1, 1];
  @Prop() mods: string | string[] = [];

  @State() value: any[] = [];

  CSSClassList: CssClassList;
  values: any[] = [];

  @Watch('mods')
  modsWatcher(newMods) {
    this.CSSClassList = _ds.props.toClassList('ds-toggle-group', _ds.props.toArray(newMods));
  }

  @Event() toggleValueChange: EventEmitter;

  @Listen('toggle')
  onToggle({ target: toggle, detail: { value: toggleValue, checked: isChecked } }) {
    this.toggleHandler(toggle, isChecked, toggleValue);
  }

  valuesCount: number[] = [1, 1];

  constructor() {
    this.toggleHandler = this.toggleHandler.bind(this);
  }
  
  componentWillLoad() {
    this.CSSClassList = _ds.props.toClassList('ds-toggle-group', _ds.props.toArray(this.mods));
    this.valuesCount = _ds.props.fromJSON(this.count);
    /* console.log(this.valuesCount) */
  }

  toggleHandler(toggle, isChecked: boolean, toggleValue) {
    const {
      value: currentValue,
      valuesCount: [min],
    } = this;
    let newValue;

    console.log(isChecked, toggleValue, currentValue);

    if (min === 1) {
      if (isChecked && !currentValue.includes(toggleValue)) {
        newValue = [toggleValue];
      }

      this.host.querySelectorAll('ds-toggle[checked]').forEach(toggle => {
        (toggle as HTMLDsToggleElement).setChecked(false);
      });
      toggle.setChecked(true);
    } else {
      if (isChecked && !currentValue.includes(toggleValue)) {
        newValue = [...currentValue, toggleValue];
      } else {
        newValue = currentValue.filter(value => value !== toggleValue);
      }
    }
    
    this.value = newValue;

    this.toggleValueChange.emit({ value: newValue });
  };

  async registerToggle(toggle: HTMLDsToggleElement) {
    const { checked: isChecked, value } = toggle;
    const { value: groupValue, values, type, mods, name } = this;

    if (isChecked) {
      groupValue.push(value);
      this.value = groupValue;
    }
    values.push(value);

    this.values = values;

    toggle.setProps({ name, mods, type });
  };

  getContextValue() {
    return this.value;
  }

  connectedCallback() {
    Array.from(this.host.querySelectorAll('ds-toggle')).map( (toggle: HTMLDsToggleElement) => this.registerToggle(toggle) );
  }

  componentDidLoad() {
  }

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
        }}
      >
        <slot />
      </Host>
    );
  }
}