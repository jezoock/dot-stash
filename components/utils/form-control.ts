/**
 * Form-associated components: the internal helpers of the components that take part in a native `<form>` through their
 * `ElementInternals` (`ds-toggle`, `ds-toggle-group`, `ds-combo`): their value, their validity and its message, their
 * `<label>` elements and their custom states. And those of `ds-field`, which enhances a native control: its disabled
 * state, the message of its validity, the ids of its descriptions.
 */

/** The native control whose message a component gives for a required value left empty (`valueMissing`). */
export type ValueMissingKind = 'checkbox' | 'radio' | 'select';

/**
 * The messages of a browser in English, for an environment that has no message of its own (no constraint validation,
 * the simulated DOM of the spec tests).
 */
export const DEFAULT_VALUE_MISSING_MESSAGES: Record<ValueMissingKind, string> = {
  checkbox: 'Please check this box if you want to proceed.',
  radio: 'Please select one of these options.',
  select: 'Please select an item in the list.',
};

const valueMissingMessages: Partial<Record<ValueMissingKind, string>> = {};

/** A native control of that kind, required and left empty: a checkbox not checked, a radio (named, so that it is a group of its own), a select without option. */
const createEmptyRequiredControl = (kind: ValueMissingKind): HTMLInputElement | HTMLSelectElement => {
  if (kind === 'select') {
    const select = document.createElement('select');
    select.required = true;
    return select;
  }
  const input = document.createElement('input');
  input.type = kind;
  input.name = 'ds-value-missing';
  input.required = true;
  return input;
};

/**
 * The message of a required control left empty: the browser's own, in its language, read from a native control in the
 * same state (not attached to the document), else the English one. Read once per kind.
 */
export const getValueMissingMessage = (kind: ValueMissingKind): string => {
  if (!valueMissingMessages[kind]) {
    let message = '';
    try {
      message = createEmptyRequiredControl(kind).validationMessage ?? '';
    } catch {
      // No DOM: the English message.
    }
    valueMissingMessages[kind] = message || DEFAULT_VALUE_MISSING_MESSAGES[kind];
  }
  return valueMissingMessages[kind];
};

/**
 * Whether the internals can take part in a form: an `ElementInternals` of the browser. The simulated DOM of the spec
 * tests gives an object without its methods (the `in` test does not read them, which would log an error there).
 */
export const isFormInternals = (internals: ElementInternals | undefined): internals is ElementInternals =>
  !!internals && typeof internals === 'object' && 'setFormValue' in internals;

/**
 * Sets the value the element submits with its form (`null`: none; a `FormData`: its entries) and the state the browser
 * gives back to `formStateRestoreCallback()` (history navigation, autofill).
 */
export const setFormValue = (internals: ElementInternals | undefined, value: string | FormData | null, state: string | FormData | null = value): void => {
  if (isFormInternals(internals)) {
    internals.setFormValue(value, state);
  }
};

/**
 * Sets the validity of the element: a required value left empty (`valueMissing`), with its message and the element the
 * browser shows it at and focuses (`anchor`, the element or one of its descendants), or valid.
 */
export const setValueMissing = (internals: ElementInternals | undefined, host: HTMLElement, isMissing: boolean, message: string, anchor?: HTMLElement): void => {
  if (!isFormInternals(internals)) {
    return;
  }
  if (isMissing) {
    internals.setValidity({ valueMissing: true }, message, anchor && host.contains(anchor) ? anchor : undefined);
  } else {
    internals.setValidity({});
  }
};

/** Adds or removes a custom state of the element (`:state(<name>)`), where the browser has them. */
export const setCustomState = (internals: ElementInternals | undefined, name: string, isOn: boolean): void => {
  // A Set of strings (the `dom.iterable` library, not in the configuration, types it so).
  const states = isFormInternals(internals) ? (internals.states as unknown as Set<string> | undefined) : undefined;

  if (!states) {
    return;
  }
  try {
    if (isOn) {
      states.add(name);
    } else {
      states.delete(name);
    }
  } catch {
    // A browser that only knows the former `--<name>` syntax: no custom state.
  }
};

/** The validity of the element (`validity`, `validationMessage`, `willValidate`, `checkValidity()`, `reportValidity()`), as a native control gives it. */
export const getValidity = (internals: ElementInternals | undefined): ValidityState | undefined => (isFormInternals(internals) ? internals.validity : undefined);

