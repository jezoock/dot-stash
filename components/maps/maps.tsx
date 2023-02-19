import { Component, h, Prop } from '@stencil/core';
import { Element } from '@stencil/sass/dist/declarations';

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


@Component({
  tag: 'ds-maps',
  styleUrl: 'maps.scss'
})
export class DSMaps {

  @Element() mapContainer;

  @Prop() locations: any[];


  map: any;

  async init(apiKey?, CALLBACK = 'initMap') {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${CALLBACK}`;
    script.onerror = () => console.log("error");
    script.onload = () => {
      const styledMapType = new window['google'].maps.StyledMapType( mapStyles, { name: "Styled Map" });
      this.map = new window['google'].maps.Map(this.mapContainer.querySelector('.ds-maps__map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });
      this.map.mapTypes.set("styled_map", styledMapType);
      this.map.setMapTypeId("styled_map");

      new window['google'].maps.Marker({
        position: { lat: -34.397, lng: 150.644 },
        map: this.map,
        title: "Hello World!",
      });
      new window['google'].maps.Marker({
        position: { lat: -34, lng: 150 },
        map: this.map,
        title: "Hello World!",
      });
    }
    document.querySelector('head').appendChild(script);
  }

  async componentDidLoad(){
    window['initMap'] = () => console.log("dfssdfsdfdf")
      await this.init('***REMOVED***');
      
      if (this.locations) {
          /* const markers = this.locations
              .map(location => {
                  const marker = new window['google'].maps.Marker({
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

          if (this.cluster) {
              new MarkerClusterer(this.map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
          } */
      }
  }
  
  render() {
    return (
      <div class="ds-maps">
        <div class="ds-maps__map">
        </div>
        <div class="ds-maps__controls"></div>
      </div>
    );
  }
}