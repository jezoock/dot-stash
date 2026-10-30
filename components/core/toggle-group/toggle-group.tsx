import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import CssClassList from '../../utils/interfaces/css-class-list';
import { fromJSON, toArray, toClassList } from '../../utils/props';
import { DSToggleValue } from '../toggle/toggle.types';

/**
 * Groups `ds-toggle` elements and keeps their selected values (emitted with `toggleValueChange`).
 */
@Component({
  tag: 'ds-toggle-group',
})
export class DSToggleGroup {
  @Element() host: HTMLDsToggleGroupElement;

  @Prop({ reflect: true }) name: string;
  @Prop({ reflect: true }) type: string;
  @Prop({ reflect: true }) disabled: boolean;
  /**
   * `[min, max]` number of selected values (JSON as an attribute: `count="[0, 3]"`).
   * `max` 1 is a single selection: checking a toggle unchecks the others. A click that would leave fewer
   * than `min` values, or select more than `max` (0 for no maximum), is undone. Default `[1, 1]`: exactly one value.
   */
  @Prop() count: number[] | string = [1, 1];
  @Prop() mods: string | string[] = [];

  @State() value: DSToggleValue[] = [];

  CSSClassList: CssClassList;
  values: DSToggleValue[] = [];

  @Watch('mods')
  modsWatcher(newMods) {
    this.CSSClassList = toClassList('ds-toggle-group', toArray(newMods));
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
    this.CSSClassList = toClassList('ds-toggle-group', toArray(this.mods));
    this.valuesCount = fromJSON(this.count);
  }

  /** Updates the value after a toggle was checked or unchecked; a click that breaks the `count` limits is undone. */
  toggleHandler(toggle: HTMLDsToggleElement, isChecked: boolean, toggleValue: DSToggleValue) {
    const { value: currentValue } = this;
    const [min = 0, max = 0] = this.valuesCount ?? [];
    const maxCount = max > 0 ? max : Infinity;
    const isSelected = currentValue.includes(toggleValue);
    let newValue = currentValue;

    if (isChecked) {
      if (maxCount === 1) {
        newValue = [toggleValue];
        Array.from(this.host.querySelectorAll('ds-toggle'))
          .filter(otherToggle => otherToggle !== toggle && otherToggle.checked)
          .forEach(otherToggle => otherToggle.setChecked(false));
      } else if (!isSelected) {
        if (currentValue.length < maxCount) {
          newValue = [...currentValue, toggleValue];
        } else {
          toggle.setChecked(false);
        }
      }
    } else if (isSelected) {
      if (currentValue.length > min) {
        newValue = currentValue.filter(value => value !== toggleValue);
      } else {
        toggle.setChecked(true);
      }
    }

    const hasChanged = newValue.length !== currentValue.length || newValue.some((value, index) => value !== currentValue[index]);

    if (hasChanged) {
      this.value = newValue;
      this.toggleValueChange.emit({ value: newValue });
    }
  }

  async registerToggle(toggle: HTMLDsToggleElement) {
    const { checked: isChecked, value } = toggle;
    const { type, mods, name } = this;

    if (isChecked && !this.value.includes(value)) {
      this.value = [...this.value, value];
    }
    this.values = [...this.values, value];

    // Only what the group defines: otherwise the toggles keep their own props.
    toggle.setProps({ name, type, mods: toArray(mods ?? []).length ? mods : undefined });
  }

  getContextValue() {
    return this.value;
  }

  connectedCallback() {
    Array.from(this.host.querySelectorAll('ds-toggle')).map((toggle: HTMLDsToggleElement) => this.registerToggle(toggle));
  }

  componentDidLoad() {}

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
