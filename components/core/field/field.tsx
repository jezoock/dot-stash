import { Component, Element, h, Host, Listen, Method, Prop, State, Watch } from '@stencil/core';
import { getErrorMessage, isDisabledControl, updateIdRefs } from '../../utils/form-control';
import { formatPluralLabel } from '../../utils/labels';
import { fromJSON, toClassList } from '../../utils/props';
import uuid from '../../utils/uuid';
import { DS_FIELD_COUNTER_DELAY, DS_FIELD_INPUT_TYPES, DSFieldDefaultLabels } from './field.constants';
import { DSFieldLabels, DSFieldMessages } from './field.types';

/** The control of a field: a native `input`, `textarea` or `select` (the select of a `ds-select` too). */
type FieldControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** What the field shows of its control, as classes of the field. */
interface FieldState {
  kind?: 'input' | 'textarea' | 'select' | 'ds-select';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  password?: boolean;
  passwordShown?: boolean;
  prefix?: boolean;
  suffix?: boolean;
}

/** The elements the field renders around its control. */
interface FieldParts {
  label?: HTMLLabelElement;
  mark?: HTMLElement;
  toggle?: HTMLButtonElement;
  hint?: HTMLElement;
  error?: HTMLElement;
  counter?: HTMLElement;
  status?: HTMLElement;
}

/** The attributes in the field (of its control, mostly) whose changes the field follows; `disabled` is followed in the whole document. */
const OBSERVED_ATTRIBUTES = ['id', 'type', 'required', 'readonly', 'maxlength', 'minlength', 'pattern', 'min', 'max', 'step', 'slot', 'aria-describedby'];

/** The fields of the document, told when a `disabled` attribute changes in it: that of their control, or of a `<fieldset>` around it. */
const disabledListeners = new Set<() => void>();
let disabledObserver: MutationObserver | undefined;

/** Calls `listener` when a `disabled` attribute changes in the document (one observer for every field). Returns the function that stops. */
const watchDisabled = (listener: () => void): (() => void) => {
  if (typeof MutationObserver !== 'function') {
    return () => undefined;
  }
  disabledListeners.add(listener);
  if (!disabledObserver) {
    disabledObserver = new MutationObserver(() => disabledListeners.forEach(each => each()));
    disabledObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['disabled'], subtree: true });
  }
  return () => {
    disabledListeners.delete(listener);
    if (!disabledListeners.size) {
      disabledObserver?.disconnect();
      disabledObserver = undefined;
    }
  };
};

const tagOf = (node: Node) => node.nodeName.toLowerCase();

/** The type of an input, as the browser gives it (`text` without one). */
const inputType = (input: Element) => ((input as HTMLInputElement).type || input.getAttribute('type') || 'text').toLowerCase();

/** A control the field enhances: a `textarea`, a `select`, an `input` of a text box, a date or a time. */
const isFieldControl = (element: Element): element is FieldControl =>
  ['textarea', 'select'].includes(tagOf(element)) || (tagOf(element) === 'input' && DS_FIELD_INPUT_TYPES.includes(inputType(element)));

/** The value of a control (the content of a textarea in a DOM without its `value`). */
const valueOf = (control: FieldControl): string => (typeof control.value === 'string' ? control.value : (control.textContent ?? ''));

const setText = (element: HTMLElement, text: string) => {
  if (element.textContent !== text) {
    element.textContent = text;
  }
};

/** Sets an attribute (`null`: removes it), when it changes. */
const setAttribute = (element: Element, name: string, value: string | null) => {
  if (value === null) {
    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
    }
  } else if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
};

/**
 * A form field around a native control the page writes in it: an `input` (a text box: text, email, number, tel, url,
 * search, password; a date or a time), a `textarea`, a `select` or a `ds-select`. The field renders a label, a hint, an
 * error message, a character counter and a password toggle around the control, and links them to it (`<label for>`,
 * `aria-describedby`); the control stays the form control: it is submitted, autofilled, validated and restored by the
 * browser as without the field, which never creates, moves nor names a form control, and submits nothing.
 *
 * The error message shows once the user should see it, as `:user-invalid`: after an `invalid` event of the control (a
 * submission, `checkValidity()`, `reportValidity()`) or once the user changed its value (`change`), until it is valid or
 * the form is reset. Its text is the message of the browser, or `messages` and `error-message`.
 *
 * @slot - The control: a direct child of the field, for the layout of the theme. A `<label for>` of the page in the field replaces `label`.
 * @slot hint - An element with `slot="hint"`: a hint with markup, instead of `hint`, described by the control.
 * @slot prefix - An element with `slot="prefix"`, before the control in its box: a unit, a currency or an icon. With a text, the control describes it; without, it is hidden from assistive technologies.
 * @slot suffix - An element with `slot="suffix"`, after the control in its box, as `prefix`.
 */
