import { AttachInternals, Component, Element, Event, EventEmitter, h, Listen, Method, Prop, State, Watch } from '@stencil/core';
import uuid from '../../utils/uuid';
import { toClassList } from '../../utils/props';
import { getFocusedElement } from '../../utils/focus';
import {
  checkValidity,
  getLabelIds,
  getLabels,
  getLabelText,
  getValidationMessage,
  getValidity,
  getValueMissingMessage,
  getWillValidate,
  reportValidity,
  setCustomState,
  setFormValue,
  setValueMissing,
} from '../../utils/form-control';
import { COMBO_PAGE_SIZE, COMBO_TYPE_AHEAD_DELAY } from './combo.constants';
import { DSComboPosition, DSComboSelectedEventDetail, DSComboSelection, DSOption } from './combo.types';

/** Parses a JSON string prop; an invalid JSON string is logged and gives `undefined`. */
function parseJSONProp<T>(prop: string | T, propName: string): T | undefined {
  if (typeof prop !== 'string') {
    return prop;
  }
  if (prop.trim() === '') {
    return undefined;
  }
  try {
    return JSON.parse(prop);
  } catch {
    console.error(`[ds-combo] invalid ${propName} JSON: ${prop}`);
    return undefined;
  }
}

/** Compares two values of a JSON prop by their content: a JSON string as is, an array or an object serialized. */
const isSameJSON = (value: unknown, otherValue: unknown): boolean => {
  const serialize = (prop: unknown) => (typeof prop === 'string' ? prop : JSON.stringify(prop));
  return value === otherValue || serialize(value) === serialize(otherValue);
};

/** The custom state of a combo whose invalid state the user should see (`:state(user-invalid)`). */
const USER_INVALID_STATE = 'user-invalid';

/** An option can be selected unless it is disabled or its value is an empty string (a placeholder). */
const isSelectable = (option: DSOption | undefined): boolean => !!option && !option.disabled && option.value !== '';

/** The keys move to the options that can be activated: not disabled, and selectable or links. The others are `aria-disabled`. */
const isActivatable = (option: DSOption | undefined): boolean => !!option && !option.disabled && (isSelectable(option) || !!option.url);

const findOptionIndex = (options: DSOption[], selection: DSComboSelection): number => {
  if (typeof selection.index === 'number') {
    return selection.index >= 0 && selection.index < options.length ? selection.index : -1;
  }
  if (selection.value !== undefined && selection.value !== null) {
    return options.findIndex(option => option.value !== undefined && option.value !== null && String(option.value) === String(selection.value));
  }
  if (selection.name !== undefined && selection.name !== null) {
    return options.findIndex(option => option.name === selection.name);
  }
  return -1;
};

/**
 * A custom select: a toggle button opens a list of options, given as an array or a JSON string in `options`.
 * Single selection (a click selects an option and closes the list) or `multiple` selection (a click toggles
 * an option and keeps the list open). An option with a `url` renders a link; `mode="image"` shows the options'
 * images; `mode="dropdown"` renders no toggle button (open the list with `open()` or `toggle()`, e.g. from a
 * `ds-trigger`). A click outside the component closes the list.
 * It follows the WAI-ARIA select-only combobox pattern: the toggle button is a `combobox` that keeps the focus and
 * points to the active option (`aria-activedescendant`) of the `listbox`; the arrow keys, Home, End, Page Up, Page
 * Down and the typed characters move the active option, Enter and Space select it, Escape closes the list. In
 * `dropdown` mode, `open()` moves the focus to the list, and closing it gives the focus back.
 * It is form-associated, as a native select: it submits the value of its selected option (of each one, in a multiple
 * combo) under its `name`; a `<label>` names it and a click on the label focuses it; a disabled fieldset disables it; a
 * form reset gives it back its selection of the load; `required` makes it invalid without a selected option.
 */
