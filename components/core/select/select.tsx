import { Component, h, Method, Prop, State, Event, Host, Element, EventEmitter } from '@stencil/core';
import { toClassList } from '../../utils/props';

/**
 * A native `select` (its `option` elements are the children of the component), transparent over a box that shows the
 * label of the selected option. The native select keeps its role, its keyboard and its list: name it with `label`
 * (`aria-label`), `labelledby` (`aria-labelledby`), a `<label>` around the component or a `<label for>` with the `name`
 * (the id of the select).
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

  /** The `name` of the native select, and its `id` (a `<label for>` with it names the select). */
  @Prop() name: string;
  /** Disables the native select: it cannot be focused or changed. */
  @Prop({ reflect: true }) disabled: boolean;
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

  @Method()
  async getValue() {
    const { value, selectedLabel: label } = this;
    return { value, label };
  }

  inputChangeHandler = () => {
    if (!this.disabled) {
      const select = this.hostContainer.querySelector('select');
      const [selectedOption] = Array.from(select.selectedOptions);
      if (selectedOption) {
        this.selectedLabel = selectedOption.innerHTML;
        this.value = selectedOption.value;
      }
      this.valueChange.emit({ selectedOption });
    }
  };

  inputClickHandler = () => {
    if (!this.disabled) {
      const { opened } = this;
      this.opened = !opened;
    }
  };

  inputFocusOutHandler = () => {
    this.opened = false;
  };

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

  render() {
    return (
      <Host
        class={{
          ...toClassList('ds-select', this.mods),
          '--opened': this.opened,
          '--disabled': this.disabled,
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
          aria-label={this.labelledby ? undefined : this.label}
          aria-labelledby={this.labelledby}
          onFocusout={this.inputFocusOutHandler}
          onChange={this.inputChangeHandler}
        >
          <slot />
        </select>
      </Host>
    );
  }
}
