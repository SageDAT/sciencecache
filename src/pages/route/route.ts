import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { AlertController } from 'ionic-angular'
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
  map: any = null
  show
  waypointMarkers:any = []
  leafletWaypointMarkers:any = []
  waypoints:any = []
  mapLoaded: boolean = false
  currentRoute: any = null
  currentRouteSubscription: Subscription
  currentLocationSubscription: Subscription
  currentLocationMarker: any
  currentLocation:any = {}
  currentVisit: any = null
  currentVisitSubscription: Subscription;
  compass_waypoint = 0
  compass_waypoint_title = 'No Waypoint Loaded.'
  compass_waypoint_number = 1
  compass_waypoint_distance = -1 + ' meters.'
  compass_waypoint_bearing = -1 + '°'
  compass_current_heading:number = -1
  compass_current_accuracy = -1
  compass_current_speed:number = 0
  showWaypointFinder: boolean = false
  deg = 0
  deg2 = 0
  onStreet:boolean = true
  mapLayer:string = 'street'
  onVisit:boolean = false
  onVisitSubscription: Subscription
  esriAttribution:string = "ESRI Attrib"
  investigatingWaypoint: boolean = false;
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

  constructor(public navCtrl: NavController, public alertController: AlertController, public navParams: NavParams, public lscService: LocalScienceCacheProvider, public locationTracker: LocationTrackerProvider, public routeProvider: RouteProvider, public visitProvider: VisitProvider, private ref: ChangeDetectorRef) {
    var ticks = 1
    setInterval(() => {
      if (this.currentRoute !== null) {
        if (!this.map) {
          this.map = L.map('map', {
            center: [40, -105],
            zoom: 16,
            layers: [this.LAYER_OCM.layer, this.LAYER_OSM.layer]
          })
          this.getWayPoints()
          this.mapLoaded = true
        }
        this.ref.markForCheck();
        if (ticks == this.updateTimeSecs && this.mapLoaded == true) {
          if (this.onVisit) {
            this.setCurrentLocation()
            if (this.compass_waypoint_number != 0) {
              this.updateWaypointFinder()
            }
            this.visitProvider.updateWaypoints()
            this.updateWaypoints()
          }
          ticks = 1
        }
        ticks++
      }
       
    }, 1000);
  }

  waypointFinderToggle() {
    this.showWaypointFinder = !this.showWaypointFinder
    if (this.showWaypointFinder) {
      this.updateTimeSecs = 2
    } else {
      this.updateTimeSecs = 5
    }
  }

  rotate(deg) {
    return 'rotate(' + deg.toString() + 'deg)';
  }

  
  removeRoute() {
    this.lscService.deleteRoute(this.currentRoute)
    this.navCtrl.pop()
  }

  startVisit() {
    this.visitProvider.setOnVisit(true)
    this.currentVisitSubscription = this.visitProvider._currentVisit.subscribe(currentVisit=> {
      this.currentVisit = currentVisit
    })    
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
    this.updateWaypointFinder()
  }

  stopGPS() {
    this.locationTracker.stopTracking()
  }

  waypointSelected(waypointId) {
    this.investigatingWaypoint = true
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
      this.visitProvider.updateWaypoints()
      this.compass_waypoint_number = this.compass_waypoint + 1;
      this.compass_waypoint_title = this.waypoints[this.compass_waypoint].name;
      var compass_distance_meters = Math.round(parseFloat(this.waypoints[this.compass_waypoint].distance))
      if (compass_distance_meters > 1000) {
        this.compass_waypoint_distance = (compass_distance_meters * 1000).toString() + ' kilometers'
      } else {
        this.compass_waypoint_distance = compass_distance_meters.toString() + ' meters'
      }
      var compass_bearing = Math.round(parseFloat(this.waypoints[this.compass_waypoint].bearing))
      if (this.compass_current_speed <= 0) {
        this.compass_waypoint_bearing = compass_bearing.toString() + ' (lkr)'
      } else {
        this.compass_waypoint_bearing = compass_bearing.toString()
      }
      var true_bearing = Math.round(parseInt(this.waypoints[this.compass_waypoint].bearing) - this.compass_current_heading);
      if (true_bearing < 0) {
        true_bearing = true_bearing + 360;
      }
      console.log('COMPASS INFO:')
      console.log(this.compass_waypoint_bearing)
      console.log(this.compass_waypoint_distance)
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
    this.currentLocationMarker.bindPopup('<b>Current Location</b><br />Latitude: ' + this.currentLocation.coords.latitude +'<br />Longitude: ' + this.currentLocation.coords.longitude)
    this.map.panTo(new L.LatLng(this.currentLocation.coords.latitude, this.currentLocation.coords.longitude))
    //{"coords":{"latitude":40.55582776669465,"longitude":-105.1266950090463,"accuracy":5,"altitude":1566.917602539062,"heading":null,"speed":0,"altitudeAccuracy":6},"timestamp":1497121406008.109}

    this.compass_current_heading = Math.round(this.currentLocation.coords.heading);
    this.compass_current_accuracy = this.currentLocation.coords.accuracy;
    this.compass_current_speed = this.currentLocation.coords.speed.toFixed(2);

  }

  updateWaypoints() {
    for (var waypoint of this.currentVisit.waypoints) {
      console.log(waypoint)
      if ((Math.round(parseFloat(waypoint.distance)) < 20) && (!this.investigatingWaypoint)) {
        if (waypoint.alert != true) {
          this.presentAlert(waypoint['id'], waypoint['name'], waypoint['distance'])
          waypoint.alert = true
        }
      }
      this.leafletWaypointMarkers[waypoint['id']].bindPopup(waypoint.message)      
    }    
  }

  ionViewWillEnter() {
    this.investigatingWaypoint = false
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
    if (this.waypointMarkers && this.waypointMarkers[0]['lat'] && this.waypointMarkers[0]['lng']) {
      for (var marker of this.waypointMarkers) {
        console.log(marker)
        this.leafletWaypointMarkers[marker['id']] = L.marker([marker.lat, marker.lng], {icon: marker.icon}).addTo(this.map)
        this.leafletWaypointMarkers[marker['id']].bindPopup(marker.message)
      }
      this.map.panTo(new L.LatLng(this.waypointMarkers[0]['lat'],this.waypointMarkers[0]['lng']))
    } else {
      console.log(this.waypointMarkers)
    }
  }

  addPoint(latitude, longitude, name, key, id) {
      if (typeof(latitude) == 'string') {
        latitude = parseFloat(latitude)
      }
      if (typeof(longitude) == 'string') {
        longitude = parseFloat(longitude)
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
      var html = '<p><strong>' + name + '</strong> - GPS is not currently active.  To get distance to waypoint, you must first start a visit.</p>'// + '<a (click)="clicked()">Click</a>' //+ '<a onclick="{{ waypointSelected(' + id + ') }}">View ' + name + ' Waypoint</a>'
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
        id: id,
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

    presentAlert(index, name, distance) {
      let alert = this.alertController.create({
        title: 'Near a waypoint!',
        subTitle: name,
        message: "You're within " + distance + " meters of the '" + name + "' waypoint.  Select 'Investigate' to check it out.",
      buttons: [
      {
        text: 'Dismiss',
        role: 'cancel',
        handler: () => {
          console.log('Dismiss clicked');
        }
      },
      {
        text: 'Investigate',
        handler: () => {
          console.log('Investigate')
          this.investigatingWaypoint = true
          this.navCtrl.push(WaypointPage, {'id': index})
        }
      }
    ]
      });
      alert.present();
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
      })
      this.onVisitSubscription = this.visitProvider._onVisit.subscribe(onVisit=> {
      this.onVisit = onVisit
      })
    }
  }
}
