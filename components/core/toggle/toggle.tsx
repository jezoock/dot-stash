import { AttachInternals, Component, Element, Event, EventEmitter, h, Host, Listen, Method, Prop, State, Watch } from '@stencil/core';
import { toArray, toClassList } from '../../utils/props';
import {
  checkValidity,
  getValidationMessage,
  getValidity,
  getValueMissingMessage,
  getWillValidate,
  reportValidity,
  setCustomState,
  setFormValue,
  setValueMissing,
} from '../../utils/form-control';
import { DSToggleValue } from './toggle.types';

/** The properties `setProps()` can write. */
const DS_TOGGLE_PROPS = ['mods', 'value', 'name', 'type', 'disabled', 'checked'];

/** The role of each type (WAI-ARIA switch, checkbox and radio patterns); the other types are toggle buttons. */
const ROLES: Record<string, 'switch' | 'checkbox' | 'radio'> = { switch: 'switch', checkbox: 'checkbox', radio: 'radio' };

/** The custom state of a toggle whose invalid state the user should see (`:state(user-invalid)`). */
const USER_INVALID_STATE = 'user-invalid';

/**
 * A radio, checkbox, switch or icon toggle. A click checks a radio (it cannot be unchecked by a click)
 * and checks or unchecks the other types; each change emits `toggle` with `{ name, value, checked }`.
 * The element is the control: it has the role of its type (`switch`, `checkbox`, `radio`, `button` with
 * `aria-pressed` for an `icon`), its state (`aria-checked`), and takes the focus (`tabindex="0"`); Space
 * toggles it (checks a radio), Enter too for a switch or an icon. A disabled toggle is `aria-disabled` and
 * cannot be focused.
 * It is form-associated, as a native checkbox or radio: checked, it submits its `value` (`on` by default) under its
 * `name` with its form; a `<label>` names it and a click on the label toggles it; a disabled fieldset disables it; a
 * form reset gives it back its checked state of the load; `required` makes it invalid while it is not checked.
 *
 * @slot - The content of the toggle: the icon of an `icon` toggle, or a text that names the toggle (it can be visually hidden).
 */
@Component({
  tag: 'ds-toggle',
  styleUrl: 'toggle.scss',
  formAssociated: true,
})
export class DSToggle {
  @Element() hostContainer: HTMLDsToggleElement;

  @AttachInternals({
    states: {
      /** The toggle is invalid (`required` and not checked) and the user should see it: after an `invalid` event or a change by the user, until a form reset. */
      'user-invalid': false,
    },
  })
  internals: ElementInternals;

