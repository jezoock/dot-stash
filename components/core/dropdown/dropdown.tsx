import { Component, h, Prop, State, Event, EventEmitter, Element, Method } from '@stencil/core';
import uuid from '../../utils/uuid';
import { DSOption } from './dropdown.types';

@Component({
  tag: 'ds-dropdown',
  /* styleUrl: "combo.scss" */
})
export class DSDropdown {
  @Element() container: HTMLElement;

  @Prop({ reflect: true }) name: string;
  @Prop({ mutable: true, reflect: true }) customLabel = '';
  @Prop() multiple = false;
  @Prop() overlay = false;
  @Prop() position = 'left';
  @Prop({ mutable: true }) selectedOption: DSOption[] = [];
  @Prop({ mutable: true, reflect: true }) selected: DSOption = {
    id: '',
    index: -1,
    name: '',
    value: '',
  };

  @State() uid = uuid();
  @State() showCombo = false;
  @State() options: HTMLDsDropdownItemElement[] = [];

  @Event() optionSelected: EventEmitter;

  @Method()
  async close() {
    const body = document.querySelector('body');
    body.removeEventListener('click', this.bodyClickHandler);
    this.showCombo = false;
  }

  @Method()
  async open() {
    const body = document.querySelector('body');
    body.addEventListener('click', this.bodyClickHandler);
    this.showCombo = true;
  }

  @Method()
  async toggle(forceDisplay?: boolean) {
    const show = typeof forceDisplay !== 'undefined' ? forceDisplay : !this.showCombo;

    if (show) {
      this.open();
    } else {
      this.close();
    }
  }

  constructor() {
    this.bodyClickHandler = this.bodyClickHandler.bind(this);
    this.toggle = this.toggle.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  componentDidLoad() {
    const options = Array.from(this.container.querySelectorAll('ds-dropdown-item'));
    this.options = options;
  }

  selectOption(event: Event) {
    if (!this.multiple) {
      this.toggle();
    } else {
      event.stopPropagation();
    }
  }

  bodyClickHandler(e) {
    if (!(e.target as HTMLDivElement).closest(`.ds-dropdown-${this.uid}`)) {
      this.close();
    }
  }

  render() {
    return (
      <div
        id={'ds-dropdown-' + (this.name || [...(document.querySelectorAll('ds-dropdown') as any)].length.toString())}
        class={{
          'ds-dropdown': true,
          '--open': this.showCombo,
          [`--position-${this.position}`]: true,
          '--with-overlay': this.overlay,
        }}
      >
        {this.overlay && <div class="ds-dropdown__overlay" onClick={this.close} />}
        <div
          class="ds-dropdown__selected-option"
          onClick={() => {
            this.toggle();
          }}
        >
          {this.multiple && (
            <span>
              {this.name}
              {this.selectedOption.length > 0 && <span>({this.selectedOption.length})</span>}
            </span>
          )}
          {!this.multiple && <span>{this.customLabel || (this.selectedOption.length > 0 && this.selectedOption[0]?.name) || this.options[0]?.name}</span>}
        </div>
        {this.showCombo && (
          <menu>
            <div
              class={{
                'ds-dropdown__options': true,
                '--hidden': !this.showCombo,
              }}
            >
              <slot />
            </div>
          </menu>
        )}
      </div>
    );
  }
}
