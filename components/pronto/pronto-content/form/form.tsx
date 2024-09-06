import { Component, h, Host, Prop, State, Event, EventEmitter, Watch } from '@stencil/core';
import CssClassList from '../../../types/css-class-list.interface';
import _ds from '../../../../typescript/dot-stash';


@Component({
  tag: 'pronto-form',
  styleUrl: "form.scss"
})
export class ProntoForm {
  
  @Prop({ mutable: true }) fields: any[] = [];
  @Prop({ reflect: true }) size: "sm" | "md" | "lg" | "xl";
  @Prop({ mutable: true, reflect: true }) mods: string | string[] = [];

  @State() processedFields = [];

  CSSClassList: CssClassList;
  modifiers: string[] = [];

  @Watch('mods')
  modsWatcher(newMods) {
    this.modifiers = [..._ds.props.toArray(newMods), this.size];
    this.CSSClassList = _ds.props.toClassList('pronto-form', this.modifiers);
  }

  @Event() valueChange: EventEmitter;


  /* @Listen("fieldChange")
  feldChangeHandler({detail: { name, value }}) {
    console.log("here");
    this.valueChange.emit({name, value});
  } */

  /* @Listen('valueChange')
  valueChangeHandler( { detail }) {
    console.log(detail);
  } */

  componentWillLoad() {
    this.modifiers = [..._ds.props.toArray(this.mods), this.size];
    this.CSSClassList = _ds.props.toClassList('pronto-form', this.modifiers);
  }

  render() {
    return (
      <Host
        class={{
          ...this.CSSClassList,
        }}
      >
        
        <ds-title form class="pronto-form__title">
          <slot name="title" />
        </ds-title>

        {this.fields.map( inputProps => {
          let ComponentTag = "pronto-field";
          let componentProps = { ...inputProps };

          if (Array.isArray(inputProps.type)) {
            const config = inputProps.defaultValue;
            ComponentTag = "pronto-fieldset";
            componentProps.depth = 0;
            if (this.modifiers.length) {
              componentProps.mods = [ this.modifiers ];
            }

            componentProps.fields = inputProps.type.map( ({ name, label, type, values, positions }) => {
              return ({
                label,
                name,
                type,
                defaultValue: config && typeof config[name] !== "undefined" ? config[name] : type === "switch" ? false : "",
                values,
                positions
              })
            });
          }

          return <ComponentTag {...componentProps} />
/* 
          return Array.isArray(inputProps.type)
            ? <pronto-fieldset 
                {...inputProps} 
                depth={0} 
                fields={inputProps.type} 
              />
            : <pronto-field {...inputProps} /> */
        })}

        <slot />

        <footer class="pronto-form__footer">
          <slot name="footer" />
        </footer>
      </Host>
    );
  }
}