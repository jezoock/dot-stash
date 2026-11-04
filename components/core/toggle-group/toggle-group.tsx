import { AttachInternals, Component, Element, Event, EventEmitter, forceUpdate, h, Host, Listen, Method, Prop, State, Watch } from '@stencil/core';
import { fromJSON, toArray, toClassList } from '../../utils/props';
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
import { DSToggleValue } from '../toggle/toggle.types';

/** The custom state of a group whose invalid state the user should see (`:state(user-invalid)`). */
const USER_INVALID_STATE = 'user-invalid';

/** A value of the group as a string, for the state the browser restores: `on` for a toggle without a value, as it submits. */
const toStateValue = (value: DSToggleValue | undefined): string => String(value ?? 'on');

/**
 * Groups `ds-toggle` elements and keeps their selected values (emitted with `toggleValueChange`).
 * The group's `name` and `mods`, when set, replace those of its toggles, and its `type` applies to the toggles
 * without a type of their own; changes after the load are passed on too, and removing the group's `name` or `mods`
 * gives the toggles back the ones they had when they joined. Toggles added later join the group (with
 * MutationObserver, in browsers).
 * The element is a `radiogroup` when its toggles are radios with a single selection (`count` max 1), else a `group`.
 * In a radio group, Tab reaches one radio (the checked one, else the first), and the arrow keys, Home and End move the
 * focus and the selection between the enabled radios.
 * It is form-associated: each of its toggles submits its own value (under the group's `name`), as native radios or
 * checkboxes that share a name, and the group submits nothing; it validates the choice (`required`), a `<label>` names
 * it, and a disabled fieldset disables it with its toggles.
 *
 * @slot - The `ds-toggle` elements, and the text around them.
 */
@Component({
  tag: 'ds-toggle-group',
  formAssociated: true,
})
export class DSToggleGroup {
  @Element() host: HTMLDsToggleGroupElement;

  @AttachInternals({
    states: {
      /** The group is invalid (`required`, no toggle checked) and the user should see it: after an `invalid` event or a change by the user, until a form reset. */
      'user-invalid': false,
    },
  })
  internals: ElementInternals;

  /** The name of its toggles, which submit their values under it with their form (it replaces their own). */
  @Prop({ reflect: true }) name: string;
  /** The type of its toggles that have none of their own (`radio`, `checkbox`, `switch`, `icon`). */
  @Prop({ reflect: true }) type: string;
  /**
   * Disables the group and all its toggles (`aria-disabled` on the group, and on each toggle, which leaves the toggles'
   * own `disabled` as it is). A disabled `<fieldset>` around it does the same.
   */
  @Prop({ reflect: true }) disabled: boolean;
  /**
   * `[min, max]` number of selected values (JSON as an attribute: `count="[0, 3]"`).
   * `max` 1 is a single selection: checking a toggle unchecks the others. A click that would leave fewer
   * than `min` values, or select more than `max` (0 for no maximum), is undone. Default `[1, 1]`: exactly one value.
   */
  @Prop() count: number[] | string = [1, 1];
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /**
   * At least one toggle must be checked for the form to be submitted (`valueMissing`; `aria-required` on a radio group).
   * A radio of the group with `required` makes it required too, as a native radio.
   */
  @Prop({ reflect: true }) required: boolean;
  /** The message of a required group without a checked toggle, instead of the browser's own (`validationMessage`). */
  @Prop() requiredMessage: string;
  /**
   * The accessible name of the group (`aria-label`). A visible label (a heading, a text) names it with
   * `aria-labelledby` (its id) on the element, or a `<label>` element (`<label for="<id of the group>">`) instead.
   */
  @Prop() label: string;

  /** The validity of the group, as the `validity` of a native control (read-only; once the component is loaded). */
  @Prop() get validity(): ValidityState {
    this.updateFormState();
    return getValidity(this.internals);
  }

  /** The message of an invalid group, as the `validationMessage` of a native control (read-only): `required-message`, else the browser's own. */
  @Prop() get validationMessage(): string {
    this.updateFormState();
    return getValidationMessage(this.internals);
  }

  /** Whether the form validates the group (read-only): not while it is disabled. */
  @Prop() get willValidate(): boolean {
    return getWillValidate(this.internals);
  }

  @State() value: DSToggleValue[] = [];
  /** Disabled by its form: a disabled `<fieldset>` around it, or its own `disabled` attribute (`formDisabledCallback`). */
  @State() formDisabled = false;
  /** Whether the validity is shown (`aria-invalid`, `--invalid`): after an `invalid` event or a change by the user, until a form reset. */
  @State() isValidityShown = false;

  values: DSToggleValue[] = [];

