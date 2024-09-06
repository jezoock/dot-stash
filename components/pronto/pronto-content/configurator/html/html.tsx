import { Element, Component, h, Host, Prop, Event, EventEmitter, State, Method } from '@stencil/core';

let globalHTMLModalId = 0;

@Component({
  tag: 'ds-html',
})
export class DSHTMLModal {
  @Element() host: HTMLDsInputModalElement;

  @Prop() name: string;
  @Prop({ mutable: true }) value: any;

  @State() showModal: boolean; 

  inputId: string;

  @Event() valueChange: EventEmitter;

  @Method()
  async show() {
    this.toggle(true);
  }

  @Method()
  async hide() {
    this.toggle(false);
  }

  @Method()
  async toggle(mustShow?: boolean) {
    const { showModal } = this;
    this.showModal = typeof mustShow === "boolean" ? mustShow : !showModal;
  }

  /* For HTML Editor */
  /* @Listen('valueChange') */
  valueChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { name } = this;
    const {detail: { value }} = event;
    this.value = value;
    this.valueChange.emit({ value, name });
  }

  /* @Listen('requestCloseModal')
  requestCloseModalHandler() {
    this.hide();
  } */

  constructor() {
    this.inputClickHandler = this.inputClickHandler.bind(this);
    this.modalCloseHandler = this.modalCloseHandler.bind(this);
    this.modalSaveHandler = this.modalSaveHandler.bind(this);
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
    this.clearButtonClickHandler = this.clearButtonClickHandler.bind(this);
  }

  componentWillLoad() {
    this.inputId = `input-modal-${globalHTMLModalId++}`;
    this.host.setAttribute("id", this.inputId);
  }

  inputClickHandler() {
    this.show();
  }

  modalCloseHandler() {
    this.hide();
  }

  modalSaveHandler(event: CustomEvent) {
    const { name } = this;
    const {detail: { value }} = event;
    this.value = value;
    this.hide();
    this.valueChange.emit({ value, name });
  }

  clearButtonClickHandler() {
    /* this.setPath(""); */
  }

  render() {
    return (
      <Host class={{
          "ds-input-modal": true,
        }}
      >

        <input
          type="text"
          name={this.inputId}
          value={this.value}
          onClick={this.inputClickHandler}
        />
        
        {this.showModal && (
          <pronto-modal
            overlay
            onModalClose={this.modalCloseHandler}
          >
            <ds-html-editor
              onValueChange={this.valueChangeHandler} 
              onCancel={this.modalCloseHandler} 
              onSave={this.modalSaveHandler} 
              content={this.value} 
              name={this.inputId}
            />
          </pronto-modal>
        )}

        <ds-trigger class="pronto-field__clear-button" onClick={this.clearButtonClickHandler} type="button">X</ds-trigger>

      </Host>
    );
  }
}