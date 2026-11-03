import { Component, Element, Event, EventEmitter, forceUpdate, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { fromJSON, toArray, toClassList } from '../../utils/props';
import { DSToggleValue } from '../toggle/toggle.types';

/**
 * Groups `ds-toggle` elements and keeps their selected values (emitted with `toggleValueChange`).
 * The group's `name` and `mods`, when set, replace those of its toggles, and its `type` applies to the toggles
 * without a type of their own; changes after the load are passed on too, and removing the group's `name` or `mods`
 * gives the toggles back the ones they had when they joined. Toggles added later join the group (with
 * MutationObserver, in browsers).
 * The element is a `radiogroup` when its toggles are radios with a single selection (`count` max 1), else a `group`.
 * In a radio group, Tab reaches one radio (the checked one, else the first), and the arrow keys, Home and End move the
 * focus and the selection between the enabled radios.
 *
 * @slot - The `ds-toggle` elements, and the text around them.
 */
@Component({
  tag: 'ds-toggle-group',
})
export class DSToggleGroup {
  @Element() host: HTMLDsToggleGroupElement;

  @Prop({ reflect: true }) name: string;
  @Prop({ reflect: true }) type: string;
  /**
   * Disables all the toggles of the group (`disabled` on each, `aria-disabled` on the group). Enabled again, the
   * toggles get back the `disabled` they had when the group was disabled.
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
   * The accessible name of the group (`aria-label`). A visible label (a heading, a text) names it with
   * `aria-labelledby` (its id) on the element instead.
   */
  @Prop() label: string;

  @State() value: DSToggleValue[] = [];

  values: DSToggleValue[] = [];

  @Event() toggleValueChange: EventEmitter;

  @Listen('toggle')
  onToggle({ target: toggle, detail: { value: toggleValue, checked: isChecked } }) {
    this.toggleHandler(toggle, isChecked, toggleValue);
  }

  valuesCount: number[] = [1, 1];
  /** The registered toggles, with the name and mods they had when they joined, put back when the group's are removed. */
  ownProps = new WeakMap<HTMLDsToggleElement, { name: string; mods: string | string[] }>();
  /** The `disabled` of the toggles when the group was disabled, put back when it is enabled again. */
  ownDisabled = new WeakMap<HTMLDsToggleElement, boolean>();
  hasLoaded = false;
  /** Registers the toggles added to the group later (when the browser has MutationObserver). */
  observer: MutationObserver;

  @Watch('count')
  countWatcher() {
    this.valuesCount = fromJSON(this.count);
  }

  @Watch('disabled')
  disabledWatcher() {
    this.getToggles().forEach(toggle => this.applyGroupDisabled(toggle));
  }

  @Watch('name')
  @Watch('type')
  @Watch('mods')
  groupPropsWatcher() {
    this.getToggles().forEach(toggle => this.applyGroupProps(toggle));
  }

  constructor() {
    this.toggleHandler = this.toggleHandler.bind(this);
  }

  componentWillLoad() {
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
    if (this.disabled) {
      this.applyGroupDisabled(toggle);
    }
    // Added after the load: its type can make the group a radio group, and its tabindex depends on the group.
    if (this.hasLoaded) {
      forceUpdate(this);
    }
  }

  /** Disables the toggle while the group is disabled, keeping its own `disabled`, put back when the group is enabled. */
  applyGroupDisabled(toggle: HTMLDsToggleElement) {
    if (this.disabled) {
      if (!this.ownDisabled.has(toggle)) {
        this.ownDisabled.set(toggle, !!(toggle.disabled ?? toggle.hasAttribute('disabled')));
      }
      toggle.disabled = true;
    } else if (this.ownDisabled.has(toggle)) {
      toggle.disabled = this.ownDisabled.get(toggle);
      this.ownDisabled.delete(toggle);
    }
  }

  /**
   * Whether the group is a radio group: it has toggles, they are all radios (their own type or the group's), and
   * the selection is single (`count` max 1).
   */
  isRadioGroup(): boolean {
    const toggles = this.getToggles();
    const [, max = 0] = this.valuesCount ?? [];

    return max === 1 && toggles.length > 0 && toggles.every(toggle => (toggle.type || toggle.getAttribute('type') || this.type || 'switch') === 'radio');
  }

  /** The toggles the arrow keys move between: those of the group that are not disabled. */
  getEnabledToggles(): HTMLDsToggleElement[] {
    return this.getToggles().filter(toggle => !(toggle.disabled ?? toggle.hasAttribute('disabled')));
  }

  /**
   * The Tab order of the toggles: in a radio group, only the checked radio (else the first one) is reached by Tab,
   * the arrow keys move between them (roving tabindex); otherwise, every toggle is.
   */
  updateTabOrder() {
    const isRadioGroup = this.isRadioGroup();
    const enabled = this.getEnabledToggles();
    // The checked radio of the value first: just after a selection, the radio that was checked may not be unchecked yet.
    const tabbable = isRadioGroup
      ? (enabled.find(toggle => toggle.checked && this.value.includes(toggle.value)) ?? enabled.find(toggle => toggle.checked) ?? enabled[0])
      : undefined;

    this.getToggles().forEach(toggle => toggle.setTabbable?.(!isRadioGroup || toggle === tabbable));
  }

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
      this.observer = new MutationObserver(records => this.addedNodesHandler(records));
      this.observer.observe(this.host, { childList: true, subtree: true });
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  /** Registers the toggles added to the group, and those inside added elements. */
  addedNodesHandler(records: MutationRecord[]) {
    records.forEach(({ addedNodes }) =>
      Array.from(addedNodes)
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

  componentDidRender() {
    this.updateTabOrder();
  }

  render() {
    return (
      <Host
        class={toClassList('ds-toggle-group', this.mods)}
        role={this.isRadioGroup() ? 'radiogroup' : 'group'}
        aria-label={this.label}
        aria-disabled={this.disabled ? 'true' : undefined}
        onKeyDown={this.keyDownHandler}
      >
        <slot />
      </Host>
    );
  }
}
