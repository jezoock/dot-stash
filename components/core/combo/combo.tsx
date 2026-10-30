import { Component, Element, Event, EventEmitter, h, Method, Prop, State, Watch } from '@stencil/core';
import uuid from '../../utils/uuid';
import { toClassList } from '../../utils/props';
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

/** An option can be selected unless it is disabled or its value is an empty string (a placeholder). */
const isSelectable = (option: DSOption | undefined): boolean => !!option && !option.disabled && option.value !== '';

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
 */
@Component({
  tag: 'ds-combo',
  styleUrl: 'combo.scss',
})
export class DSCombo {
  /** Id of the root element: unique, and stable for the life of the element. */
  rootId = `ds-combo-${uuid()}`;
  outsideClickTimer: ReturnType<typeof setTimeout>;

  @Element() host: HTMLElement;

  /**
   * The options: an array of `DSOption` (`{ name, value, disabled, selected, image, url }`), or its JSON string:
   * `options='[{"name": "Red", "value": "red"}, {"name": "Blue", "value": "blue", "selected": true}]'`.
   */
  @Prop() options: string | DSOption[] = [];
  /** Name of the combo: sent in the `optionSelected` event, and shown on the toggle button of a multiple combo without `custom-label`. */
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

  @State() isOpen = false;
  @State() optionsArray: DSOption[] = [];

  /** Emitted when the user selects an option (or toggles it, in a multiple combo). See `DSComboSelectedEventDetail`. */
  @Event() optionSelected: EventEmitter<DSComboSelectedEventDetail>;

  //#region METHODS

  /** Opens the list. */
  @Method()
  async open() {
    this.isOpen = true;
    this.listenToOutsideClicks();
  }

  /** Closes the list. */
  @Method()
  async close() {
    this.isOpen = false;
    this.stopListeningToOutsideClicks();
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
  }

  connectedCallback() {
    // The element was moved while open.
    if (this.isOpen) {
      this.listenToOutsideClicks();
    }
  }

  disconnectedCallback() {
    this.stopListeningToOutsideClicks();
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
  }

  setOptions(options: DSOption[]) {
    this.optionsArray = options;
    this.selectedOptions = options.filter(option => option.selected).map(option => ({ ...option }));
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
    this.optionSelected.emit({
      name: this.name,
      option: { ...this.optionsArray[index] },
      selectedOptions: this.selectedOptions,
    });
    return true;
  }

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
      this.close();
    }
  };

  toggleButtonClickHandler = () => {
    this.toggle();
  };

  overlayClickHandler = () => {
    this.close();
  };

  optionClickHandler(event: MouseEvent, option: DSOption) {
    if (option.disabled) {
      event.preventDefault();
      return;
    }
    if (this.selectOption(option.index) && !this.multiple) {
      this.close();
    }
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

    return (
      <div
        id={this.rootId}
        class={{
          ...toClassList('ds-combo', this.mods),
          '--open': this.isOpen,
          [`--position-${this.position}`]: !!this.position,
          [`--${this.mode}`]: !!this.mode,
          '--with-overlay': this.overlay,
        }}
      >
        {this.overlay && this.isOpen && <div class="ds-combo__overlay" onClick={this.overlayClickHandler} />}
        {this.mode !== 'dropdown' && (
          <button type="button" class="ds-combo__selected-option" aria-expanded={this.isOpen ? 'true' : 'false'} onClick={this.toggleButtonClickHandler}>
            {this.renderToggleLabel()}
          </button>
        )}
        {(this.isOpen || isImageMode) && (
          <menu>
            <ul
              class={{
                'ds-combo__option-list': true,
                '--hidden': !this.isOpen,
              }}
            >
              {this.optionsArray.map(option => (
                <li
                  key={option.index}
                  class={{
                    'ds-combo__option': true,
                    '--disabled': !!option.disabled,
                    '--selected': option.selected,
                  }}
                  onClick={event => this.optionClickHandler(event, option)}
                >
                  {/* The name follows the image: the image is decorative. */}
                  {isImageMode && option.image && <img src={option.image} alt="" />}
                  {option.url ? (
                    <a href={option.disabled ? undefined : option.url} aria-disabled={option.disabled ? 'true' : undefined}>
                      {option.name}
                    </a>
                  ) : (
                    <span>{option.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </menu>
        )}
      </div>
    );
  }
}