  @Event() toggleValueChange: EventEmitter;

  @Listen('toggle')
  onToggle({ target: toggle, detail: { value: toggleValue, checked: isChecked } }) {
    this.toggleHandler(toggle, isChecked, toggleValue);
  }

  valuesCount: number[] = [1, 1];
  /** The registered toggles, with the name and mods they had when they joined, put back when the group's are removed. */
  ownProps = new WeakMap<HTMLDsToggleElement, { name: string; mods: string | string[] }>();
  hasLoaded = false;
  /** Registers the toggles added to the group later, and follows the checked state of the toggles (when the browser has MutationObserver). */
  observer: MutationObserver;

  /** Disabled by its own prop or its form. */
  get isDisabled(): boolean {
    return !!(this.disabled || this.formDisabled);
  }

  @Watch('count')
  countWatcher() {
    this.valuesCount = fromJSON(this.count);
  }

  @Watch('disabled')
  @Watch('formDisabled')
  disabledWatcher() {
    this.getToggles().forEach(toggle => this.applyGroupDisabled(toggle));
    this.updateFormState();
  }

  @Watch('name')
  @Watch('type')
  @Watch('mods')
  groupPropsWatcher() {
    this.getToggles().forEach(toggle => this.applyGroupProps(toggle));
  }

  @Watch('value')
  @Watch('required')
  @Watch('requiredMessage')
  @Watch('isValidityShown')
  formStateWatcher() {
    this.updateFormState();
  }

  constructor() {
    this.toggleHandler = this.toggleHandler.bind(this);
  }

  componentWillLoad() {
    this.valuesCount = fromJSON(this.count);
  }

  /** Whether the group is valid; an invalid group gets an `invalid` event (as the `checkValidity()` of a native control, but asynchronous). */
  @Method()
  async checkValidity(): Promise<boolean> {
    this.updateFormState();
    return checkValidity(this.internals);
  }

  /** As `checkValidity()`, and the browser shows the message of an invalid group at its first enabled toggle (the checked radio of a radio group), which takes the focus. */
  @Method()
  async reportValidity(): Promise<boolean> {
    this.updateFormState();
    return reportValidity(this.internals);
  }

