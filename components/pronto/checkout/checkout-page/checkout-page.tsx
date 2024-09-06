import { Component, h, Prop, Watch, Element, State, Event, EventEmitter } from '@stencil/core';
import _ds from '../../../../typescript/dot-stash';

@Component({
  tag: 'ds-checkout-page',
  styleUrl: 'checkout-page.scss'
})
export class DSCheckoutPage {
  CSSClassList: any;

  @Element() container: HTMLElement;
  @Prop() mods: string | string[] = "";
  @Prop() showBackButton = false;
  @State() isButtonShown = false;

	@Watch('mods')
  dsModsWatcher( newMods ) {
    this.CSSClassList = _ds.props.toClassList("ds-checkout-page", newMods);
  }

  @Event() panelShow: EventEmitter;

	constructor() {
    this.backButtonClickHandler = this.backButtonClickHandler.bind(this);
  }
	
  connectedCallback() {
    const currentStepTitle = this.container.querySelector("h1.--current");
    if (currentStepTitle) {
      this.isButtonShown = parseInt(currentStepTitle.getAttribute("data-position")) > 1;
    }
    this.isButtonShown = this.isButtonShown || _ds.props.isTrue(this.showBackButton);
  }

	componentWillLoad() {
		this.CSSClassList = _ds.props.toClassList("ds-checkout-page", this.mods);
	}

  componentDidLoad() {
    const currentStepTitle = this.container.querySelector("h1.--current");
    const position = parseInt(currentStepTitle?.getAttribute("data-position")||"1") - 1;

    if(position <= 2) {
      this.isButtonShown = false;
    }

    const paymentButton = document.querySelector("#payment-confirmation ds-trigger");
    const paymentOptions = Array.from( document.querySelectorAll('input[type="radio"][name="payment-option"]') );
    const cgvCheckbox = document.querySelector("#conditions-to-approve input[type='checkbox']");
    
    if (paymentButton) {
      paymentOptions.map( option => option.addEventListener("click", () => {
        const cgvAccepted = (cgvCheckbox as any)?.checked;

        if (cgvAccepted) {
          paymentButton.removeAttribute("disabled");
        }
      } ));

      cgvCheckbox.addEventListener("click", (event) => {
        const { target } = event;
        const disabled = !(target as any)?.checked;
        if (disabled) {
          paymentButton.setAttribute("disabled", "true");
        } else {
          paymentButton.removeAttribute("disabled");
        }
      });
    }
  }

  backButtonClickHandler() {
    if (!_ds.props.isTrue(this.showBackButton)) {
      const currentStepTitle = this.container.querySelector("h1.--current");
      const currrentStepContent = this.container.querySelector(".ds-checkout-step.--current");
      const position = parseInt(currentStepTitle.getAttribute("data-position")) - 1;
      const selector = `[data-position="${position.toString()}"]`;
      const previousStepTitle = this.container.querySelector(`.ds-checkout-page__header h1${selector}`);
      const previousStepContent = this.container.querySelector(`.ds-checkout-step${selector}`);

      if(position <= 2) {
        this.isButtonShown = false;
      }

      currrentStepContent.classList.add("--close");
      currrentStepContent.classList.remove("--current");
      previousStepContent.classList.remove("--close");
      previousStepContent.classList.add("--current");
      
      currentStepTitle.classList.add("--close");
      currentStepTitle.classList.remove("--current");
      previousStepTitle.classList.remove("--close");
      previousStepTitle.classList.add("--current");
    }
  }
  
  render() {
    return (
      <div class={this.CSSClassList}>
        <header class="ds-checkout-page__header">
          <ds-title page mods="checkout">
            <slot name="header" />
          </ds-title>
          {this.isButtonShown && (
            <ds-trigger
              type="button" 
              mods="sm"
              onClick={this.backButtonClickHandler}
            >
              <slot name="back-button" />
            </ds-trigger>
          )}
        </header>

        <div class="ds-checkout-page__body">
          <div class="ds-checkout-page__content">
            <slot name="content" />
          </div>
          <aside class="ds-checkout-page__cart-summary">
            <slot name="cart-summary" />
          </aside>
        </div>
        
        <footer class="ds-checkout-page__footer">
          <slot name="footer" />
        </footer>
      </div>
    );
  }
}