import { Component, h, Prop } from '@stencil/core';
import { Element, Method } from '@stencil/sass/dist/declarations';

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

export interface Zone {
  name: string;
  zoom: number;
  lat: number;
  lng: number;
}

/* export const EUROPE: Zone = {
  name: "Europe",
  zoom: 5,
  lat: 48.886483489234266, lng: 2.342630624771118,
}; */

export interface Location {
  name: string;
  address: {
    lat: number;
    lng: number;
  }
}

const defaultMapParams = {
	zoom: 9,
	zoomStep: 1,
	center: {
		lat: -34.397,
		lng: 150.644
	},
	useCluster: false,
}

@Component({
  tag: 'ds-maps',
  styleUrl: 'maps.scss'
})
export class DSMaps {

  @Element() mapContainer;

  @Prop() markers: any[];
  @Prop() locations: any[];
	@Prop() apiKey: string;
	@Prop() initializeCallbackName: string;
	@Prop() params: Record<string, unknown> = defaultMapParams;

  map: any;
	zoomLevel = 9; /* 0 to 22 */
	zoomStep = 1;
	ready = false;
	gmaps: any;

	@Method()
	async setZoom(zoomLevel: number) {
		this.zoomLevel = zoomLevel;
		this.map.setZoom(this.zoomLevel);
	}
	
	@Method()
	async zoomIn(scale = this.zoomLevel + this.zoomStep) {
		this.setZoom(scale);
	}
	
	@Method()
	async zoomOut(scale = this.zoomLevel - this.zoomStep) {
		this.setZoom(scale);
	}

	@Method()
	async initialize(apiKey?: string, initializeCallbackName?: string) {
		if (!this.ready) {
			if (typeof window['initMap'] === "undefined") {
				window['initMap'] = () => console.log("[LOG] DSMap initialize: Gamps script succesfully loaded.")
			}
			await this.loadScript(apiKey ?? this.apiKey, initializeCallbackName ?? this.initializeCallbackName);
		}
	}

	@Method()
	async loadScript(apiKey: string, initializeCallback = 'initMap') {
		if (apiKey) {
			const script = document.createElement('script');
	
			script.async = true;
			script.defer = true;
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${initializeCallback}`;
			script.onerror = () => console.log("[ERROR] DSMap intialize: Error loading gmaps script.");
			script.onload = () => {
				this.gmaps = window['google'].maps;
				this.initializeMap();
			}
	
			document.querySelector('head').appendChild(script);
		} else {
			console.log("[ERROR] DSMap intialize: No api key provided.")
		}
	}

	@Method()
	async setMapStyle(mapStyleName: string, mapStyles: Record<string, unknown>[]) {
		const styledMapType = new this.gmaps.StyledMapType( mapStyles, { name: mapStyleName });
		this.map.mapTypes.set("styled_map", styledMapType);
		this.map.setMapTypeId("styled_map");
	}

	async initializeMap() {
		this.map = new this.gmaps.Map(this.mapContainer.querySelector('.ds-maps__map'), this.params);
		const markers= [];
		markers.push(
			new this.gmaps.Marker({
				position: { lat: -34.397, lng: 150.644 },
				map: this.map,
				title: "Hello World!",
			})
		);
		markers.push(
			new this.gmaps.Marker({
				position: { lat: -34, lng: 150 },
				map: this.map,
				title: "Hello World!",
			})
		);

		/* if (this.params.useCluster) {
			new MarkerClusterer(this.map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
		} */

		this.ready = true;
	}

	async componentDidLoad(){
		await this.initialize();
      
      if (this.locations) {
          /* const markers = this.locations
              .map(location => {
                  const marker = this.gmaps.Marker({
                      position: {lat: location.lat, lng: location.lng},
                      map: this.map,
                      title: location.name
                  });
                  return marker;
              }); */

          /* if (this.fitLocations) {
              this.zoomToLocations();
          } else {
              this.zoomToPlace(EUROPE);
          }

           */
      }
  }
  
  render() {
    return (
      <div class="ds-maps">
        <div class="ds-maps__map">
        </div>
        <div class="ds-maps__controls">
					<button type="button" onClick={() => this.setZoom(2)}>zoom min</button>
					<button type="button" onClick={() => this.setZoom(22)}>zoom max</button>
					<button type="button" onClick={() => this.zoomIn()}>zoomin</button>
					<button type="button" onClick={() => this.zoomOut()}>zoomOut</button>
				</div>
      </div>
    );
  }
}