  /** Updates the value after a toggle was checked or unchecked; a click that breaks the `count` limits is undone. */
  toggleHandler(toggle: HTMLDsToggleElement, isChecked: boolean, toggleValue: DSToggleValue) {
    const { value: currentValue } = this;
    const [min = 0, max = 0] = this.valuesCount ?? [];
    const maxCount = max > 0 ? max : Infinity;
    const isSelected = currentValue.includes(toggleValue);
    let newValue = currentValue;

    // Changed by the user: the validity of the group shows (as :user-invalid).
    this.isValidityShown = true;

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

  /**
   * Takes the value from the checked toggles after a change that is not a click: a form reset, a state the browser
   * restores, a script. The values still checked keep their order, the others follow in the order of the toggles; no
   * `toggleValueChange` (as no `change` event for a native control).
   */
  syncValue() {
    const checkedValues = this.getToggles()
      .filter(toggle => toggle.checked)
      .map(toggle => toggle.value);
    const keptValues = this.value.filter(value => checkedValues.includes(value));
    const newValue = [...keptValues, ...checkedValues.filter(value => !keptValues.includes(value))];

    if (newValue.length !== this.value.length || newValue.some((value, index) => value !== this.value[index])) {
      this.value = newValue;
    }
  }

  getToggles(): HTMLDsToggleElement[] {
    return Array.from(this.host.querySelectorAll('ds-toggle'));
  }

  /** Adds a toggle to the group, once: its checked value, and the group's props. */
  registerToggle(toggle: HTMLDsToggleElement) {
    if (this.ownProps.has(toggle)) {
      return;
    }

    const { checked: isChecked, value } = toggle;
    // The attributes for a toggle whose component is not defined yet.
    this.ownProps.set(toggle, { name: toggle.name ?? toggle.getAttribute('name') ?? undefined, mods: toggle.mods ?? toggle.getAttribute('mods') ?? undefined });

    if (isChecked && !this.value.includes(value)) {
      this.value = [...this.value, value];
    }
    this.values = [...this.values, value];

    this.applyGroupProps(toggle);
    if (this.isDisabled) {
      this.applyGroupDisabled(toggle);
    }
    // Added after the load: its type can make the group a radio group, and its tabindex depends on the group.
    if (this.hasLoaded) {
      forceUpdate(this);
    }
  }

  /** Disables the toggle while the group is disabled, without changing its own `disabled` (`setGroupDisabled()`). */
  applyGroupDisabled(toggle: HTMLDsToggleElement) {
    toggle.setGroupDisabled?.(this.isDisabled);
  }

  /** The type of a toggle: its own, else the group's, else `switch`. */
  getToggleType(toggle: HTMLDsToggleElement): string {
    return toggle.type || toggle.getAttribute('type') || this.type || 'switch';
  }

  /**
   * Whether the group is a radio group: it has toggles, they are all radios (their own type or the group's), and
   * the selection is single (`count` max 1).
   */
  isRadioGroup(): boolean {
    const toggles = this.getToggles();
    const [, max = 0] = this.valuesCount ?? [];

    return max === 1 && toggles.length > 0 && toggles.every(toggle => this.getToggleType(toggle) === 'radio');
  }

  /** The toggles the arrow keys move between: those of the group that are not disabled (none while the group is). */
  getEnabledToggles(): HTMLDsToggleElement[] {
    return this.isDisabled ? [] : this.getToggles().filter(toggle => !(toggle.disabled ?? toggle.hasAttribute('disabled')));
  }

  /** The radio Tab reaches in a radio group: the checked one (of the value first: just after a selection, the radio that was checked may not be unchecked yet), else the first enabled one. */
  getTabbableRadio(enabled = this.getEnabledToggles()): HTMLDsToggleElement | undefined {
    return enabled.find(toggle => toggle.checked && this.value.includes(toggle.value)) ?? enabled.find(toggle => toggle.checked) ?? enabled[0];
  }

  /**
   * The Tab order of the toggles: in a radio group, only the checked radio (else the first one) is reached by Tab,
   * the arrow keys move between them (roving tabindex); otherwise, every toggle is.
   */
  updateTabOrder() {
    const isRadioGroup = this.isRadioGroup();
    const tabbable = isRadioGroup ? this.getTabbableRadio() : undefined;

    this.getToggles().forEach(toggle => toggle.setTabbable?.(!isRadioGroup || toggle === tabbable));
  }

  //#region FORM

  /** Required: its own `required`, or a radio of the group that has `required`. */
  get isRequired(): boolean {
    return !!this.required || this.getToggles().some(toggle => (toggle.required ?? toggle.hasAttribute('required')) && this.getToggleType(toggle) === 'radio');
  }

  /** Required, enabled, and no toggle checked. */
  get isValueMissing(): boolean {
    return this.isRequired && !this.isDisabled && !this.getToggles().some(toggle => toggle.checked);
  }

  /**
   * The validity (the message at the radio Tab reaches, else at the first enabled toggle) and the custom state. The group
   * submits nothing (its toggles do); its state, which the browser restores, is its value: the toggles named by the group
   * have no name yet when the browser restores the form, it gives their state back to the group.
   */
  updateFormState() {
    const isMissing = this.isValueMissing;
    const anchor = this.isRadioGroup() ? this.getTabbableRadio() : this.getEnabledToggles()[0];

    setFormValue(this.internals, null, JSON.stringify(this.value.map(toStateValue)));
    setValueMissing(this.internals, this.host, isMissing, this.requiredMessage || getValueMissingMessage('radio'), anchor);
    setCustomState(this.internals, USER_INVALID_STATE, this.isValidityShown && isMissing);
  }

  /** A form reset: the toggles take back their checked state (the observer then updates the value), the validity is no longer shown. */
  formResetCallback() {
    this.isValidityShown = false;
  }

  /** The browser gives back the value of the group (history navigation): its toggles are checked again, without `toggle` nor `toggleValueChange`. */
  formStateRestoreCallback(state: unknown) {
    let values: unknown;
    try {
      values = typeof state === 'string' ? JSON.parse(state) : undefined;
    } catch {
      return;
    }
    if (!Array.isArray(values)) {
      return;
    }
    const restored = values.map(String);

    this.getToggles().forEach(toggle => {
      const isChecked = restored.includes(toStateValue(toggle.value));
      if (!!toggle.checked !== isChecked) {
        toggle.checked = isChecked;
      }
    });
    this.syncValue();
  }

  /** A disabled `<fieldset>` around the group, or its own `disabled` attribute. */
  formDisabledCallback(isDisabled: boolean) {
    this.formDisabled = isDisabled;
  }

  /** `checkValidity()` or `reportValidity()` of the group or of its form, or a submission, found it invalid: it shows it. */
  @Listen('invalid')
  invalidHandler({ target }: { target: EventTarget | null }) {
    if (target === this.host) {
      this.isValidityShown = true;
    }
  }

  /**
   * A click on the group itself, not on a toggle: its `<label>` was clicked (or the text of the group). The focus moves
   * to the radio Tab reaches, or to the first enabled toggle, without changing the selection.
   */
  hostClickHandler = (event: MouseEvent) => {
    if (event.target !== this.host) {
      return;
    }
    const toggle = this.isRadioGroup() ? this.getTabbableRadio() : this.getEnabledToggles()[0];
    toggle?.focus();
  };

  //#endregion

  /**
   * The arrow keys of a radio group (WAI-ARIA radio group pattern): Down and Right move the focus to the next enabled
   * radio and check it, Up and Left to the previous one, round the group; Home and End to the first and the last one.
   */
  keyDownHandler = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !this.isRadioGroup()) {
      return;
    }

