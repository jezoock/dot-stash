import { Component, Element, h, Prop, Watch } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

@Component({
  tag: 'ds-checkout-path',
  styleUrl: 'checkout-path.scss'
})
export class DSCheckoutPath {

  @Element() container;

  @Prop({ mutable: true }) dsCurrentStep: string | number = 0;

  @Watch("dsCurrentStep")
  dsCurrentStepChangeHandler(newStep: number): void {
    const currentStep = this.container.querySelectorAll(`.ds-checkout-path__step`);
    currentStep.forEach( (step, index) => {
      if (index === newStep) {
        step.classList.add('--current');
      } else {
        step.classList.remove('--current');
      }
    })
  }

  constructor() {
    this.dsCurrentStep = _ds.props.toNumber(this.dsCurrentStep);
  }

  componentDidLoad() {
    const currentStep = this.container.querySelectorAll(`.ds-checkout-path__step`)[this.dsCurrentStep];
    currentStep.classList.add('--current');
  }
  
  render() {
    return (
      <div class="ds-checkout-path">
        <slot />
      </div>
    );
  }
}