import { Component, h, Method, State } from '@stencil/core';
import { DSComboSelectedEventDetail, DSOption } from '../core/combo/combo.types';

const colorOptions: DSOption[] = [
  { name: 'Choisir une couleur', value: '' },
  { name: 'Rouge', value: 'red' },
  { name: 'Vert', value: 'green' },
  { name: 'Bleu', value: 'blue' },
  { name: 'Or (épuisé)', value: 'gold', disabled: true },
];

const sizeOptions: DSOption[] = [
  { name: 'S', value: 's', selected: true },
  { name: 'M', value: 'm' },
  { name: 'L', value: 'l' },
  { name: 'XL', value: 'xl', disabled: true },
];

const menuOptions: DSOption[] = [
  { name: 'Boutons', value: 'buttons', url: '#demo-buttons' },
  { name: 'Formulaire', value: 'form', url: '#demo-form' },
];

@Component({
  tag: 'ds-main',
  styleUrl: './global.scss',
})
export class DSMainTest {
  data: Record<string, unknown> = {
    mockup: {
      data: {
        name: 'bob',
        description: 'description',
        price: 4.5,
        products: [
          { name: 'raoul', number: 'test5' },
          { name: 'djibril', number: 'test12121212' },
          { name: 'djibril', number: 'test12121212' },
        ],
      },
    },
  };

  @State() comboOutput = '';
  @State() disabledClicks = 0;
  @State() submits = 0;

  optionSelectedHandler = (event: CustomEvent<DSComboSelectedEventDetail>) => {
    const { name, selectedOptions } = event.detail;
    this.comboOutput = `${name} : ${selectedOptions.map(option => option.name).join(', ') || 'aucune sélection'}`;
  };

  disabledButtonClickHandler = () => {
    this.disabledClicks++;
  };

  formSubmitHandler = (event: Event) => {
    event.preventDefault();
    this.submits++;
  };

  @Method()
  async getData(key: string) {
    const keys = key.split('.');
    let pointer: unknown = this.data;

    keys.forEach(key => {
      pointer = (pointer as Record<string, unknown>)[key];
    });
    const data = pointer;
    return data;
  }

