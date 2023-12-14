import { Component, Element, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { createStore } from '@stencil/store';

const { state: toggleContext } = createStore({
  values: [],
  value: [],
  toggleHandler: null,
  registerToggle: null,
  getValue: null,
});

@Component({
  tag: 'ds-toggle-group',
})
export class DSToggleGroup {
  @Element() host: HTMLDsToggleGroupElement;
  @Prop({ reflect: true }) name: string;
  @Prop({ reflect: true }) disabled: boolean;
  @Prop() count: number[] | string;

  values: any[] = [];
  value: any[] = [];
  @State() toggleContext: any;

  @Listen('toggle')
  onToggle({ target: toggle, detail: { value: toggleValue, checked: isChecked } }) {
    this.toggleHandler(toggle, isChecked, toggleValue);
  }

  @Watch('toggleContext')
  context(newCtx) {
    console.log(newCtx);
  }

  valuesCount: number[] = [1, 1];

  componentWillLoad() {
    toggleContext.toggleHandler = this.toggleHandler;
    toggleContext.getValue = this.getContextValue;
    toggleContext.registerToggle = this.registerToggle;
    this.toggleContext = toggleContext;
  }

  toggleHandler = (toggle, isChecked: boolean, toggleValue) => {
    const {
      value: currentValue,
      valuesCount: [min, max],
    } = this;
    let newValue;
    if (isChecked && !currentValue.includes(toggleValue)) {
      newValue = [...currentValue, toggleValue];
    } else {
      newValue = currentValue.filter(value => value !== toggleValue);
    }
    if (min === 1) {
      this.host.querySelectorAll('ds-toggle').forEach(toggle => {
        if (toggle.value !== toggleValue) {
          toggle.checked = false;
        }
      });
    }
    this.value = newValue;
    this.toggleContext = {
      ...this.toggleContext,
      value: newValue,
    };
  };

  registerToggle = async (isChecked: boolean, value: any) => {
    if (isChecked) {
      this.value.push(value);
    }
    this.values.push(value);
    this.toggleContext = {
      ...this.toggleContext,
      value: this.value,
      values: this.values,
    };
  };

  getContextValue = () => this.toggleContext.value;

  componentDidLoad() {
    this.host.querySelectorAll('ds-toggle').forEach(toggle => toggle.bindToGroup(this.toggleContext));
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