@Component({
  tag: 'ds-combo',
  styleUrl: 'combo.scss',
  formAssociated: true,
})
export class DSCombo {
  /** Id of the root element: unique, and stable for the life of the element. */
  rootId = `ds-combo-${uuid()}`;
  outsideClickTimer: ReturnType<typeof setTimeout>;

  @Element() host: HTMLElement;

  @AttachInternals({
    states: {
      /** The combo is invalid (`required`, no option selected) and the user should see it: after an `invalid` event or a change by the user, until a form reset. */
      'user-invalid': false,
    },
  })
  internals: ElementInternals;

  /**
   * The options: an array of `DSOption` (`{ name, value, disabled, selected, image, url }`), or its JSON string:
   * `options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue", "selected": true}]'`.
   */
  @Prop() options: string | DSOption[] = [];
  /**
   * Name of the combo: the name of its value in the form data (a combo without a name submits nothing), sent in the
   * `optionSelected` event, and shown on the toggle button of a multiple combo without `custom-label`.
   */
  @Prop({ reflect: true }) name: string;
  /**
   * `dropdown`: no toggle button, the list is opened with the methods. `image`: each option shows its `image`,
   * and the list stays in the DOM while closed (with a `--hidden` class), so that the images are loaded.
   * Each mode also adds a `--<mode>` class.
   */
  @Prop({ reflect: true }) mode = '';
  /** Fixed text of the toggle button, shown instead of the selected option's name (single) or the `name` (multiple). */
  @Prop() customLabel = '';
  /** Several options can be selected: a click toggles an option and keeps the list open. */
  @Prop() multiple = false;
  /** Renders a full-page overlay behind the open list: a click on it closes the list. */
  @Prop() overlay = false;
  /** Where the list opens: `top` (above), `bottom` (below), `left` (below, towards the left) or `right` (below, towards the right). */
  @Prop({ reflect: true }) position: DSComboPosition = 'left';
  /**
   * Pre-selects an option: `{ index }`, `{ value }` or `{ name }`, or its JSON string (`selected='{"value": "blue"}'`).
   * It adds to the options' `selected` flags in a multiple combo, and replaces them in a single combo.
   * Changing `options`, `selected` or `multiple` resets the selection from them (new arrays or objects with the same
   * content change nothing).
   */
  @Prop() selected: string | DSComboSelection;
  /** The selected options, in the list order. Set by the component: to change the selection, set `selected` or the options' `selected` flags. */
  @Prop({ mutable: true }) selectedOptions: DSOption[] = [];
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  /**
   * The accessible name of the combo, what it chooses ("Color"): the `aria-label` of the combobox and of the list.
   * Without it (and without `labelledby`), the combo is named by `custom-label`, else by `name`.
   */
  @Prop() label: string;
  /** The ids of the elements that name the combo (a visible label): the `aria-labelledby` of the combobox and of the list. */
  @Prop() labelledby: string;
  /**
   * Disables the combo: its button cannot be focused nor opened, an open list closes, and it submits nothing. A
   * disabled `<fieldset>` around it disables it too, without changing this prop.
   */
  @Prop({ reflect: true }) disabled: boolean;
  /** An option must be selected for the form to be submitted (`valueMissing`, `aria-required` on the combobox). */
  @Prop({ reflect: true }) required: boolean;
  /** The message of a required combo without a selected option, instead of the browser's own (`validationMessage`). */
  @Prop() requiredMessage: string;

  /** The validity of the combo, as the `validity` of a native select (read-only; once the component is loaded). */
  @Prop() get validity(): ValidityState {
    return getValidity(this.internals);
  }

  /** The message of an invalid combo, as the `validationMessage` of a native select (read-only): `required-message`, else the browser's own. */
  @Prop() get validationMessage(): string {
    return getValidationMessage(this.internals);
  }

  /** Whether the form validates the combo (read-only): not while it is disabled. */
  @Prop() get willValidate(): boolean {
    return getWillValidate(this.internals);
  }