export const getValidationMessage = (internals: ElementInternals | undefined): string => (isFormInternals(internals) ? internals.validationMessage : '');

export const getWillValidate = (internals: ElementInternals | undefined): boolean => (isFormInternals(internals) ? internals.willValidate : false);

/** Checks the validity: an invalid element gets an `invalid` event. `true` without form internals. */
export const checkValidity = (internals: ElementInternals | undefined): boolean => (isFormInternals(internals) ? internals.checkValidity() : true);

/** Checks the validity and shows the message of an invalid element (at its anchor, which takes the focus). `true` without form internals. */
export const reportValidity = (internals: ElementInternals | undefined): boolean => (isFormInternals(internals) ? internals.reportValidity() : true);

/** The `<label>` elements of the element (`<label for="<its id>">`, or a `<label>` around it), in the document order. */
export const getLabels = (internals: ElementInternals | undefined): HTMLLabelElement[] =>
  isFormInternals(internals) && internals.labels ? (Array.from(internals.labels) as HTMLLabelElement[]) : [];

/**
 * The text of a label without the text of the element it labels, for a `<label>` around the element: as an
 * `aria-labelledby`, it would also give the content of the element (its value) to its name.
 */
export const getLabelText = (label: Node, labelled: Node): string => {
  const texts: string[] = [];
  const read = (node: Node) => {
    if (node === labelled) {
      return;
    }
    if (node.nodeType === 3) {
      texts.push(node.textContent ?? '');
    } else {
      Array.from(node.childNodes).forEach(read);
    }
  };

  read(label);
  return texts.join('').replace(/\s+/g, ' ').trim();
};

/**
 * The ids of the labels, for an `aria-labelledby` (`undefined` without labels): a label without an id gets one,
 * `<prefix>-label-<n>`.
 */
export const getLabelIds = (labels: HTMLElement[], prefix: string): string | undefined => {
  const ids = labels.map((label, index) => {
    if (!label.id) {
      label.id = `${prefix}-label-${index + 1}`;
    }
    return label.id;
  });

  return ids.length ? ids.join(' ') : undefined;
};

/** Whether a native control is disabled: its own `disabled`, or a disabled `<fieldset>` around it (`:disabled`). */
export const isDisabledControl = (control: Element | null | undefined): boolean => {
  if (!control) {
    return false;
  }
  try {
    return control.matches(':disabled') || control.hasAttribute('disabled');
  } catch {
    // A DOM without the pseudo-class.
    return control.hasAttribute('disabled');
  }
};

/** The flags of a `ValidityState` but `customError`, in the order an error message is chosen for them. */
export const VALIDITY_FLAGS = ['valueMissing', 'badInput', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch'] as const;

export type ValidityFlag = (typeof VALIDITY_FLAGS)[number];

/**
 * The error message of a control, `''` while it is valid: for a custom error (`setCustomValidity()`), the message its
 * author gave (`validationMessage`); else the message of its first invalid flag in `messages`, else `fallback`, else the
 * message of the browser (`validationMessage`, in its language).
 */
export const getErrorMessage = (
  validity: Partial<ValidityState> | undefined,
  validationMessage: string | undefined,
  messages: Partial<Record<ValidityFlag, string>> = {},
  fallback?: string,
): string => {
  if (!validity || validity.valid !== false) {
    return '';
  }
  if (validity.customError && validationMessage) {
    return validationMessage;
  }
  const flag = VALIDITY_FLAGS.find(name => validity[name]);
  return (flag && messages[flag]) || fallback || validationMessage || '';
};

/**
 * Updates the ids a component adds to an id reference attribute of an element (`aria-describedby`), and keeps those of the
 * author, in their order: removes `previous` (the ids it added before), adds the ids of `next` that are not in the list.
 * Writes the attribute only when its list changes (an empty list removes it). Returns the ids it added: the `previous`
 * of the next update (an empty `next` removes them all).
 */
export const updateIdRefs = (element: Element, attribute: string, previous: string[], next: string[]): string[] => {
  const current = (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
  const own = current.filter(id => !previous.includes(id));
  const added = next.filter((id, index) => id && !own.includes(id) && next.indexOf(id) === index);
  const value = [...own, ...added].join(' ');

  if (value !== current.join(' ')) {
    if (value) {
      element.setAttribute(attribute, value);
    } else {
      element.removeAttribute(attribute);
    }
  }
  return added;
};
