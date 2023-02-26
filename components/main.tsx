import { Component, h, Method } from '@stencil/core';

const mapStyles = [
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#d3d3d3"
          }
      ]
  },
  {
      "featureType": "transit",
      "stylers": [
          {
              "color": "#808080"
          },
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#b3b3b3"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#ffffff"
          },
          {
              "weight": 1.8
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#d7d7d7"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#ebebeb"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#a7a7a7"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#efefef"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#696969"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#737373"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#d6d6d6"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {},
  {
      "featureType": "poi",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#dadada"
          }
      ]
  }
];

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

  componentDidLoad() { }

  render() {
    return (
      <div class="ds-components-demo">
        <ds-title section sub>test</ds-title>
        <ds-map
          api-key="***REMOVED***"
          params={{
            useCluster: true,
            mapStyles: [{ name: "newStyles", styles: mapStyles }]
          }}
        >
          <ds-location lat={-34.397} lng={150.644} name="Test 7">
            <div>
              <ds-title mods="main">test</ds-title>
              <h2>dsfjhsdfjs</h2>
              <p>sdfjkhsdfjksdkjfjksdf</p>
            </div>
          </ds-location>
          <ds-location lat={-37.397} lng={152.644} name="Test 8" />
          <ds-location lat={-39.397} lng={154.644} name="Test 9" />
          <div slot="controls">
          {/* <button type="button" onClick={() => this.setZoom(2)}>zoom min</button>
          <button type="button" onClick={() => this.setZoom(22)}>zoom max</button>
          <button type="button" onClick={() => this.zoomIn()}>zoomin</button>
          <button type="button" onClick={() => this.zoomOut()}>zoomOut</button>
          <button type="button" onClick={() => this.fitMarkers()}>fit</button> */}
          {/* <ds-map-rc action='setZoom:[5, { "name": "bob"}, [1,2,3]]'>test</ds-map-rc> */}
          <ds-map-rc action='setZoom:[5]'>test</ds-map-rc>
          <ds-map-rc action="setZoom:[10]">test</ds-map-rc>
          <ds-map-rc action="zoomIn">test</ds-map-rc>
          <ds-map-rc action="zoomOut">test</ds-map-rc>
          <ds-map-rc action="fitMarkers">test</ds-map-rc>
          </div>
        </ds-map>

          {/* <ds-block>
          <ds-title>
            Buttons
          </ds-title>
          


          <ds-grid class="ds-button-list" ds-cols="5" ds-h-gap="1" ds-v-gap="1" ds-type="fixed">
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button id="button" mods={["solid", "primary", "xs"]} onDsButtonClick={() => (document.querySelector('#button') as any).mods = ["solid", "primary", "xl"] }>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button mods={["solid", "primary", "sm"]}>Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button mods={["solid", "primary", "md"]} disabled>
                <div slot="before">Before sdkjfh sjkdf</div>
                <div>Click me !</div>
                <div slot="after">After</div>
              </ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
              <ds-button
                data-use-rsp
                data-rsp={{
                'sm': {
                  mods: ["solid", "primary", "sm"]
                },
                'md': {
                  mods: ["solid", "primary", "md"]
                },
                'lg': {
                  mods: ["solid", "primary", "lg"]
                }
              }} mods={["solid", "primary", "lg"]}>Mods Click me !</ds-button>
            </ds-grid-item>
            <ds-grid-item class="ds-buttton-list__item" dsRatio={1}>
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
          </ds-grid>
        </ds-block> */}
      </div>
    );
  }
}
