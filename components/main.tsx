import { Component, h, Method } from '@stencil/core/internal';
/* import { mapStyles } from './map-styles'; */

@Component({
  tag: 'ds-main',
  styleUrl: './global.scss',
})
export class DSMainTest {
  data: Record<string, any> = {
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

  @Method()
  async getData(key: string) {
    const keys = key.split('.');
    let pointer = this.data;

    keys.forEach(key => {
      pointer = pointer[key];
    });
    const data = pointer;
    return data;
  }

  changeHandler = event => {
    console.log(event);
  };

  render() {
    return (
      <div class="ds-components-demo">
        <ds-app></ds-app>
         {/* <ds-title section sub>test</ds-title>
        <ds-map
          api-key="***REMOVED***"
          params={{
            useCluster: false,
            mapStyles: [{ name: "newStyles", styles: mapStyles }]
          }}
        >
          <ds-map-marker lat={-39.397} lng={155.644} label="JEz" name="Test 9" />
          <ds-map-marker lat={-34.397} lng={150.644} name="Test 7">
            <ds-info-window>
              <div class="bob">
                <ds-title mods="main" slot="header"><span>test</span></ds-title>
                <h2>dsfjhsdfjs</h2>
                <p>sdfjkhsdfjksdkjfjksdf</p>
              </div>
            </ds-info-window>
          </ds-map-marker>
          <ds-location lat={-39.397} lng={155.644} name="Test 9" />
          <div slot="controls">

          <ds-control action='setZoom:[5, { "name": "bob"}, [1,2,3]]'>test</ds-control>
          <ds-control action='setZoom:[5]'>test</ds-control>
          <ds-control action="setZoom:[10]">test</ds-control>
          <ds-control action="zoomIn">test</ds-control>
          <ds-control action="zoomOut">test</ds-control>
          <ds-control action="fitMarkers">test</ds-control>
          </div>
        </ds-map>  */}

        {/* <ds-sidebar position='right'>
          sdfhlsdfklsdfk
          <div>sdkfljsdklfkl</div>
          <ds-trigger on="click" action='toggle'>fermer</ds-trigger>
        </ds-sidebar>
         */}
        <ds-slider style={{"height":"4rem"}} id="bob">
          
          <ds-slider-item class="ds-slider__item">sdfkdfjskdfjkkjsdf 1</ds-slider-item>
          <ds-slider-item class="ds-slider__item">sdfkdfjskdfjkkjsdf 2</ds-slider-item>
          <ds-slider-item class="ds-slider__item">sdfkdfjskdfjkkjsdf 3</ds-slider-item>
          <ds-slider-item class="ds-slider__item">sdfkdfjskdfjkkjsdf</ds-slider-item>
          <ds-slider-item class="ds-slider__item">sdfkdfjskdfjkkjsdf</ds-slider-item>
          <ds-slider-item class="ds-slider__item">sdfkdfjskdfjkkjsdf</ds-slider-item>
          <ds-slider-item class="ds-slider__item">
            <ds-button><strong>test </strong><span slot="before">sdfkdfjskdfjkkjsdf 0000</span></ds-button>
          </ds-slider-item>
        </ds-slider>
        <ds-trigger type="button" mods="lg" target="#bob" action='prev'>prev</ds-trigger>
        <ds-trigger type="button" mods="lg" target="#bob" action='next'>next</ds-trigger>

          {/* <ds-header slot="block-header">
            <ds-button slot="before">
              Retour
              <ds-icon type="back" slot="before" />
            </ds-button>
            <h2 slot="title">Titre de block</h2>
            <p slot="sub-title">Sous-titre de block de test</p>
            <div>Plein de texte ne plus parce que c'est la classe à dallas.</div>
            <ds-button slot="after">
              <ds-icon type="close" slot="after" />
              Fermer
            </ds-button>
          </ds-header>

          <ds-block>
            <ds-header slot="block-header">
              <ds-button slot="before">
                Retour
                <ds-icon type="back" slot="before" />
              </ds-button>
              <h2 slot="title">Titre de block</h2>
              <p slot="sub-title">Sous-titre de block de test</p>
              <div>Plein de texte ne plus parce que c'est la classe à dallas.</div>
              <ds-button>
                <ds-icon type="close" slot="after" />
                Fermer
              </ds-button>
            </ds-header>

          </ds-block> */}
<section class="ds-homepage__history">
            <ds-block section ext="homepage-history">
              <header slot="block-header">
                <ds-header>
                  <ds-button slot="before">
                    Retour
                    <ds-icon type="back" slot="before" />
                  </ds-button>
                  <h2 slot="title">Titre de block</h2>
                  <p slot="sub-title">Sous-titre de block de test</p>
                  <ds-block block>
                    <div slot="block-header">sfhsdhfg</div>
                  </ds-block>
                  <div>Plein de texte ne plus parce que c'est la classe à dallas.</div>
                  <ds-button slot="after">
                    <ds-icon type="close" slot="after" />
                    Fermer
                  </ds-button>
                </ds-header>
              </header>
                

            </ds-block>
          </section>

          <section class="ds-homepage__history">
            {/* <ds-block section ext="homepage-history">
              <ds-button slot="before">
                Retour
                <ds-icon type="back" slot="before" />
              </ds-button>
              <h2 slot="title">Titre de block</h2>
              <p slot="sub-title">Sous-titre de block de test</p>
            </ds-block> */}
            <ds-panel-group>
              <ds-panel type="tab" index={0}>
                <h1 slot="title">Title</h1>
                <div>Contenu<br />Contenu<br />Contenu<br />Contenu<br />Contenu<br /></div>
              </ds-panel>
              <ds-panel type="tab" index={1}>
                <h1 slot="title">Title 2</h1>
                <div>Contenusdfsdf<br />Csdfontenu<br />Contenusdfsdf<br />Csdfontenu<br />Contsdfenu<br />Contesdfsdfnu<br />Cosdfsfdntenu<br /></div>
              </ds-panel>
              <ds-panel type="tab" index={2}>
                <h1 slot="title">Title 3</h1>
                <div>Contenusdfsdf<br />Csdfontenu<br />Contenusdfsdf<br />Csdfontenu<br />Contsdfenu<br />Contesdfsdfnu<br />Cosdfsfdntenu<br /></div>
              </ds-panel>
            </ds-panel-group>
          </section>

        {/* 
          <ds-block>
            <ds-title slot="header">
              Default button
            </ds-title>
            <ds-grid
              class="ds-button-list"
              hGap="10px"
              type="fluid"
              cols="3"
            >
              <ds-grid-item width={2}>
                <ds-button mods="default,sm">Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item>
                <ds-button mods={["default", "md"]}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item>
                <ds-button mods={["default", "lg"]}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item>
                <ds-button mods="default,sm">Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item>
                <ds-button mods={["default", "md"]}>Click me !</ds-button>
              </ds-grid-item>
              <ds-grid-item>
                <ds-button mods={["default", "lg"]}>Click me !</ds-button>
              </ds-grid-item>
            </ds-grid>
          </ds-block> */}

<ds-rsp>
        <ds-block>
          <ds-grid
            data-use-rsp
            class="ds-button-list"
            cols={5}
            hGap="10px"
            vGap="1rem"
            type="fixed"
          >
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button id="button" mods={["solid", "primary", "xs"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item
              class="ds-buttton-list__item"
              width={1}
              data-use-rsp
              data-rsp={{
                "xs": {"width": 2},
                "sm": {"width": 3},
                "md": {"width": 4},
                "lg": {"width": 5}
              }}
            >
              <ds-button mods={["solid", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["solid", "primary", "md"]} disabled>
                <div slot="before">Before sdkjfh sjkdf</div>
                <div>Click me !</div>
                <div slot="after">After</div>
              </ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button
                mods={["solid", "primary", "lg"]}>Mods Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["solid", "primary", "xl"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "xs"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "md"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "lg"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "xl"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "xs"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "md"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "lg"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button mods={["outlined", "primary", "xl"]}>Click me !</ds-button>
            </ds-grid-item>
          </ds-grid>
        </ds-block>
        </ds-rsp>
      </div>
    );
  }
}
