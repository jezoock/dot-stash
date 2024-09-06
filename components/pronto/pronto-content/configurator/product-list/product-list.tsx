import { Component, h, Host, Prop, State, Event, EventEmitter } from '@stencil/core';


@Component({
  tag: 'pronto-product-list',
  /* styleUrl: 'product-list.css' */
})
export class ProntoProductListConfigurator {

  @Prop() value: any[] = [];
  @Prop() inputProps: any;
  @Prop() associatedRoute: string;

  @State() products: any[];

  @Event() valueChange: EventEmitter;

  constructor() {
    this.addProductButtonClickHandler = this.addProductButtonClickHandler.bind(this);
    this.inputProductChangeHandler = this.inputProductChangeHandler.bind(this);
  }

  componentWillLoad() {
    this.products = this.value;
  }

  inputProductChangeHandler() {

  }

  addProductButtonClickHandler() {
    const { products } = this;
    this.products = [...products, ''];
    this.valueChange.emit({ value: this.products });
  }
  
  render() {
    console.log(this.associatedRoute);
    return (
      <Host>
        {this.products.map( product => {
          return <ds-product-search
          route={this.associatedRoute} 
          onValueChange={this.inputProductChangeHandler}
          value={product}
        />
        })}
        <ds-trigger type="button" onClick={this.addProductButtonClickHandler}>+ ajouter</ds-trigger>
      </Host>
    );
  }
}