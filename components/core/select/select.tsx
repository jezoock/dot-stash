import { Component, h, Method, Prop, State, Event, Host, Element, EventEmitter, Listen } from '@stencil/core';
import { toClassList } from '../../utils/props';

/** Whether a native control is disabled: its own `disabled`, or a disabled `<fieldset>` around it (`:disabled`). */
const isDisabledControl = (control: HTMLElement | null | undefined): boolean => {
  if (!control) {
    return false;
  }
  try {
    return control.matches(':disabled');
  } catch {
    // A DOM without the pseudo-class (the simulated DOM of the spec tests).
    return control.hasAttribute('disabled');
  }
};

/**
 * A native `select` (its `option` elements are the children of the component), transparent over a box that shows the
 * label of the selected option. The native select keeps its role, its keyboard and its list: name it with `label`
 * (`aria-label`), `labelledby` (`aria-labelledby`), a `<label>` around the component or a `<label for>` with the `name`
 * (the id of the select).
 * The native select is the form control: it submits its value under the `name`, the browser validates it (`required`),
 * a disabled fieldset disables it, and the box follows a form reset.
 *
 * @slot - The `option` (and `optgroup`) elements of the select.
 */
@Component({
  tag: 'ds-select',
  styleUrl: 'select.scss',
})
export class DSSelect {
  @Element() hostContainer: HTMLElement;

  @State() value: string = '';
  /** The label of the selected option, shown in the box (`__label`) and returned by `getValue()`. */
  @State() selectedLabel: string = '';
  @State() opened: boolean;
  /** Whether the validity of the select is shown (`aria-invalid`, `--invalid`): after an `invalid` event or a change by the user, until a form reset. */
  @State() isValidityShown = false;
  /** Whether the native select is invalid (a required select on a placeholder), read after each render and change. */
  @State() isInvalid = false;

  /** The `name` of the native select, and its `id` (a `<label for>` with it names the select). */
  @Prop() name: string;
  /** Disables the native select: it cannot be focused or changed, and submits nothing. A disabled `<fieldset>` around it does the same. */
  @Prop({ reflect: true }) disabled: boolean;
  /**
   * Makes the native select required: the form is not submitted while its selected option is a placeholder (a first
   * option with an empty value), and the browser shows its own message.
   */
  @Prop({ reflect: true }) required: boolean;
  /** Comma-separated list (or array) of modifiers, rendered as `--<modifier>` classes on the component. */
  @Prop({ reflect: true }) mods: string | string[] = [];
  @Prop({ reflect: true, mutable: true }) defaultValue: string;
  /** The accessible name of the select (`aria-label`), without a visible label. */
  @Prop() label: string;
  /** The ids of the elements that name the select (a visible label): its `aria-labelledby`. */
  @Prop() labelledby: string;

  @Event() valueChange: EventEmitter;

  /** The option the box shows when the component loads: the native select selects it too. */
  private initialOption: HTMLOptionElement | undefined;
  /** The native select, once rendered. */
  private select: HTMLSelectElement;

  @Method()
  async getValue() {
    const { value, selectedLabel: label } = this;
    return { value, label };
  }

  /** Reads the validity of the native select (none in a DOM without constraint validation). */
  updateValidity() {
    const isInvalid = this.select?.validity ? !this.select.validity.valid : false;

    if (isInvalid !== this.isInvalid) {
      this.isInvalid = isInvalid;
    }
  }

  /** The box shows the option the native select has selected. */
  showSelectedOption() {
    const [selectedOption] = Array.from(this.select?.selectedOptions ?? []);
    if (selectedOption) {
      this.selectedLabel = selectedOption.innerHTML;
      this.value = selectedOption.value;
    }
    return selectedOption;
  }

  inputChangeHandler = () => {
    if (!isDisabledControl(this.select)) {
      const selectedOption = this.showSelectedOption();
      // Changed by the user: its validity shows (as :user-invalid).
      this.isValidityShown = true;
      this.updateValidity();
      this.valueChange.emit({ selectedOption });
    }
  };

  inputClickHandler = () => {
    if (!this.disabled && !isDisabledControl(this.select)) {
      const { opened } = this;
      this.opened = !opened;
    }
  };

  inputFocusOutHandler = () => {
    this.opened = false;
  };

  /** `checkValidity()` or `reportValidity()` of the select or of its form, or a submission, found it invalid: it shows it. */
  inputInvalidHandler = () => {
    this.isValidityShown = true;
    this.updateValidity();
  };

  /**
   * The form of the select is reset: the browser selects its default option again (without a `change` event), after the
   * `reset` event. The box shows it, and the validity is no longer shown.
   */
  @Listen('reset', { target: 'document' })
  formResetHandler(event: Event) {
    // Its form owner (the closest form in a DOM without the `form` property).
    const select = this.select;
    const form = select && ('form' in select ? select.form : (select as HTMLElement).closest('form'));

    if (form && event.target === form) {
      setTimeout(() => {
        this.showSelectedOption();
        this.isValidityShown = false;
        this.updateValidity();
      });
    }
  }

  connectedCallback() {
    let selectedOption = this.hostContainer.querySelector('option[selected]') as HTMLOptionElement;
    if (!selectedOption) {
      Array.from(this.hostContainer.querySelectorAll('option')).map(option => option.selected && (selectedOption = option));
    }
    if (!selectedOption) {
      Array.from(this.hostContainer.querySelectorAll('option')).map((option, index) => index === 0 && (selectedOption = option));
    }
    if (selectedOption) {
      this.selectedLabel = selectedOption.innerHTML;
      this.value = selectedOption.value;
    }
    this.initialOption = selectedOption;
  }

  componentWillLoad() {
    if (this.defaultValue) {
      this.value = this.defaultValue;
    }
  }

  /**
   * Without a `selected` option, the native select may select another option than the first one, which the box shows:
   * the options are moved into it one by one. It selects the option of the box, so that the value assistive
   * technologies read and a form sends is the one on the screen.
   */
  componentDidLoad() {
    const option = this.initialOption;

    if (option && option.closest('select') && !option.selected) {
      option.selected = true;
    }
  }

  /** After a render (`required`, `disabled`, the options), the validity of the native select may have changed: read once the render is over. */
  componentDidRender() {
    Promise.resolve().then(() => this.updateValidity());
  }

  render() {
    const isInvalid = this.isInvalid;
    const isInvalidShown = this.isValidityShown && isInvalid;

    return (
      <Host
        class={{
          ...toClassList('ds-select', this.mods),
          '--opened': this.opened,
          '--disabled': this.disabled,
          '--invalid': isInvalidShown,
        }}
        onClick={this.inputClickHandler}
      >
        {/* The value the select itself gives to assistive technologies: hidden from them, not to be read twice. */}
        <div class="ds-select__label" aria-hidden="true">
          {this.selectedLabel}
        </div>
        <select
          class="ds-select__input"
          name={this.name}
          id={this.name}
          disabled={this.disabled}
          required={this.required}
          aria-label={this.labelledby ? undefined : this.label}
          aria-labelledby={this.labelledby}
          // Invalid but not shown yet: "false", as the browser would tell assistive technologies it is invalid from the start.
          aria-invalid={isInvalidShown ? 'true' : isInvalid ? 'false' : undefined}
          ref={element => (this.select = element)}
          onFocusout={this.inputFocusOutHandler}
          onChange={this.inputChangeHandler}
          onInvalid={this.inputInvalidHandler}
        >
          <slot />
        </select>
      </Host>
    );
  }
}