  // Mutable: setProps() writes it.
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];
  /** The value the toggle submits with its form while it is checked: `on` without one (as a native checkbox). Also sent in the `toggle` event. */
  @Prop({ mutable: true, reflect: true }) value: DSToggleValue;
  /** The name of the value in the form data (a toggle without a name submits nothing). A `ds-toggle-group` with a `name` gives it its own. */
  @Prop({ mutable: true, reflect: true }) name: string;
  /**
   * `radio`, `checkbox`, `switch` or `icon`. Without it, the toggle uses the type its parent gives with `setType()`
   * (`ds-toggle-group`), else `switch`: its own type always wins.
   */
  @Prop({ mutable: true, reflect: true }) type?: 'radio' | 'icon' | 'checkbox' | 'switch' | string;
  /**
   * A disabled toggle ignores clicks and keys, cannot be focused (`aria-disabled="true"`, no `tabindex`) and submits
   * nothing. A disabled `<fieldset>` or `ds-toggle-group` disables it too, without changing this prop.
   */
  @Prop({ reflect: true, mutable: true }) disabled: boolean;
  /**
   * Whether the toggle is checked (pressed, for an `icon` toggle). Its value at the load is the default one, which a
   * form reset gives back.
   */
  @Prop({ reflect: true, mutable: true }) checked: boolean;
  /**
   * The toggle must be checked for its form to be submitted (`valueMissing`, `aria-required` on a checkbox or a switch).
   * A radio of a `ds-toggle-group` makes its group required instead.
   */
  @Prop({ reflect: true }) required: boolean;
  /** The message of a required toggle left unchecked, instead of the browser's own (`validationMessage`). */
  @Prop() requiredMessage: string;
  /**
   * The accessible name of the toggle (`aria-label`), for a toggle without a text in it. A visible label elsewhere
   * names it with a `<label>` element (`<label for="<id>">`, or around it) or with `aria-labelledby` (its id) on the
   * element instead.
   */
  @Prop() label: string;

  /** The validity of the toggle, as the `validity` of a native control (read-only; once the component is loaded). */
  @Prop() get validity(): ValidityState {
    return getValidity(this.internals);
  }

  /** The message of an invalid toggle, as the `validationMessage` of a native control (read-only): `required-message`, else the browser's own. */
  @Prop() get validationMessage(): string {
    return getValidationMessage(this.internals);
  }

  /** Whether the form validates the toggle (read-only), as the browser tells it: not while its `disabled` or a disabled fieldset disables it (a toggle its group disables is valid). */
  @Prop() get willValidate(): boolean {
    return getWillValidate(this.internals);
  }

  /** The type set by a parent with `setType()`, used when the toggle has no `type` of its own. */
  @State() parentType: string;
  /** Whether Tab reaches the toggle (`tabindex="0"`, else `-1`): set by a parent with `setTabbable()`. */
  @State() isTabbable = true;
  /** Disabled by its `ds-toggle-group` (`setGroupDisabled()`). */
  @State() groupDisabled = false;
  /** Disabled by its form: a disabled `<fieldset>` around it, or its own `disabled` attribute (`formDisabledCallback`). */
  @State() formDisabled = false;
  /** Whether the validity is shown (`aria-invalid`, `--invalid`): after an `invalid` event or a change by the user, until a form reset. */
  @State() isValidityShown = false;

  /** The checked state of the load, which a form reset gives back (as the `defaultChecked` of a native checkbox). */
  private defaultChecked = false;

  @Event() toggle: EventEmitter;

  /** The type the toggle renders (`--<type>` class) and behaves as: its own `type`, else its parent's, else `switch`. */
  get effectiveType(): string {
    return this.type || this.parentType || 'switch';
  }

  /** The role of the toggle: that of its type, `button` (a toggle button, `aria-pressed`) for `icon` and the other types. */
  get effectiveRole(): 'switch' | 'checkbox' | 'radio' | 'button' {
    return ROLES[this.effectiveType] ?? 'button';
  }

  /** Disabled by its own prop, its group or its form. */
  get isDisabled(): boolean {
    return !!(this.disabled || this.groupDisabled || this.formDisabled);
  }

  /** A radio of a `ds-toggle-group`: the group validates the choice, as a native radio group. */
  get isGroupRadio(): boolean {
    return this.effectiveType === 'radio' && !!this.hostContainer.closest('ds-toggle-group');
  }

  /** Required, enabled and not checked. */
  get isValueMissing(): boolean {
    return !!this.required && !this.checked && !this.isDisabled && !this.isGroupRadio;
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

  /**
   * Disables the toggle while its parent is disabled (`ds-toggle-group` calls it), without changing its own `disabled`:
   * `true` disables it, `false` or `undefined` gives it its own state back.
   */
  @Method()
  async setGroupDisabled(isDisabled?: boolean) {
    this.groupDisabled = isDisabled === true;
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

  /** Whether the toggle is valid; an invalid toggle gets an `invalid` event (as the `checkValidity()` of a native control, but asynchronous). */
  @Method()
  async checkValidity(): Promise<boolean> {
    this.updateFormState();
    return checkValidity(this.internals);
  }

  /** As `checkValidity()`, and the browser shows the message of an invalid toggle, which takes the focus. */
  @Method()
  async reportValidity(): Promise<boolean> {
    this.updateFormState();
    return reportValidity(this.internals);
  }

  //#region FORM

  componentWillLoad() {
    this.defaultChecked = !!this.checked;
    this.updateFormState();
  }

  componentWillRender() {
    this.updateFormState();
  }

  @Watch('checked')
  @Watch('value')
  @Watch('required')
  @Watch('requiredMessage')
  @Watch('disabled')
  @Watch('type')
  @Watch('parentType')
  @Watch('groupDisabled')
  @Watch('formDisabled')
  @Watch('isValidityShown')
  formStateWatcher() {
    this.updateFormState();
  }

  /**
   * The form value (the value while checked and enabled, else none; the state the browser restores), the validity and
   * the custom state.
   */
  updateFormState() {
    const isMissing = this.isValueMissing;
    const messageKind = this.effectiveType === 'radio' ? 'radio' : 'checkbox';

    setFormValue(this.internals, this.checked && !this.isDisabled ? String(this.value ?? 'on') : null, this.checked ? 'checked' : 'unchecked');
    setValueMissing(this.internals, this.hostContainer, isMissing, this.requiredMessage || getValueMissingMessage(messageKind), this.hostContainer);
    setCustomState(this.internals, USER_INVALID_STATE, this.isValidityShown && isMissing);
  }

  /** A form reset: the checked state of the load, and the validity no longer shown. */
  formResetCallback() {
    this.checked = this.defaultChecked;
    this.isValidityShown = false;
  }

  /** The browser gives back the state of the toggle (history navigation). */
  formStateRestoreCallback(state: unknown) {
    if (state === 'checked' || state === 'unchecked') {
      this.checked = state === 'checked';
    }
  }

  /** A disabled `<fieldset>` around the toggle, or its own `disabled` attribute. */
  formDisabledCallback(isDisabled: boolean) {
    this.formDisabled = isDisabled;
  }

  /** `checkValidity()` or `reportValidity()` of the toggle or of its form, or a submission, found it invalid: it shows it. */
  @Listen('invalid')
  invalidHandler({ target }: { target: EventTarget | null }) {
    if (target === this.hostContainer) {
      this.isValidityShown = true;
    }
  }

  //#endregion

  toggleClickHandler = () => {
    const { checked: previousChecked, value, name } = this;

    // A radio is only checked by a click; the other types toggle.
    if (this.isDisabled || (this.effectiveType === 'radio' && previousChecked)) {
      return;
    }

    const checked = !previousChecked;
    this.checked = checked;
    // Changed by the user: its validity shows (as :user-invalid).
    this.isValidityShown = true;
    this.toggle.emit({ name, value, checked });
  };

  /**
   * Space toggles the toggle (checks a radio), as a click does (a click event, which the page can listen to); Enter too,
   * for a switch or a toggle button, not for a checkbox or a radio (as the native inputs). The keys held down do not repeat.
   */
  keyDownHandler = (event: KeyboardEvent) => {
    if (event.target !== this.hostContainer || this.isDisabled || event.altKey || event.ctrlKey || event.metaKey) {
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
    const isDisabled = this.isDisabled;
    const isMissing = this.isValueMissing;
    const isInvalidShown = this.isValidityShown && isMissing;
    // aria-required belongs to the checkbox and switch roles (a radio group carries it for its radios).
    const isRequired = !!this.required && !isDisabled && (role === 'checkbox' || role === 'switch');

    return (
      <Host
        class={{
          ...toClassList('ds-toggle', [...toArray(this.mods ?? []), this.effectiveType]),
          '--disabled': isDisabled,
          '--invalid': isInvalidShown,
        }}
        role={role}
        tabindex={isDisabled ? undefined : this.isTabbable ? '0' : '-1'}
        aria-checked={role === 'button' ? undefined : state}
        aria-pressed={role === 'button' ? state : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        aria-required={isRequired ? 'true' : undefined}
        // Invalid but not shown yet: "false", as the browser would tell assistive technologies it is invalid from the start.
        aria-invalid={isInvalidShown ? 'true' : isMissing ? 'false' : undefined}
        aria-label={this.label}
        onClick={this.toggleClickHandler}
        onKeyDown={this.keyDownHandler}
      >
        <slot />
      </Host>
    );
  }
}
