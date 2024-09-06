import { Component, Prop, State, Element, h, Host, Event, EventEmitter, Fragment, Watch } from '@stencil/core';
import { MediaPosition } from '../configurator/types';
import CssClassList from '../../../types/css-class-list.interface';
import _ds from '../../../../typescript/dot-stash';

let globalFieldId = 0;

@Component({
  tag: 'pronto-field',
  styleUrl: "field.scss",
})
export class ProntoField {

  @Element() hostContainer: HTMLProntoFieldElement;

  @Prop() defaultValue: string;
  @Prop() type: string;
  @Prop() label: string;
  @Prop() positions: MediaPosition[];
  @Prop() values: { label: string; value: string; }[];
  @Prop() associatedRoute: string;
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];

  @State() inputProps: any;

  CSSClassList: CssClassList;
  modifiers: string[] = [];

  @Watch('mods')
  modsWatcher(newMods) {
    this.modifiers = [..._ds.props.toArray(newMods), this.type];
    this.CSSClassList = _ds.props.toClassList('pronto-field', this.modifiers);
  }

  @Event() valueChange: EventEmitter;

  constructor() {
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.valueChangeHandler = this.valueChangeHandler.bind(this);
    this.toggleHandler = this.toggleHandler.bind(this);
    this.inputModalChangeHandler = this.inputModalChangeHandler.bind(this);
    this.inputDateChangeHandler = this.inputDateChangeHandler.bind(this);
    this.clearButtonClickHandler = this.clearButtonClickHandler.bind(this);
    this.buttonConfigChangeHandler = this.buttonConfigChangeHandler.bind(this);
    this.inputCmsChangeHandler = this.inputCmsChangeHandler.bind(this);
    this.featuresChangeHandler = this.featuresChangeHandler.bind(this);
    this.titleConfigChangeHandler = this.titleConfigChangeHandler.bind(this);
    this.inputProductChangeHandler = this.inputProductChangeHandler.bind(this);
    this.panelsChangeHandler = this.panelsChangeHandler.bind(this);
    this.inputProductsChangeHandler = this.inputProductsChangeHandler.bind(this);
  }

  componentWillLoad() {
    const name = this.hostContainer.getAttribute("name");
    const id = `${name}-${globalFieldId++}`;
    let { positions, type, defaultValue: value } = this;
    
    if (type === "switch") {
      /* const checked = value; */
      value = typeof value === "boolean" ? name : value;
    }

    const inputProps: any = {
      value,
      type,
      id,
      name
    }

    if (positions) {
      inputProps.mediaPositions = positions;
    }

    this.inputProps = inputProps;
    this.modifiers = [..._ds.props.toArray(this.mods), this.type];
    this.CSSClassList = _ds.props.toClassList('pronto-field', this.modifiers);
    /* console.log(inputProps); */
  }

  componentDidLoad() {}

  valueChangeHandler(value: any) {
    const { inputProps: { name } } = this;
    this.valueChange.emit({ name, value });
  }

  inputChangeHandler(event: InputEvent) {
    const { target } = event;
    this.valueChangeHandler((target as HTMLInputElement).value);
  }

  selectChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();

    const { detail: { selectedOption: { value } } } = event;
    this.valueChangeHandler(value);
  }

  toggleHandler(event: CustomEvent) {
    const { detail: { checked } } = event;
    this.valueChangeHandler(checked);
  }

  inputModalChangeHandler({detail: { value }}) {
    this.valueChangeHandler(value);
  }

  inputDateChangeHandler(event: CustomEvent) {
    const { detail: { value } } = event;
    this.valueChangeHandler(value);
  }

  inputProductChangeHandler(event: CustomEvent) {
    const { detail: { value } } = event;
    this.valueChangeHandler(value);
  }

  inputCmsChangeHandler(event: CustomEvent) {
    const { detail: { value } } = event;
    this.valueChangeHandler(value);
  }

  inputProductsChangeHandler(event: CustomEvent) {
    const { detail: { value } } = event;
    this.valueChangeHandler(value);
  }

  clearButtonClickHandler() {
    this.inputProps.value = "";
    this.valueChangeHandler('');
  }

  buttonConfigChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { detail: { value } } = event;
    this.valueChangeHandler(value);
  }

  featuresChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { detail: { config: value, name } } = event;

    if (this.inputProps.name === name) {
      this.valueChangeHandler(value);
    }
  }

  panelsChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { detail: { config: value, name } } = event;

    if (this.inputProps.name === name) {
      this.valueChangeHandler(value);
    }
  }

  titleConfigChangeHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    const { detail: { value } } = event;

    this.valueChangeHandler(value);
  }

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
        }}
      >

        <label htmlFor={this.inputProps.name} class="pronto-field__label">{this.label}</label>

        <div class="pronto-field__input">

          {this.inputProps.type === "select" && this.values && (
            <ds-select name={this.inputProps.name} onValueChange={this.selectChangeHandler}>
              <option value="" selected={this.values.find( ({value}) => value === this.inputProps.value) === undefined}>Sélectionner</option>
              {this.values.map( ({value, label}) => <option value={value} selected={value === this.inputProps.value}>{label}</option>)}
            </ds-select>
          )}

          {(this.inputProps.type === "text" || this.inputProps.type === "number") && (
            <Fragment>
              <input
                {...{type: this.inputProps.type, ...this.inputProps} }
                onChange={this.inputChangeHandler}
                onInput={this.inputChangeHandler}
                onBlur={this.inputChangeHandler}
              />
              <ds-trigger class="pronto-field__clear-button" onClick={this.clearButtonClickHandler} type="button">X</ds-trigger>
            </Fragment>
          )}
          
          {this.inputProps.type === "switch" && (
            <ds-toggle 
              onToggle={this.toggleHandler} 
              name={this.inputProps.name} 
              checked={this.inputProps.value} 
            />
          )}

          {this.inputProps.type === "date" && (
            <ds-input-date 
              {...this.inputProps}
              onValueChange={this.inputDateChangeHandler}
            />
          )}
          
          {this.inputProps.type === "button" && (
            <ds-button-configurator 
              {...this.inputProps}
              onValueChange={this.buttonConfigChangeHandler}  
              inputId={"button"} 
            />
          )}

          {this.inputProps.type === "title" && (
            <ds-title-configurator 
              {...this.inputProps}
              inputId={"title"}
              onValueChange={this.titleConfigChangeHandler}
            />
          )}

          {this.inputProps.type === "simple-title" && (
            <ds-title-configurator 
              {...this.inputProps} 
              inputId={"title"} 
              toolbar="bold" 
              validElements="a[href]" 
              onValueChange={this.titleConfigChangeHandler} 
            />
          )}

          {this.inputProps.type === "product" && (
            <ds-product-search
              route={this.associatedRoute} 
              onValueChange={this.inputProductChangeHandler}
              {...this.inputProps}
            />
          )}

          {this.inputProps.type === "products-block" && (
            <ds-products-configurator
              route={this.associatedRoute} 
              /* onValueChange={this.inputProductsChangeHandler} */
              {...this.inputProps}
            />
          )}

          {this.inputProps.type === "products" && (
            <pronto-product-list
              onValueChange={this.inputProductsChangeHandler}
              {...this.inputProps}
            />
          )}

          {this.inputProps.type === "features" && (
            <ds-features-configurator 
              {...this.inputProps} 
              settings={this.inputProps.value} 
              onConfigChange={this.featuresChangeHandler} 
              showActions={false}
            />
          )}

          {this.inputProps.type === "panels" && (
            <ds-panels-configurator 
              {...this.inputProps} 
              settings={this.inputProps.value} 
              onConfigChange={this.panelsChangeHandler} 
              showActions={false}
            />
          )}

         {/*  {this.inputProps.type === "cms" && (
            <ds-cms-search
              route={this.associatedRoute} 
              onValueChange={this.inputCmsChangeHandler}
              {...this.inputProps}
            />
          )}

 */}
          {this.inputProps.type === "media" && (
            <ds-media
              {...this.inputProps} 
              onValueChange={this.inputModalChangeHandler}  
            />
          )}

          {this.inputProps.type === "html" && (
            <ds-html
              {...this.inputProps} 
              onValueChange={this.inputModalChangeHandler}  
            />
          )}

        </div>
      </Host>
    );
  }
}