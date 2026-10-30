/** An option of `ds-combo`. */
export interface DSOption {
  /** Text of the option, and of the toggle button while the option is selected (single selection). */
  name?: string;
  /** Value of the option. An option whose value is an empty string cannot be selected (use it as a placeholder). */
  value?: string;
  /** A disabled option cannot be selected, and its link (`url`) is not rendered as a navigable link. */
  disabled?: boolean;
  /** Pre-selects the option. The component keeps it up to date in `selectedOptions` and in the event. */
  selected?: boolean;
  /** Image shown before the name in `image` mode. */
  image?: string;
  /** Renders the option as a link to this URL. */
  url?: string;
  /** Position of the option in the list: set by the component. */
  index?: number;
}

/** Pre-selection of `ds-combo`: the option at `index`, or else the first one with this `value`, or else with this `name`. */
export interface DSComboSelection {
  index?: number;
  value?: string;
  name?: string;
}

/** Where the option list opens: above (`top`), below (`bottom`), or below and towards the `left` or the `right`. */
export type DSComboPosition = 'top' | 'right' | 'bottom' | 'left';

/** Detail of the `optionSelected` event. */
export interface DSComboSelectedEventDetail {
  /** The `name` of the combo. */
  name: string;
  /** The option the user clicked, with its new `selected` state (a click toggles an option of a multiple combo). */
  option: DSOption;
  /** All the selected options, in the list order. */
  selectedOptions: DSOption[];
}