    const radios = this.getEnabledToggles();
    const current = radios.indexOf((event.target as Element).closest?.('ds-toggle') as HTMLDsToggleElement);
    const last = radios.length - 1;
    const nextIndex = { ArrowDown: current + 1, ArrowRight: current + 1, ArrowUp: current - 1, ArrowLeft: current - 1, Home: 0, End: last }[event.key];

    if (current < 0 || nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const next = radios[nextIndex > last ? 0 : nextIndex < 0 ? last : nextIndex];
    next.focus();
    if (!next.checked) {
      next.click();
    }
  };

  /**
   * Only what the group defines: its name and mods replace the toggle's, otherwise the toggle has its own back.
   * Its type only applies to a toggle without a type of its own (setType).
   */
  applyGroupProps(toggle: HTMLDsToggleElement) {
    const own = this.ownProps.get(toggle) ?? { name: undefined, mods: undefined };
    // null rather than undefined for no name: the reflected attribute is then removed without setting the prop again.
    const name = this.name ?? own.name ?? null;
    const mods = toArray(this.mods ?? []).length ? this.mods : (own.mods ?? []);

    toggle.setType(this.type);
    // Only written when they change: a toggle keeps its own values untouched while the group has none.
    if ((toggle.name ?? null) !== name) {
      toggle.name = name;
    }
    if (toArray(toggle.mods ?? []).join() !== toArray(mods).join()) {
      toggle.mods = mods;
    }
  }

  getContextValue() {
    return this.value;
  }

  connectedCallback() {
    this.getToggles().forEach(toggle => this.registerToggle(toggle));

    if (typeof MutationObserver !== 'undefined' && !this.observer) {
      this.observer = new MutationObserver(records => this.mutationHandler(records));
      this.observer.observe(this.host, { childList: true, subtree: true, attributes: true, attributeFilter: ['checked'] });
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  /** Registers the toggles added to the group, and those inside added elements; follows a toggle checked or unchecked otherwise than by a click. */
  mutationHandler(records: MutationRecord[]) {
    this.addedNodesHandler(records.filter(({ type }) => type !== 'attributes'));
    if (records.some(({ type, target }) => type === 'attributes' && (target as Element).matches?.('ds-toggle'))) {
      this.syncValue();
    }
  }

  /** Registers the toggles added to the group, and those inside added elements. */
  addedNodesHandler(records: MutationRecord[]) {
    records.forEach(({ addedNodes }) =>
      Array.from(addedNodes ?? [])
        .filter((node): node is Element => node.nodeType === 1)
        .forEach(element => {
          const toggles = element.matches('ds-toggle') ? [element] : Array.from(element.querySelectorAll('ds-toggle'));
          toggles.forEach((toggle: HTMLDsToggleElement) => this.registerToggle(toggle));
        }),
    );
  }

  componentDidLoad() {
    this.hasLoaded = true;
  }

  componentWillRender() {
    this.updateFormState();
  }

  componentDidRender() {
    this.updateTabOrder();
  }

  render() {
    const isRadioGroup = this.isRadioGroup();
    const isDisabled = this.isDisabled;
    const isMissing = this.isValueMissing;
    const isInvalidShown = this.isValidityShown && isMissing;

    return (
      <Host
        class={{ ...toClassList('ds-toggle-group', this.mods), '--disabled': isDisabled, '--invalid': isInvalidShown }}
        role={isRadioGroup ? 'radiogroup' : 'group'}
        aria-label={this.label}
        aria-disabled={isDisabled ? 'true' : undefined}
        // aria-required belongs to the radiogroup role (not to group).
        aria-required={isRadioGroup && this.isRequired && !isDisabled ? 'true' : undefined}
        // Invalid but not shown yet: "false", as the browser would tell assistive technologies it is invalid from the start.
        aria-invalid={isInvalidShown ? 'true' : isMissing ? 'false' : undefined}
        onKeyDown={this.keyDownHandler}
        onClick={this.hostClickHandler}
      >
        <slot />
      </Host>
    );
  }
}