  @State() isOpen = false;
  @State() optionsArray: DSOption[] = [];
  /** The option the keys move and select (`aria-activedescendant`, `--active`) while the list is open; -1 for none. */
  @State() activeIndex = -1;
  /** Disabled by its form: a disabled `<fieldset>` around it, or its own `disabled` attribute (`formDisabledCallback`). */
  @State() formDisabled = false;
  /** Whether the validity is shown (`aria-invalid`, `--invalid`): after an `invalid` event or a change by the user, until a form reset. */
  @State() isValidityShown = false;

  /** The combobox (the toggle button) and the list, once rendered. */
  private button: HTMLButtonElement;
  private list: HTMLElement;
  /** `dropdown` mode: the element that had the focus when the list was opened, which gets it back. */
  private returnFocusElement: HTMLElement | null = null;
  /** `dropdown` mode: the focus moves to the list once it is rendered open. */
  private needsListFocus = false;
  /** The characters typed in a row, and the timer that ends the search. */
  private typeAheadText = '';
  private typeAheadTimer: ReturnType<typeof setTimeout>;
  /** The active option the list was last scrolled to. */
  private scrolledIndex = -1;

  /** Emitted when the user selects an option (or toggles it, in a multiple combo). See `DSComboSelectedEventDetail`. */
  @Event() optionSelected: EventEmitter<DSComboSelectedEventDetail>;

  //#region METHODS

  /** Opens the list (not while the combo is disabled). In `dropdown` mode, it moves the focus to the list. */
  @Method()
  async open() {
    this.openList();
  }

  /** Closes the list. When the focus is in the list (`dropdown` mode), it goes back to the element that had it before. */
  @Method()
  async close() {
    this.closeList(false);
  }

  /** Opens the list if it is closed and closes it if it is open, or opens (`true`) or closes (`false`) it. */
  @Method()
  async toggle(forceDisplay?: boolean) {
    const show = typeof forceDisplay === 'boolean' ? forceDisplay : !this.isOpen;

    if (show) {
      this.open();
    } else {
      this.close();
    }
  }

  /** Whether the combo is valid; an invalid combo gets an `invalid` event (as the `checkValidity()` of a native select, but asynchronous). */
  @Method()
  async checkValidity(): Promise<boolean> {
    this.updateFormState();
    return checkValidity(this.internals);
  }

  /** As `checkValidity()`, and the browser shows the message of an invalid combo at its combobox, which takes the focus. */
  @Method()
  async reportValidity(): Promise<boolean> {
    this.updateFormState();
    return reportValidity(this.internals);
  }

  //#endregion

  //#region LIFECYCLE

  @Watch('options')
  @Watch('selected')
  selectionSourceChangeHandler(value: unknown, previousValue: unknown) {
    // A parent that re-renders passes new arrays or objects: the user's selection is kept while their content is the same.
    if (!isSameJSON(value, previousValue)) {
      this.loadOptions();
    }
  }

  @Watch('multiple')
  multipleChangeHandler() {
    this.loadOptions();
  }

  componentWillLoad() {
    this.loadOptions();
    this.updateFormState();
  }

  connectedCallback() {
    // The element was moved while open.
    if (this.isOpen) {
      this.listenToOutsideClicks();
    }
  }

  disconnectedCallback() {
    this.stopListeningToOutsideClicks();
    this.clearTypeAhead();
  }

  componentDidRender() {
    // After the render: the combobox, the anchor of the validation message, is there.
    this.updateFormState();
    if (this.needsListFocus && this.isOpen && this.list) {
      this.needsListFocus = false;
      this.list.focus({ preventScroll: true });
    }
    this.scrollToActiveOption();
  }

  //#endregion

  //#region FORM

  /** Disabled by its own prop or its form. */
  get isDisabled(): boolean {
    return !!(this.disabled || this.formDisabled);
  }

