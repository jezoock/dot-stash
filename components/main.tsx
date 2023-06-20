import { Component, h, Method } from '@stencil/core/internal';

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
        </ds-map> */}

        <ds-section>

        
          <ds-block>
            <ds-title slot="header">
              Default button
            </ds-title>
            <ds-grid
              class="ds-button-list"
              hGap="10px"
              type="fluid"
            >
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
          </ds-block>

        </ds-section>

        {/* <ds-rsp>
          <ds-grid
            data-use-rsp
            class="ds-button-list"
            cols={5}
            hGap="10px"
            vGap="1rem"
            type="fixed"
            data-rsp={JSON.stringify({
              'sm': {
                "cols": 1, "hGap": "10px", "vGap": "1rem"
              },
              'md': {
                "cols": 3, "hGap": "30px", "vGap": "3rem"
              },
              'lg': {
                "cols": 5, "hGap": "50px", "vGap": "5rem"
              }
            })}
          >
            <ds-grid-item class="ds-buttton-list__item">
              <ds-button id="button" mods={["solid", "primary", "xs"]} onDsButtonClick={() => (document.querySelector('#button') as any).mods = ["solid", "primary", "xl"] }>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" width={4}>
              <ds-button mods={["solid", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" width={2}>
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
          </ds-rsp>
        </ds-block> */}
      </div>
    );
  }
}
