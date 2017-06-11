import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { VisitProvider } from '../../providers/visit/visit'
import { RouteProvider } from '../../providers/route/route'
import { WaypointPage } from '../waypoint/waypoint'
import { LocalScienceCacheProvider } from '../../providers/local-science-cache/local-science-cache'
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
 
import 'leaflet';

/**
 * Generated class for the RoutePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-route',
  templateUrl: 'route.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutePage implements OnInit {
  id: any
  map: any
  waypointMarkers:any = []
  waypoints:any = []
  currentRoute: any = null
  currentRouteSubscription: Subscription
  currentLocationSubscription: Subscription
  currentLocationMarker: any
  currentLocation:any = {}
  compass_waypoint = 0
  compass_waypoint_title = 'No Waypoint Loaded.'
  compass_waypoint_number = 0
  compass_waypoint_distance = -1 + ' meters.'
  compass_waypoint_bearing = -1 + '°'
  compass_current_heading:number = -1
  compass_current_accuracy = -1
  compass_current_speed:number = 0
  deg = 0
  deg2 = 0
  onStreet:boolean = true
  mapLayer:string = 'street'
  onVisit:boolean = false
  onVisitSubscription: Subscription
  esriAttribution:string = "ESRI Attrib"
  LAYER_OSM = {
    id: 'arcgistopo',
    name: 'USGS World Topo Map',
    enabled: true,
    layer: L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'National Map USGS Topo'
    })
  }
  LAYER_OCM = {
    id: 'arcgissat',
    name: 'ArcGIS World Imagery',
    enabled: true,
    layer: L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'ArcGIS World Imagery'
    })
  }
  updateTimeSecs = 5

  constructor(public navCtrl: NavController, public navParams: NavParams, public lscService: LocalScienceCacheProvider, public locationTracker: LocationTrackerProvider, public routeProvider: RouteProvider, public visitProvider: VisitProvider, private ref: ChangeDetectorRef) {
    var ticks = 1
    setInterval(() => {
      this.ref.markForCheck();
      if (ticks == this.updateTimeSecs) {
        if (this.onVisit) {
          this.setCurrentLocation()
          if (this.compass_waypoint_number != 0) {
            this.updateWaypointFinder()
          }
        }
        ticks = 1
      } else {
        ticks++
      }
    }, 1000);
  }


  ionViewDidEnter() {
    this.getWayPoints()    
  }

  removeRoute() {
    this.lscService.deleteRoute(this.currentRoute)
    this.navCtrl.pop()
  }

  startVisit() {
    this.visitProvider.setOnVisit(true)
    this.startGPS()
  }

  stopVisit() {
    this.stopGPS()
  }

  startGPS() {
    this.locationTracker.startTracking()
    this.currentLocationSubscription = this.locationTracker._currentLocation.subscribe(currentLocation=> {
      this.currentLocation = currentLocation
    })
  }

  stopGPS() {
    this.locationTracker.stopTracking()
  }

  waypointSelected(waypointId) {
    this.navCtrl.push(WaypointPage, {'id': waypointId})
  }

  previousWaypoint() {
      this.compass_waypoint = this.compass_waypoint - 1;
      if (this.compass_waypoint == -1) {
        this.compass_waypoint = this.waypoints.length - 1;
      }
      this.updateWaypointFinder();
    }

  nextWaypoint() {
    this.compass_waypoint = this.compass_waypoint + 1;
      if (this.compass_waypoint == (this.waypoints.length)) {
        this.compass_waypoint = 0;
      }
      this.updateWaypointFinder();
    }

  updateWaypointFinder() {
      this.compass_waypoint_distance = this.locationTracker.getDistanceFromLatLonInKm(this.currentLocation.coords.latitude,this.currentLocation.coords.longitude,this.waypoints[this.compass_waypoint].lat,this.waypoints[this.compass_waypoint].long).toString()
      this.compass_waypoint_number = this.compass_waypoint + 1;
      this.compass_waypoint_title = this.waypoints[this.compass_waypoint].name;
      if (parseInt(this.waypoints[this.compass_waypoint].distance) > 1000) {
        this.compass_waypoint_distance = Math.round((parseInt(this.waypoints[this.compass_waypoint].distance) / 1000)) + ' kilometers.';
      } else {
        this.compass_waypoint_distance = this.waypoints[this.compass_waypoint].distance + ' meters.';
      }
      var true_bearing = Math.round(parseInt(this.waypoints[this.compass_waypoint].bearing) - this.compass_current_heading);
      if (true_bearing < 0) {
        true_bearing = true_bearing + 360;
      }

      if (this.compass_current_speed <= 0) {
        this.compass_waypoint_bearing = "???";
      } else {
        this.compass_waypoint_bearing = true_bearing + "°";
      }

      this.deg = true_bearing;
      this.deg2 = Math.round(this.compass_current_heading);
    }

  setCurrentLocation() {    
    var currentIcon = L.icon({
        iconUrl: 'assets/images/current_location.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      })
    if (this.currentLocationMarker) {
      this.currentLocationMarker.setLatLng([this.currentLocation.coords.latitude, this.currentLocation.coords.longitude]);
    } else {
      this.currentLocationMarker = L.marker([this.currentLocation.coords.latitude, this.currentLocation.coords.longitude], {icon: currentIcon}).addTo(this.map)
    }
    this.map.panTo(new L.LatLng(this.currentLocation.coords.latitude, this.currentLocation.coords.longitude))
    //{"coords":{"latitude":40.55582776669465,"longitude":-105.1266950090463,"accuracy":5,"altitude":1566.917602539062,"heading":null,"speed":0,"altitudeAccuracy":6},"timestamp":1497121406008.109}

    this.compass_current_heading = Math.round(this.currentLocation.coords.heading);
    this.compass_current_accuracy = this.currentLocation.coords.accuracy;
    this.compass_current_speed = this.currentLocation.coords.speed.toFixed(2);

  }

  getWayPoints() {
    if (this.currentRoute && this.currentRoute.waypoints) {
      var key = 0;
      for (var waypoint of this.currentRoute.waypoints) {
        this.addPoint(waypoint.latitude, waypoint.longitude, waypoint.name, key, waypoint.waypoint_id);
        this.waypoints[key] = {
            index: waypoint.key,
            name: waypoint.name,
            lat: waypoint.latitude,
            long: waypoint.longitude,
            id: waypoint.waypoint_id,
            distance: null,
            bearing: null
        };
        key = key + 1;
      }
    }
    for (var marker of this.waypointMarkers) {
      var thisMarker = L.marker([marker.lat, marker.lng], {icon: marker.icon}).addTo(this.map)
    }
    this.map.panTo(new L.LatLng(this.waypointMarkers[0]['lat'],this.waypointMarkers[0]['lng']))
  }

  addPoint(latitude, longitude, name, key, id) {
      if (typeof(latitude) == 'string') {
        latitude = parseFloat(latitude)
      }
      if (typeof(longitude) == 'string') {
        longitude = parseFloat(longitude)
      }
      if (key === 1) {
        var waypointLatitude = latitude;
        var waypointLongitude = longitude;
      }
      var waypointIcons = [L.icon({
        iconUrl: 'assets/images/waypoint_1.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_2.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_3.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_4.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_5.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_6.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_7.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_8.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      }), L.icon({
        iconUrl: 'assets/images/waypoint_9.png',
        iconSize: [30, 45], // size of the icon
        iconAnchor: [15, 45], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -46] // point from which the popup should open relative to the iconAnchor
      })]
      var html = '<p><strong>' + name + '</strong> - GPS is not currently active.  To get distance to waypoint, you must first start a visit.</p>' + '<a class="button button-small icon-right ion-chevron-right button-calm" ng-href="#/waypoint/' + id + '">View This Waypoint</button>';
      this.map.center = {
        lat: this.getCenterY(),
        lng: this.getCenterX(),
        zoom: this.getDefaultZoom()
      }
      this.map.defaults = {
        scrollWheelZoom: false,
        zoomControlPosition: 'bottomleft',
      }
      this.waypointMarkers[key] = {
        lat: latitude,
        lng: longitude,
        icon: waypointIcons[key],
        message: html,
        focus: false,
        draggable: false
      }
    }

    getCenterX(){
    }

    getCenterY() {
    }

    getDefaultZoom() {
    }

  mapShowSat() {
    this.map.removeLayer(this.LAYER_OSM.layer);
    this.map.addLayer(this.LAYER_OCM.layer);
    this.onStreet = false
    this.mapLayer = 'sat'
  }

  mapShowStreet(){
    this.map.removeLayer(this.LAYER_OCM.layer);
    this.map.addLayer(this.LAYER_OSM.layer);
    this.onStreet = true
    this.mapLayer = 'street'
  }
  
  ngOnInit() {
    this.id = this.navParams.get('id')
    if (this.id) {
      this.routeProvider.getLocalRoute(this.id)
      this.currentRouteSubscription = this.routeProvider._currentRoute.subscribe(currentRoute=> {
        this.currentRoute = currentRoute;
        if (!this.map) {
          this.map = L.map('map', {
            center: [40, -105],
            zoom: 16,
            layers: [this.LAYER_OCM.layer, this.LAYER_OSM.layer]
          })
        }
      })
      this.onVisitSubscription = this.visitProvider._onVisit.subscribe(onVisit=> {
        this.onVisit = onVisit
      })
    }
  }
}