@Component({
  tag: 'ds-field',
  styleUrl: 'field.scss',
})
export class DSField {
  @Element() host: HTMLElement;

  /**
   * The label of the control: a `<label for>` rendered before it (the control gets an id if it has none), with the
   * required mark of `labels` while the control is `required`. A `<label>` of the page in the field replaces it.
   */
  @Prop() label: string;
  /** A hint under the control (`__hint`), which the control describes (`aria-describedby`). An element with `slot="hint"` replaces it. */
  @Prop() hint: string;
  /**
   * The error messages per validity flag of the control (JSON as an attribute), instead of the message of the browser:
   * `{"valueMissing": "Enter your email address", "typeMismatch": "Enter an email address, like name@example.com"}`. The
   * flags: `valueMissing`, `badInput`, `typeMismatch`, `patternMismatch`, `tooLong`, `tooShort`, `rangeUnderflow`,
   * `rangeOverflow`, `stepMismatch`. A custom error of the page (`setCustomValidity()`) shows its own message.
   */
  @Prop() messages: DSFieldMessages | string = {};
  /** The error message of the flags that have none in `messages`, instead of the message of the browser. */
  @Prop() errorMessage: string;
  /**
   * Shows the number of characters left under a control with a `maxlength` (`__counter`), which the control describes;
   * screen readers are told the count once the user stops typing.
   */
  @Prop() counter: boolean;
  /** The texts of the field (JSON as an attribute), to translate them: `required`, `showPassword`, `counterRemaining`, `counterOver` (see the readme). */
  @Prop() labels: DSFieldLabels | string = {};
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];

  /** What the field shows of its control, as classes. */
  @State() state: FieldState = {};

  /** Unique, and stable for the life of the element: the prefix of the ids of the parts. */
  private rootId = `ds-field-${uuid()}`;
  /** The control, once found. */
  private control: FieldControl | null = null;
  private parts: FieldParts = {};
  /** The nodes the field created: their changes are not changes of the page. */
  private ownNodes = new WeakSet<Node>();
  /** The ids the field added to the `aria-describedby` of the control. */
  private describedIds: string[] = [];
  /** The ids the field gave to elements of the page that had none (the control, a hint, a prefix or a suffix). */
  private generatedIds = new Map<Element, string>();
  /** The prefixes and suffixes the field hid from assistive technologies (`aria-hidden`). */
  private hiddenAffixes = new Set<Element>();
  /** The `aria-invalid` of the control before the field set it: `undefined` while the field has not set it. */
  private ariaInvalidBefore: string | null | undefined;
  /** Whether the validity is shown: after an `invalid` event or a change by the user, until a form reset. */
  private isValidityShown = false;
  /** Whether the control is a password input, and whether the password is shown (the input is then of type `text`). */
  private isPassword = false;
  private isPasswordShown = false;
  /**
   * The selection of the password input when the user toggled it, given back the next time the input takes the focus
   * (the browser would select the whole value on a Tab, which the next key would replace).
   */
  private toggledSelection: [number, number, 'forward' | 'backward' | 'none' | undefined] | undefined;
  /** The text of the counter, which screen readers are told once the user stops typing. */
  private counterText = '';
  private announceTimer: ReturnType<typeof setTimeout> | undefined;
  private observer: MutationObserver | undefined;
  private stopWatchingDisabled: () => void = () => undefined;

  /**
   * Reads the control again and updates the field: after a change that no event or attribute tells, as a value set by a
   * script (the counter) or a custom error set or cleared out of an event (`setCustomValidity()`).
   */
  @Method()
  async refresh() {
    this.sync();
  }

  @Watch('label')
  @Watch('hint')
  @Watch('messages')
  @Watch('errorMessage')
  @Watch('counter')
  @Watch('labels')
  propsWatcher() {
    this.sync();
  }

  connectedCallback() {
    if (typeof MutationObserver === 'function') {
      this.observer = new MutationObserver(records => {
        if (records.some(record => !this.isOwnMutation(record))) {
          this.sync();
        }
      });
      this.observer.observe(this.host, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: OBSERVED_ATTRIBUTES });
    }
    this.stopWatchingDisabled = watchDisabled(this.syncHandler);
    this.sync();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
    this.stopWatchingDisabled();
    this.detach();
    (Object.keys(this.parts) as (keyof FieldParts)[]).forEach(name => this.removePart(name));
  }

  //#region EVENTS

  /** A value typed or chosen: the counter (told to screen readers once the user stops typing), and the error once shown. */
  @Listen('input')
  inputHandler(event: Event) {
    this.sync();
    if (event.target === this.control && this.parts.status) {
      clearTimeout(this.announceTimer);
      this.announceTimer = setTimeout(() => this.parts.status && setText(this.parts.status, this.counterText), DS_FIELD_COUNTER_DELAY);
    }
  }

  /** A value changed by the user (committed: a text box once it loses the focus): its validity shows, as `:user-invalid`. */
  @Listen('change')
  changeHandler(event: Event) {
    this.sync(event.target);
  }

  /**
   * `checkValidity()` or `reportValidity()` of the control or of its form, or a submission, found the control invalid
   * (the event does not bubble: in the capture phase). The error shows before the browser focuses the control, which then
   * gives it to assistive technologies with its description.
   */
  @Listen('invalid', { capture: true })
  invalidHandler(event: Event) {
    this.sync(event.target);
  }

  /** The password input takes the focus after a toggle: the selection it had when the user toggled it (a click then places the caret). */
  @Listen('focusin')
  focusInHandler(event: Event) {
    const input = this.control as HTMLInputElement;
    if (event.target === input && this.toggledSelection) {
      const [start, end, direction] = this.toggledSelection;
      this.toggledSelection = undefined;
      input.setSelectionRange(Math.min(start, input.value.length), Math.min(end, input.value.length), direction);
    }
  }

  /** The form of the control is reset: the password hidden at once, the validity no longer shown once the browser reset the values. */
  @Listen('reset', { target: 'document' })
  formResetHandler(event: Event) {
    if (!this.control || event.target !== this.formOf(this.control)) {
      return;
    }
    this.showPassword(false);
    this.toggledSelection = undefined;
    setTimeout(() => {
      if (!event.defaultPrevented) {
        this.isValidityShown = false;
        clearTimeout(this.announceTimer);
        if (this.parts.status) {
          setText(this.parts.status, '');
        }
        this.sync();
      }
    });
  }

  /** The form of the control is submitted: the password is hidden, so that the browser does not keep it as a text (form history, autofill). */
  @Listen('submit', { target: 'document', capture: true })
  formSubmitHandler(event: Event) {
    if (this.control && event.target === this.formOf(this.control)) {
      this.showPassword(false);
    }
  }

  /** The page is left: the password is hidden, and so is it when the page comes back from the back/forward cache. */
  @Listen('pagehide', { target: 'window' })
  pageHideHandler() {
    this.showPassword(false);
  }

  private syncHandler = () => this.sync();

  private toggleClickHandler = () => {
    const input = this.control as HTMLInputElement;
    if (input && !isDisabledControl(input)) {
      this.showPassword(!this.isPasswordShown);
      if (typeof input.selectionStart === 'number' && document.activeElement !== input) {
        this.toggledSelection = [input.selectionStart, input.selectionEnd, input.selectionDirection ?? undefined];
      }
    }
  };

  //#endregion

  /** The form of a control: its form owner (the closest form in a DOM without the `form` property). */
  private formOf(control: FieldControl): HTMLFormElement | null {
    const { form } = control;
    return form && typeof form === 'object' ? form : form === null ? null : control.closest('form');
  }

  /** Whether a mutation is one of the field itself: a part rendered, removed or changed. */
  private isOwnMutation(record: MutationRecord): boolean {
    const isOwn = (node: Node | null) => {
      for (let current = node; current && current !== this.host; current = current.parentNode) {
        if (this.ownNodes.has(current)) {
          return true;
        }
      }
      return false;
    };

    if (record.type === 'childList' && record.target === this.host) {
      return [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)].every(node => this.ownNodes.has(node));
    }
    return isOwn(record.target);
  }

  /** The control of the field: its first `input`, `textarea` or `select` it enhances (not one of a field in it). */
  private findControl(): FieldControl | null {
    const controls = Array.from(this.host.querySelectorAll('input, textarea, select')) as Element[];
    return (controls.find(element => isFieldControl(element) && element.closest('ds-field') === this.host) as FieldControl) ?? null;
  }

  /** A child of the field with a `slot` attribute (`hint`, `prefix`, `suffix`). */
  private slotted(name: string): HTMLElement | undefined {
    return (Array.from(this.host.children) as HTMLElement[]).find(child => child.getAttribute('slot') === name && !this.ownNodes.has(child));
  }

  /** The id of an element of the page; one is generated (and removed when the field lets the element go) when it has none. */
  private idOf(element: Element, name: string): string {
    if (!element.id) {
      const id = `${this.rootId}-${name}`;
      element.setAttribute('id', id);
      this.generatedIds.set(element, id);
    }
    return element.id;
  }

  private parse<T>(value: T | string, name: string): T {
    try {
      return (fromJSON(value ?? {}) ?? {}) as T;
    } catch {
      console.error(`[ds-field] ${name} is not valid JSON`);
      return {} as T;
    }
  }

  private part<K extends keyof FieldParts>(name: K, tag: string, className: string, attributes: Record<string, string> = {}): NonNullable<FieldParts[K]> {
    if (!this.parts[name]) {
      const element = document.createElement(tag);
      element.setAttribute('class', className);
      Object.entries(attributes).forEach(([attribute, value]) => element.setAttribute(attribute, value));
      this.ownNodes.add(element);
      this.parts[name] = element as FieldParts[K];
    }
    return this.parts[name];
  }

  private removePart(name: keyof FieldParts) {
    const element = this.parts[name];
    if (element) {
      element.parentNode?.removeChild(element);
      delete this.parts[name];
    }
  }

  /** Sets the `aria-invalid` of the control (`null`: gives back the one it had before). */
  private setAriaInvalid(control: FieldControl, value: string | null) {
    if (value !== null) {
      if (this.ariaInvalidBefore === undefined) {
        this.ariaInvalidBefore = control.getAttribute('aria-invalid');
      }
      setAttribute(control, 'aria-invalid', value);
    } else if (this.ariaInvalidBefore !== undefined) {
      setAttribute(control, 'aria-invalid', this.ariaInvalidBefore);
      this.ariaInvalidBefore = undefined;
    }
  }

  /** Shows or hides the password (the type of its input): the input keeps its value, and its selection. */
  private showPassword(isShown: boolean) {
    const input = this.control as HTMLInputElement;
    if (!input || !this.isPassword || isShown === this.isPasswordShown) {
      return;
    }
    const { selectionStart: start, selectionEnd: end, selectionDirection: direction } = input;

    this.isPasswordShown = isShown;
    input.type = isShown ? 'text' : 'password';
    if (typeof start === 'number' && typeof end === 'number' && typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(start, end, direction ?? undefined);
    }
    this.sync();
  }

  /** Lets the control go: the attributes the field gave it and the elements of the page back as they were. */
  private detach() {
    const control = this.control;

    if (control) {
      this.describedIds = updateIdRefs(control, 'aria-describedby', this.describedIds, []);
      this.setAriaInvalid(control, null);
      if (this.isPasswordShown) {
        (control as HTMLInputElement).type = 'password';
      }
    }
    this.generatedIds.forEach((id, element) => element.id === id && element.removeAttribute('id'));
    this.generatedIds.clear();
    this.hiddenAffixes.forEach(affix => affix.removeAttribute('aria-hidden'));
    this.hiddenAffixes.clear();
    this.ariaInvalidBefore = undefined;
    this.toggledSelection = undefined;
    this.control = null;
    this.isValidityShown = this.isPassword = this.isPasswordShown = false;
    this.counterText = '';
    clearTimeout(this.announceTimer);
  }

  private setState(state: FieldState) {
    const keys = new Set([...Object.keys(state), ...Object.keys(this.state)] as (keyof FieldState)[]);
    if ([...keys].some(key => state[key] !== this.state[key])) {
      this.state = state;
    }
  }

  /**
   * Finds the control, and updates the parts, the attributes of the control and the classes of the field. Synchronous, so
   * that the control is described and invalid before the browser focuses it after an `invalid` event. `showValidityOf`:
   * the target of an event that shows the validity of the control.
   */
  private sync(showValidityOf?: EventTarget | null) {
    const control = this.findControl();
    const host = this.host;

    if (control !== this.control) {
      this.detach();
      this.control = control;
    }
    if (!control) {
      (Object.keys(this.parts) as (keyof FieldParts)[]).forEach(name => this.removePart(name));
      this.setState({});
      return;
    }
    if (showValidityOf && showValidityOf === control) {
      this.isValidityShown = true;
    }

    const labels: Required<DSFieldLabels> = { ...DSFieldDefaultLabels, ...this.parse(this.labels, 'labels') };
    const tag = tagOf(control);
    const kind: FieldState['kind'] = control.closest('ds-select') && host.contains(control.closest('ds-select')) ? 'ds-select' : (tag as FieldState['kind']);
    const isTextBox = tag === 'input' || tag === 'textarea';

    // A password input: its type is `text` while the field shows the password.
    const type = tag === 'input' ? inputType(control) : '';
    if (type === 'password') {
      this.isPassword = true;
      this.isPasswordShown = false;
    } else if (!(this.isPassword && this.isPasswordShown && type === 'text')) {
      this.isPassword = this.isPasswordShown = false;
    }

    const isRequired = control.hasAttribute('required');
    const { validity } = control;
    const isInvalid = !!validity && control.willValidate !== false && validity.valid === false;
    const isInvalidShown = this.isValidityShown && isInvalid;
    const controlId = this.idOf(control, 'control');

    // The label: a <label for> of the control, before everything, unless the field holds a <label> of the page.
    const pageLabel = Array.from(host.querySelectorAll('label')).find(label => !this.ownNodes.has(label) && label.closest('ds-field') === host);
    if (this.label && !pageLabel) {
      const label = this.part('label', 'label', 'ds-field__label');
      setAttribute(label, 'for', controlId);
      if (!label.firstChild || !this.ownNodes.has(label.firstChild)) {
        const text = document.createTextNode('');
        this.ownNodes.add(text);
        label.insertBefore(text, label.firstChild);
      }
      if (label.firstChild.textContent !== this.label) {
        label.firstChild.textContent = this.label;
      }
      // The required mark: decorative, as the control is required for assistive technologies.
      if (isRequired && labels.required) {
        const mark = this.part('mark', 'span', 'ds-field__required', { 'aria-hidden': 'true' });
        setText(mark, labels.required);
        if (mark.parentNode !== label) {
          label.appendChild(mark);
        }
      } else {
        this.removePart('mark');
      }
      if (host.firstChild !== label) {
        host.insertBefore(label, host.firstChild);
      }
    } else {
      this.removePart('label');
      this.removePart('mark');
    }

    // The prefix and the suffix: described by the control with a text, hidden from assistive technologies without.
    const affixIds: string[] = [];
    const affixes = { prefix: this.slotted('prefix'), suffix: this.slotted('suffix') };
    Object.entries(affixes).forEach(([name, affix]) => {
      if (!affix) {
        return;
      }
      if ((affix.textContent ?? '').trim()) {
        affixIds.push(this.idOf(affix, name));
        if (this.hiddenAffixes.delete(affix)) {
          affix.removeAttribute('aria-hidden');
        }
      } else if (!affix.hasAttribute('aria-hidden')) {
        affix.setAttribute('aria-hidden', 'true');
        this.hiddenAffixes.add(affix);
      }
    });

    // The password toggle: a button (not submitted), after the control.
    if (this.isPassword) {
      if (!this.parts.toggle) {
        this.part('toggle', 'button', 'ds-field__toggle', { type: 'button' }).addEventListener('click', this.toggleClickHandler);
      }
      const toggle = this.parts.toggle;
      setAttribute(toggle, 'aria-label', labels.showPassword);
      setAttribute(toggle, 'aria-pressed', String(this.isPasswordShown));
      // Disabled with its input (a disabled fieldset around the field disables both).
      setAttribute(toggle, 'disabled', control.hasAttribute('disabled') ? '' : null);
      let anchor: Node = control;
      while (anchor.parentNode && anchor.parentNode !== host) {
        anchor = anchor.parentNode;
      }
      if (anchor.nextSibling !== toggle) {
        host.insertBefore(toggle, anchor.nextSibling);
      }
    } else {
      this.removePart('toggle');
    }

    // The hint: an element of the page with slot="hint", else `hint`.
    let hintId: string | undefined;
    const pageHint = this.slotted('hint');
    if (pageHint) {
      this.removePart('hint');
      hintId = this.idOf(pageHint, 'hint');
    } else if (this.hint) {
      const hint = this.part('hint', 'div', 'ds-field__hint', { id: `${this.rootId}-hint` });
      setText(hint, this.hint);
      hintId = hint.id;
    } else {
      this.removePart('hint');
    }

    // The error message, once shown.
    const message = isInvalidShown ? getErrorMessage(validity, control.validationMessage, this.parse(this.messages, 'messages'), this.errorMessage) : '';
    if (message) {
      setText(this.part('error', 'div', 'ds-field__error', { id: `${this.rootId}-error` }), message);
    } else {
      this.removePart('error');
    }

    // The counter: visible (described by the control) and, once the user stops typing, told by a polite live region.
    const maxLength = isTextBox ? parseInt(control.getAttribute('maxlength') ?? '', 10) : NaN;
    if (this.counter && maxLength >= 0) {
      const left = maxLength - valueOf(control).length;
      const lang = host.closest('[lang]')?.getAttribute('lang') || undefined;
      const counter = this.part('counter', 'div', 'ds-field__counter', { 'id': `${this.rootId}-counter`, 'aria-hidden': 'true' });
      this.counterText = left >= 0 ? formatPluralLabel(labels.counterRemaining, left, lang) : formatPluralLabel(labels.counterOver, -left, lang);
      setText(counter, this.counterText);
      setAttribute(counter, 'class', left >= 0 ? 'ds-field__counter' : 'ds-field__counter --over');
      this.part('status', 'div', 'ds-field__status', { 'aria-live': 'polite', 'aria-atomic': 'true' });
    } else {
      this.removePart('counter');
      this.removePart('status');
      this.counterText = '';
      clearTimeout(this.announceTimer);
    }

    // The parts under the control, last, in this order.
    let next: Node | null = null;
    [this.parts.status, this.parts.counter, this.parts.error, this.parts.hint].forEach(part => {
      if (part) {
        if (part.parentNode !== host || part.nextSibling !== next) {
          host.insertBefore(part, next);
        }
        next = part;
      }
    });

    this.describedIds = updateIdRefs(control, 'aria-describedby', this.describedIds, [...affixIds, hintId, this.parts.error?.id, this.parts.counter?.id].filter(Boolean));
    // ds-select sets the aria-invalid of its select itself, with the same rule.
    if (kind !== 'ds-select') {
      // Invalid but not shown yet: "false", as the browser would tell assistive technologies it is invalid from the start.
      this.setAriaInvalid(control, isInvalidShown ? 'true' : isInvalid ? 'false' : null);
    }

    this.setState({
      kind,
      disabled: isDisabledControl(control),
      readOnly: isTextBox && control.hasAttribute('readonly'),
      required: isRequired,
      invalid: isInvalidShown,
      password: this.isPassword,
      passwordShown: this.isPasswordShown,
      prefix: !!affixes.prefix,
      suffix: !!affixes.suffix,
    });
  }

  render() {
    const { kind, disabled, readOnly, required, invalid, password, passwordShown, prefix, suffix } = this.state;

    return (
      <Host
        class={{
          ...toClassList('ds-field', this.mods),
          ...(kind ? { [`--${kind}`]: true } : {}),
          '--disabled': !!disabled,
          '--readonly': !!readOnly,
          '--required': !!required,
          '--invalid': !!invalid,
          '--password': !!password,
          '--password-shown': !!passwordShown,
          '--prefix': !!prefix,
          '--suffix': !!suffix,
        }}
      ></Host>
    );
  }
}
