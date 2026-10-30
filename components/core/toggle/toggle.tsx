import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State } from '@stencil/core';
import { toArray, toClassList } from '../../utils/props';
import { DSToggleValue } from './toggle.types';

/** The properties `setProps()` can write. */
const DS_TOGGLE_PROPS = ['mods', 'value', 'name', 'type', 'disabled', 'checked'];

/**
 * A radio, checkbox, switch or icon toggle. A click checks a radio (it cannot be unchecked by a click)
 * and checks or unchecks the other types; each change emits `toggle` with `{ name, value, checked }`.
 */
@Component({
  tag: 'ds-toggle',
  styleUrl: 'toggle.scss',
})
export class DSToggle {
  @Element() hostContainer: HTMLDsToggleElement;

  // Mutable: setProps() writes it.
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  @Prop({ mutable: true, reflect: true }) value: DSToggleValue;
  @Prop({ mutable: true, reflect: true }) name: string;
  /**
   * `radio`, `checkbox`, `switch` or `icon`. Without it, the toggle uses the type its parent gives with `setType()`
   * (`ds-toggle-group`), else `switch`: its own type always wins.
   */
  @Prop({ mutable: true, reflect: true }) type?: 'radio' | 'icon' | 'checkbox' | 'switch' | string;
  @Prop({ reflect: true, mutable: true }) disabled: boolean;
  @Prop({ reflect: true, mutable: true }) checked: boolean;

  /** The type set by a parent with `setType()`, used when the toggle has no `type` of its own. */
  @State() parentType: string;

  @Event() toggle: EventEmitter;

  /** The type the toggle renders (`--<type>` class) and behaves as: its own `type`, else its parent's, else `switch`. */
  get effectiveType(): string {
    return this.type || this.parentType || 'switch';
  }

  @Method()
  async setChecked(checked: boolean) {
    this.checked = checked;
  }

  /**
   * Sets the type given by a parent (`ds-toggle-group` calls it): the toggle uses it while it has no `type` of
   * its own. `undefined` removes it.
   */
  @Method()
  async setType(type: 'radio' | 'icon' | 'checkbox' | 'switch' | string) {
    this.parentType = type;
  }

  @Method()
  async setName(name: string) {
    if (typeof this.name === 'undefined') {
      this.name = name;
    }
  }

  /** Sets the given props (`mods`, `value`, `name`, `type`, `disabled`, `checked`); `undefined` values and other keys are ignored. */
  @Method()
  async setProps(properties: Record<string, unknown>) {
    Object.entries(properties).forEach(([key, value]) => {
      if (DS_TOGGLE_PROPS.includes(key) && value !== undefined) {
        this[key] = value;
      }
    });
  }

  toggleClickHandler = () => {
    const { checked: previousChecked, value, name } = this;

    // A radio is only checked by a click; the other types toggle.
    if (this.disabled || (this.effectiveType === 'radio' && previousChecked)) {
      return;
    }

    const checked = !previousChecked;
    this.checked = checked;
    this.toggle.emit({ name, value, checked });
  };

  render() {
    return (
      <Host class={toClassList('ds-toggle', [...toArray(this.mods ?? []), this.effectiveType])} onClick={this.toggleClickHandler}>
        <slot />
      </Host>
    );
  }
}