  render() {
    return (
      <div class="ds-components-demo">
        <ds-block>
          <ds-toggle type="radio"></ds-toggle>
          <ds-toggle type="checkbox"></ds-toggle>
          <ds-toggle type="switch"></ds-toggle>
        </ds-block>

        <ds-slider style={{ height: '4rem' }} id="bob">
          <ds-slider-item>sdfkdfjskdfjkkjsdf 1</ds-slider-item>
          <ds-slider-item>sdfkdfjskdfjkkjsdf 2</ds-slider-item>
          <ds-slider-item>sdfkdfjskdfjkkjsdf 3</ds-slider-item>
          <ds-slider-item>sdfkdfjskdfjkkjsdf</ds-slider-item>
          <ds-slider-item>sdfkdfjskdfjkkjsdf</ds-slider-item>
          <ds-slider-item>sdfkdfjskdfjkkjsdf</ds-slider-item>
          <ds-slider-item>
            <ds-button>
              <strong>test </strong>
              <span slot="before">sdfkdfjskdfjkkjsdf 0000</span>
            </ds-button>
          </ds-slider-item>
        </ds-slider>
        <ds-trigger type="button" mods="lg" target="#bob" action="prev">
          prev
        </ds-trigger>
        <ds-trigger type="button" mods="lg" target="#bob" action="next">
          next
        </ds-trigger>

        <ds-block>
          <ds-heading slot="header">
            <h1>Titre</h1>
            <h2 slot="sub-title">Sous-titre</h2>
            <p slot="description">Texte d'introduction</p>
          </ds-heading>

          <div>Contenu</div>

          <footer slot="footer">Footer</footer>
        </ds-block>

        <section class="ds-homepage__history">
          <ds-block section name="homepage-history">
            <ds-title-bar slot="header">
              <ds-button slot="before" mods="sm,stl-3">
                Retour
                <ds-icon type="arrow-left" slot="before" />
              </ds-button>
              <ds-heading>
                <h2>Titre de block</h2>
                <h3 slot="sub-title">Sous-titre de block</h3>
                <p slot="description">Description de block de test</p>
              </ds-heading>
              <ds-button slot="after" mods="sm,stl-3">
                <ds-icon type="cancel" slot="after" />
                Fermer
              </ds-button>
            </ds-title-bar>

            <ds-block block>
              <div>sfhsdhfg</div>
            </ds-block>
            <div>Plein de texte ne plus parce que c'est la classe à dallas.</div>

            <footer slot="footer">Footer</footer>
          </ds-block>
        </section>

        <section class="ds-homepage__history">
          <ds-panel-group>
            <ds-panel type="tab" index={0}>
              <h1 slot="title">Title</h1>
              <div>
                Contenu
                <br />
                Contenu
                <br />
                Contenu
                <br />
                Contenu
                <br />
                Contenu
                <br />
              </div>
            </ds-panel>
            <ds-panel type="tab" index={1}>
              <h1 slot="title">Title 2</h1>
              <div>
                Contenusdfsdf
                <br />
                Csdfontenu
                <br />
                Contenusdfsdf
                <br />
                Csdfontenu
                <br />
                Contsdfenu
                <br />
                Contesdfsdfnu
                <br />
                Cosdfsfdntenu
                <br />
              </div>
            </ds-panel>
            <ds-panel type="tab" index={2}>
              <h1 slot="title">Title 3</h1>
              <div>
                Contenusdfsdf
                <br />
                Csdfontenu
                <br />
                Contenusdfsdf
                <br />
                Csdfontenu
                <br />
                Contsdfenu
                <br />
                Contesdfsdfnu
                <br />
                Cosdfsfdntenu
                <br />
              </div>
            </ds-panel>
          </ds-panel-group>
        </section>

        <section class="ds-components-demo__combos">
          <ds-block section name="demo-combos">
            <ds-heading slot="header">
              <h2>Combos</h2>
            </ds-heading>

            <ds-combo id="demo-combo-single" name="couleur" position="right" options={colorOptions} selected={{ value: 'green' }} onOptionSelected={this.optionSelectedHandler} />
            <ds-combo
              id="demo-combo-multiple"
              name="tailles"
              customLabel="Tailles"
              multiple
              position="right"
              options={JSON.stringify(sizeOptions)}
              onOptionSelected={this.optionSelectedHandler}
            />
            <ds-trigger type="button" mods="sm,stl-2" target="#demo-combo-menu" action="toggle">
              Menu
            </ds-trigger>
            <ds-combo id="demo-combo-menu" name="menu" mode="dropdown" options={menuOptions} />

            <p id="demo-combo-output">{this.comboOutput}</p>
          </ds-block>
        </section>

        <ds-rsp>
          <ds-block section name="demo-buttons" id="demo-buttons">
            <ds-heading slot="header">
              <h2>Boutons</h2>
            </ds-heading>

            <ds-grid data-use-rsp class="ds-button-list" cols={5} hGap="10px" vGap="1rem" type="fixed">
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['xs', 'stl-1']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item
                class="ds-button-list__item"
                width={1}
                data-use-rsp
                data-rsp={JSON.stringify({
                  xs: { width: 2 },
                  sm: { width: 3 },
                  md: { width: 4 },
                  lg: { width: 5 },
                })}
              >
                <ds-button mods={['sm', 'stl-1']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['md', 'stl-1']}>
                  <span slot="before">Avant · </span>
                  <span>Click me !</span>
                  <span slot="after"> · Après</span>
                </ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['lg', 'stl-1', 'shadow']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['xl', 'stl-1']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['xs', 'stl-2', 'rounded']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['sm', 'stl-2', 'rounded']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['md', 'stl-2']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['lg', 'stl-3']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button mods={['xl', 'stl-3', 'shadow']}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button id="demo-button-disabled" mods={['md', 'stl-1']} disabled onClick={this.disabledButtonClickHandler}>
                  Désactivé ({this.disabledClicks})
                </ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button id="demo-button-link" mods={['md', 'stl-2']} href="#demo-form">
                  Lien vers le formulaire
                </ds-button>
              </ds-grid-item>
              <ds-grid-item class="ds-button-list__item">
                <ds-button id="demo-button-link-disabled" mods={['md', 'stl-2']} href="#demo-form" disabled>
                  Lien désactivé
                </ds-button>
              </ds-grid-item>
            </ds-grid>
          </ds-block>
        </ds-rsp>

        <form id="demo-form" class="ds-components-demo__form" onSubmit={this.formSubmitHandler}>
          <input name="message" placeholder="Message" aria-label="Message" />
          <ds-button id="demo-button-submit" type="submit" mods={['md', 'stl-1']}>
            Envoyer
          </ds-button>
          <ds-button type="reset" mods={['md', 'stl-3']}>
            Effacer
          </ds-button>
          <output id="demo-form-output">{this.submits > 0 && `Envoyé ${this.submits} fois`}</output>
        </form>
      </div>
    );
  }
}