  /** Required, enabled, and no option selected. */
  get isValueMissing(): boolean {
    return !!this.required && !this.isDisabled && this.selectedOptions.length === 0;
  }

  @Watch('selectedOptions')
  @Watch('name')
  @Watch('required')
  @Watch('requiredMessage')
  @Watch('isValidityShown')
  formStateWatcher() {
    this.updateFormState();
  }

  @Watch('disabled')
  @Watch('formDisabled')
  disabledWatcher() {
    // A disabled combo cannot stay open.
    if (this.isDisabled && this.isOpen) {
      this.closeList(false);
    }
    this.updateFormState();
  }

  /**
   * The form value: the value of the selected option (a single combo), or an entry per selected option (a multiple
   * one), none while disabled or without a name; the state the browser restores: the selected values (JSON). Then the
   * validity (its message at the combobox) and the custom state.
   */
  updateFormState() {
    const values = this.selectedOptions.map(option => String(option.value));
    const isMissing = this.isValueMissing;
    let value: string | FormData | null = null;

    if (!this.isDisabled && this.name && values.length) {
      if (this.multiple) {
        value = new FormData();
        values.forEach(optionValue => (value as FormData).append(this.name, optionValue));
      } else {
        value = values[0];
      }
    }
    setFormValue(this.internals, value, JSON.stringify(values));
    setValueMissing(this.internals, this.host, isMissing, this.requiredMessage || getValueMissingMessage('select'), this.button);
    setCustomState(this.internals, USER_INVALID_STATE, this.isValidityShown && isMissing);
  }

  /** A form reset: the selection of the load (from `options` and `selected`), and the validity no longer shown. */
  formResetCallback() {
    this.loadOptions();
    this.isValidityShown = false;
  }

  /** The browser gives back the selected values (history navigation), without an `optionSelected` event. */
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
    // A single combo selects one option: the first one with a restored value.
    const restoredIndex = this.optionsArray.findIndex(option => isSelectable(option) && restored.includes(String(option.value)));

