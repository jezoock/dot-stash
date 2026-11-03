import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State } from '@stencil/core';
import { toArray, toClassList } from '../../utils/props';
import { DSToggleValue } from './toggle.types';

/** The properties `setProps()` can write. */
const DS_TOGGLE_PROPS = ['mods', 'value', 'name', 'type', 'disabled', 'checked'];

/** The role of each type (WAI-ARIA switch, checkbox and radio patterns); the other types are toggle buttons. */
const ROLES: Record<string, 'switch' | 'checkbox' | 'radio'> = { switch: 'switch', checkbox: 'checkbox', radio: 'radio' };

/**
 * A radio, checkbox, switch or icon toggle. A click checks a radio (it cannot be unchecked by a click)
 * and checks or unchecks the other types; each change emits `toggle` with `{ name, value, checked }`.
 * The element is the control: it has the role of its type (`switch`, `checkbox`, `radio`, `button` with
 * `aria-pressed` for an `icon`), its state (`aria-checked`), and takes the focus (`tabindex="0"`); Space
 * toggles it (checks a radio), Enter too for a switch or an icon. A disabled toggle is `aria-disabled` and
 * cannot be focused.
 *
 * @slot - The content of the toggle: the icon of an `icon` toggle, or a text that names the toggle (it can be visually hidden).
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
  /** A disabled toggle ignores clicks and keys, and cannot be focused (`aria-disabled="true"`, no `tabindex`). */
  @Prop({ reflect: true, mutable: true }) disabled: boolean;
  @Prop({ reflect: true, mutable: true }) checked: boolean;
  /**
   * The accessible name of the toggle (`aria-label`), for a toggle without a text in it. A visible label elsewhere
   * names it with `aria-labelledby` (its id) on the element instead.
   */
  @Prop() label: string;

  /** The type set by a parent with `setType()`, used when the toggle has no `type` of its own. */
  @State() parentType: string;
  /** Whether Tab reaches the toggle (`tabindex="0"`, else `-1`): set by a parent with `setTabbable()`. */
  @State() isTabbable = true;

  @Event() toggle: EventEmitter;

  /** The type the toggle renders (`--<type>` class) and behaves as: its own `type`, else its parent's, else `switch`. */
  get effectiveType(): string {
    return this.type || this.parentType || 'switch';
  }

  /** The role of the toggle: that of its type, `button` (a toggle button, `aria-pressed`) for `icon` and the other types. */
  get effectiveRole(): 'switch' | 'checkbox' | 'radio' | 'button' {
    return ROLES[this.effectiveType] ?? 'button';
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

  /**
   * Sets whether Tab reaches the toggle, for a parent that moves the focus between its toggles (the arrow keys of a
   * `ds-toggle-group` of radios): `false` renders `tabindex="-1"`, `true` or `undefined` `tabindex="0"`, the default.
   */
  @Method()
  async setTabbable(isTabbable?: boolean) {
    this.isTabbable = isTabbable !== false;
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

  /**
   * Space toggles the toggle (checks a radio), as a click does (a click event, which the page can listen to); Enter too,
   * for a switch or a toggle button, not for a checkbox or a radio (as the native inputs). The keys held down do not repeat.
   */
  keyDownHandler = (event: KeyboardEvent) => {
    if (event.target !== this.hostContainer || this.disabled || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const role = this.effectiveRole;
    const isSpace = event.key === ' ' || event.key === 'Spacebar';
    const isEnter = event.key === 'Enter' && (role === 'switch' || role === 'button');

    if (isSpace || isEnter) {
      // Space would scroll the page.
      event.preventDefault();
      if (!event.repeat) {
        this.hostContainer.click();
      }
    }
  };

  render() {
    const role = this.effectiveRole;
    const state = this.checked ? 'true' : 'false';

    return (
      <Host
        class={toClassList('ds-toggle', [...toArray(this.mods ?? []), this.effectiveType])}
        role={role}
        tabindex={this.disabled ? undefined : this.isTabbable ? '0' : '-1'}
        aria-checked={role === 'button' ? undefined : state}
        aria-pressed={role === 'button' ? state : undefined}
        aria-disabled={this.disabled ? 'true' : undefined}
        aria-label={this.label}
        onClick={this.toggleClickHandler}
        onKeyDown={this.keyDownHandler}
      >
        <slot />
      </Host>
    );
  }
}