    this.setOptions(
      this.optionsArray.map(option => ({
        ...option,
        selected: isSelectable(option) && (this.multiple ? restored.includes(String(option.value)) : option.index === restoredIndex),
      })),
    );
  }

  /** A disabled `<fieldset>` around the combo, or its own `disabled` attribute. */
  formDisabledCallback(isDisabled: boolean) {
    this.formDisabled = isDisabled;
  }

  /** `checkValidity()` or `reportValidity()` of the combo or of its form, or a submission, found it invalid: it shows it. */
  @Listen('invalid')
  invalidHandler({ target }: { target: EventTarget | null }) {
    if (target === this.host) {
      this.isValidityShown = true;
    }
  }

  /** A click on the element itself, not on its content: its `<label>` was clicked. The combobox takes the focus, as a native select. */
  @Listen('click')
  hostClickHandler(event: MouseEvent) {
    if (event.target === this.host && !this.isDisabled) {
      this.button?.focus();
    }
  }

  //#endregion

  //#region OPTIONS

  /** Reads `options` and sets the selection from the options' `selected` flags and the `selected` prop. */
  loadOptions() {
    const parsedOptions = parseJSONProp(this.options, 'options');
    const options: DSOption[] = Array.isArray(parsedOptions)
      ? parsedOptions.map((option, index) => ({ ...option, index, selected: !!option?.selected && isSelectable(option) }))
      : [];
    const selection = parseJSONProp(this.selected, 'selected');
    const selectedIndex = selection && typeof selection === 'object' ? findOptionIndex(options, selection) : -1;
    const preselected = isSelectable(options[selectedIndex]) ? selectedIndex : -1;

    if (this.multiple) {
      if (preselected > -1) {
        options[preselected].selected = true;
      }
    } else {
      // A single combo keeps one selected option: the pre-selected one, or else the first flagged one.
      const keptIndex = preselected > -1 ? preselected : options.findIndex(option => option.selected);
      options.forEach(option => (option.selected = option.index === keptIndex));
    }

    this.setOptions(options);
    this.activeIndex = this.isOpen ? this.getInitialActiveIndex() : -1;
  }

  setOptions(options: DSOption[]) {
    this.optionsArray = options;
    this.selectedOptions = options.filter(option => option.selected).map(option => ({ ...option }));
  }

  /** The indexes of the options the keys move to, in the list order. */
  getActivatableIndexes(): number[] {
    return this.optionsArray.filter(isActivatable).map(option => option.index);
  }

  /** The active option when the list opens: the (first) selected option, else the first option the keys move to. */
  getInitialActiveIndex(): number {
    const indexes = this.getActivatableIndexes();
    return indexes.find(index => this.optionsArray[index].selected) ?? indexes[0] ?? -1;
  }

  /** Selects the option (or toggles it, in a multiple combo) and emits `optionSelected`. Returns `false` for an option that cannot be selected. */
  selectOption(index: number): boolean {
    if (!isSelectable(this.optionsArray[index])) {
      return false;
    }

    this.setOptions(
      this.optionsArray.map(option => ({
        ...option,
        selected: option.index === index ? !this.multiple || !option.selected : this.multiple && option.selected,
      })),
    );
    // Changed by the user: its validity shows (as :user-invalid).
    this.isValidityShown = true;
    this.optionSelected.emit({
      name: this.name,
      option: { ...this.optionsArray[index] },
      selectedOptions: this.selectedOptions,
    });
    return true;
  }

  //#endregion

  //#region OPEN AND CLOSE

  /** Opens the list (once), its active option on the selected one; `activeIndex` moves the active option. */
  openList(activeIndex?: number) {
    if (this.isDisabled) {
      return;
    }
    if (!this.isOpen) {
      if (this.mode === 'dropdown') {
        const focused = getFocusedElement();
        this.returnFocusElement = focused && !this.host.contains(focused) ? focused : null;
        this.needsListFocus = true;
      }
      this.isOpen = true;
      this.activeIndex = this.getInitialActiveIndex();
    }
    if (activeIndex !== undefined && activeIndex > -1) {
      this.activeIndex = activeIndex;
    }
    this.listenToOutsideClicks();
  }

  /**
   * Closes the list. The focus goes to the opener (the combobox, or in `dropdown` mode the element that had it before
   * the list opened) with `restoreFocus`, and always when it is in the list, which is removed or hidden.
   */
  closeList(restoreFocus: boolean) {
    const focused = getFocusedElement();
    const mustFocusOpener = restoreFocus || (!!focused && !!this.list?.contains(focused));
    const opener = this.mode === 'dropdown' ? this.returnFocusElement : this.button;

    this.isOpen = false;
    this.activeIndex = -1;
    this.needsListFocus = false;
    this.returnFocusElement = null;
    this.stopListeningToOutsideClicks();
    this.clearTypeAhead();

    if (mustFocusOpener && opener?.isConnected && opener !== focused) {
      opener.focus();
    }
  }

  /** Whether the focus is in the combo or nowhere (the body): the keys or a click in the combo. */
  isFocusInCombo(): boolean {
    const focused = getFocusedElement();
    return !focused || this.host.contains(focused);
  }

  /** Keeps the active option in view in a list that scrolls, without scrolling the page. */
  scrollToActiveOption() {
    if (!this.isOpen || this.activeIndex < 0) {
      this.scrolledIndex = -1;
      return;
    }
    const option = this.list?.querySelector<HTMLElement>(`[id="${this.optionId(this.activeIndex)}"]`);

    if (!option || this.scrolledIndex === this.activeIndex) {
      return;
    }
    this.scrolledIndex = this.activeIndex;
    const list = this.list;
    if (option.offsetTop < list.scrollTop) {
      list.scrollTop = option.offsetTop;
    } else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }

  //#endregion

  //#region KEYBOARD

  /** Moves the active option by `delta` options the keys move to (Page Up and Page Down: by 10), stopping at the ends. */
  moveActiveOption(delta: number) {
    const indexes = this.getActivatableIndexes();
    const position = indexes.indexOf(this.activeIndex);

    if (!indexes.length) {
      return;
    }
    if (position < 0) {
      this.activeIndex = delta > 0 ? indexes[0] : indexes[indexes.length - 1];
    } else {
      this.activeIndex = indexes[Math.min(Math.max(position + delta, 0), indexes.length - 1)];
    }
  }

  /**
   * Type-ahead: the characters typed in a row (less than `COMBO_TYPE_AHEAD_DELAY` apart) move the active option to the next
   * option whose name starts with them; the same character typed again goes round the options that start with it.
   */
  typeAhead(character: string) {
    clearTimeout(this.typeAheadTimer);
    this.typeAheadTimer = setTimeout(() => (this.typeAheadText = ''), COMBO_TYPE_AHEAD_DELAY);
    this.typeAheadText += character.toLowerCase();

    const text = this.typeAheadText;
    const indexes = this.getActivatableIndexes();
    const position = indexes.indexOf(this.activeIndex);
    // A new search starts after the active option, a search that goes on from it (it may still match).
    const start = position < 0 ? 0 : position + (text.length > 1 ? 0 : 1);
    const ordered = [...indexes.slice(start), ...indexes.slice(0, start)];
    const startingWith = (prefix: string) => ordered.filter(index => (this.optionsArray[index].name ?? '').trim().toLowerCase().startsWith(prefix));
    const matches = startingWith(text);
    // The same character typed again ("bb", no option starts with it): the next option that starts with the character.
    const isSameCharacter = [...text].every(other => other === text[0]);
    const [match] = matches.length || !isSameCharacter ? matches : startingWith(text[0]).filter(index => index !== this.activeIndex);

    if (match !== undefined) {
      this.activeIndex = match;
    }
  }

  clearTypeAhead() {
    clearTimeout(this.typeAheadTimer);
    this.typeAheadText = '';
  }

  /** Enter or Space on the active option: as a click on it, on its link for a link option (it is followed). */
  activateOption(index: number) {
    const option = this.optionsArray[index];

    if (!isActivatable(option)) {
      return;
    }
    if (option.url) {
      this.list?.querySelector<HTMLElement>(`[id="${this.optionId(index)}"] > a`)?.click();
    } else {
      this.chooseOption(option);
    }
  }

  /**
   * The keys of the combobox, and of the list in `dropdown` mode. Closed: Down, Up, Enter and Space open the list, Home
   * and End open it on the first or the last option, a character on the option it starts. Open: see the readme.
   */
  keyDownHandler = (event: KeyboardEvent) => {
    const { key, altKey, ctrlKey, metaKey } = event;
    const isCharacter = key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey;

    if (ctrlKey || metaKey) {
      return;
    }

    if (!this.isOpen) {
      const indexes = this.getActivatableIndexes();
      const activeIndex = { Home: indexes[0], End: indexes[indexes.length - 1] }[key];

      if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(key) || isCharacter) {
        event.preventDefault();
        this.openList(activeIndex);
        if (isCharacter) {
          this.typeAhead(key);
        }
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!altKey) {
          this.moveActiveOption(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (altKey) {
          // Alt+Up selects the active option and closes the list, as Tab.
          this.selectOnClose();
          this.closeList(true);
        } else {
          this.moveActiveOption(-1);
        }
        break;
      case 'Home':
      case 'End': {
        event.preventDefault();
        const indexes = this.getActivatableIndexes();
        if (indexes.length) {
          this.activeIndex = key === 'Home' ? indexes[0] : indexes[indexes.length - 1];
        }
        break;
      }
      case 'PageUp':
      case 'PageDown':
        event.preventDefault();
        this.moveActiveOption(key === 'PageUp' ? -COMBO_PAGE_SIZE : COMBO_PAGE_SIZE);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!event.repeat) {
          this.activateOption(this.activeIndex);
        }
        break;
      case 'Escape':
      case 'Esc':
        // Closes the list only: a modal or a sidebar around the combo stays open.
        event.preventDefault();
        event.stopPropagation();
        this.closeList(true);
        break;
      case 'Tab':
        // The focus moves on (no preventDefault).
        this.selectOnClose();
        this.closeList(false);
        break;
      default:
        if (isCharacter) {
          event.preventDefault();
          this.typeAhead(key);
        }
    }
  };

  /** A single combo selects its active option when the list is left with Tab or Alt+Up (not a link: it is not followed). */
  selectOnClose() {
    const option = this.optionsArray[this.activeIndex];

    if (!this.multiple && isSelectable(option) && !option.url && !option.selected) {
      this.selectOption(option.index);
    }
  }

  /** Space opens the list on keydown: on keyup, the native button would be clicked, and close it. */
  keyUpHandler = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
    }
  };

  //#endregion

  //#region OUTSIDE CLICKS

  listenToOutsideClicks() {
    this.stopListeningToOutsideClicks();
    // Deferred, so that the click that opens the list (e.g. on a ds-trigger outside the combo) does not close it
    // when it reaches the document.
    this.outsideClickTimer = setTimeout(() => document.addEventListener('click', this.documentClickHandler));
  }

  stopListeningToOutsideClicks() {
    clearTimeout(this.outsideClickTimer);
    document.removeEventListener('click', this.documentClickHandler);
  }

  //#endregion

  //#region HANDLERS

  documentClickHandler = (event: MouseEvent) => {
    // The path is computed at dispatch: it still holds the host if the clicked element was re-rendered since.
    if (!event.composedPath().includes(this.host)) {
      this.closeList(false);
    }
  };

  toggleButtonClickHandler = () => {
    this.toggle();
  };

  overlayClickHandler = () => {
    this.closeList(false);
  };

  /** A mouse down in the list does not move the focus: it stays on the combobox (or on the list, in `dropdown` mode). */
  listMouseDownHandler = (event: MouseEvent) => {
    event.preventDefault();
  };

  optionClickHandler(event: MouseEvent, option: DSOption) {
    if (option.disabled || this.isDisabled) {
      event.preventDefault();
      return;
    }
    this.chooseOption(option);
  }

  /**
   * Selects the option (toggles it in a multiple combo): a single combo closes, the focus on the opener; a multiple one
   * stays open, the option active.
   */
  chooseOption(option: DSOption) {
    if (this.selectOption(option.index) && !this.multiple) {
      this.closeList(this.isFocusInCombo());
    } else if (this.isOpen && isActivatable(option)) {
      this.activeIndex = option.index;
    }
  }

  optionId(index: number): string {
    return `${this.rootId}-option-${index}`;
  }

  //#endregion

  renderToggleLabel() {
    if (this.multiple) {
      const count = this.selectedOptions.length;
      return (
        <span>
          {this.customLabel || this.name}
          {count > 0 && <span> ({count})</span>}
        </span>
      );
    }
    return <span>{this.customLabel || this.selectedOptions[0]?.name || this.optionsArray[0]?.name}</span>;
  }

  render() {
    const isImageMode = this.mode === 'image';
    const isDropdown = this.mode === 'dropdown';
    const isListRendered = this.isOpen || isImageMode;
    const listId = `${this.rootId}-listbox`;
    const activeId = this.isOpen && this.optionsArray[this.activeIndex] ? this.optionId(this.activeIndex) : undefined;
    // The name of the combobox and of the list: labelledby, else label, else its <label> elements (which label the
    // element, not its combobox: their ids, or the text of a label around it without the combo's own), else
    // custom-label, else name.
    const labels = this.labelledby || this.label ? [] : getLabels(this.internals);
    const isInLabel = labels.some(labelElement => labelElement.contains(this.host));
    const labelIds = isInLabel ? undefined : getLabelIds(labels, this.rootId);
    const labelText = isInLabel
      ? labels
          .map(labelElement => getLabelText(labelElement, this.host))
          .join(' ')
          .trim()
      : undefined;
    const labelledby = this.labelledby || labelIds;
    const label = labelledby ? undefined : this.label || labelText || this.customLabel || this.name || undefined;
    const isDisabled = this.isDisabled;
    const isMissing = this.isValueMissing;
    const isInvalidShown = this.isValidityShown && isMissing;

    return (
      <div
        id={this.rootId}
        class={{
          ...toClassList('ds-combo', this.mods),
          '--open': this.isOpen,
          [`--position-${this.position}`]: !!this.position,
          [`--${this.mode}`]: !!this.mode,
          '--with-overlay': this.overlay,
          '--disabled': isDisabled,
          '--invalid': isInvalidShown,
        }}
      >
        {this.overlay && this.isOpen && <div class="ds-combo__overlay" onClick={this.overlayClickHandler} />}
        {!isDropdown && (
          <button
            type="button"
            class="ds-combo__selected-option"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={this.isOpen ? 'true' : 'false'}
            aria-controls={isListRendered ? listId : undefined}
            aria-activedescendant={activeId}
            aria-label={label}
            aria-labelledby={labelledby}
            aria-required={this.required && !isDisabled ? 'true' : undefined}
            // Invalid but not shown yet: "false", as the browser would tell assistive technologies it is invalid from the start.
            aria-invalid={isInvalidShown ? 'true' : isMissing ? 'false' : undefined}
            disabled={isDisabled}
            ref={element => (this.button = element)}
            onClick={this.toggleButtonClickHandler}
            onKeyDown={this.keyDownHandler}
            onKeyUp={this.keyUpHandler}
          >
            {this.renderToggleLabel()}
          </button>
        )}
        {isListRendered && (
          <div class="ds-combo__menu">
            <ul
              id={listId}
              class={{
                'ds-combo__option-list': true,
                '--hidden': !this.isOpen,
              }}
              role="listbox"
              aria-multiselectable={this.multiple ? 'true' : undefined}
              aria-label={label}
              aria-labelledby={labelledby}
              // Out of the Tab order: a list that scrolls is a Tab stop in some browsers, and Tab closes the list. In
              // dropdown mode, the list takes the focus from open(), and points to the active option.
              tabindex="-1"
              aria-activedescendant={isDropdown ? activeId : undefined}
              ref={element => (this.list = element)}
              onMouseDown={this.listMouseDownHandler}
              onKeyDown={isDropdown ? this.keyDownHandler : undefined}
            >
              {this.optionsArray.map(option => (
                <li
                  key={option.index}
                  id={this.optionId(option.index)}
                  class={{
                    'ds-combo__option': true,
                    '--disabled': !!option.disabled,
                    '--selected': option.selected,
                    '--active': this.isOpen && option.index === this.activeIndex,
                  }}
                  role="option"
                  aria-selected={option.selected ? 'true' : 'false'}
                  aria-disabled={isActivatable(option) ? undefined : 'true'}
                  onClick={event => this.optionClickHandler(event, option)}
                >
                  {/* The name follows the image: the image is decorative. */}
                  {isImageMode && option.image && <img src={option.image} alt="" />}
                  {option.url ? (
                    // Out of the Tab order: the keys activate the option, which follows the link.
                    <a href={option.disabled ? undefined : option.url} tabindex="-1" aria-disabled={option.disabled ? 'true' : undefined}>
                      {option.name}
                    </a>
                  ) : (
                    <span>{option.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}
