import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { AlertController } from 'ionic-angular'
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { VisitProvider } from '../../providers/visit/visit'
import { RouteProvider } from '../../providers/route/route'
import { WaypointPage } from '../waypoint/waypoint'
import { Device } from "@ionic-native/device"
import { LocalScienceCacheProvider } from '../../providers/local-science-cache/local-science-cache'
import { RemoteScienceCacheProvider } from '../../providers/remote-science-cache/remote-science-cache'
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker'
import * as L from 'leaflet'

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
  currentRouteSubscription: Subscription
  currentLocationSubscription: Subscription
  currentVisitSubscription: Subscription
  onVisitSubscription: Subscription
  id: any
  map: any = null
  waypointMarkers:any = []
  leafletWaypointMarkers:any = []
  waypoints:any = []
  updateTimeSecs = 3  
  siteInformationToggle: boolean = false
  waypointFinderToggle: boolean = false
  waypointsToggle: boolean = false
  visitToggle: boolean = false
  warningShown: boolean = false
  mapLoaded: boolean = false
  investigatingWaypoint: boolean = false
  showWaypointFinder: boolean = false
  onStreet:boolean = true
  onVisit:boolean = false
  currentRoute: any = null
  currentLocationMarker: any
  currentLocation:any = null
  currentVisit: any = null
  compass: any = {
    waypoint: 0,
    waypoint_title: 'No Waypoint Loaded.',
    waypoint_number: 1,
    waypoint_distance: '??? meters',
    waypoint_bearing: '??? °',
    current_heading: -1,
    current_speed: 0,
    true_bearing: 0
  }
  mapLayer:string = 'street'
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

  constructor(public navCtrl: NavController, public alertController: AlertController, public navParams: NavParams, public lscService: LocalScienceCacheProvider, public rscService: RemoteScienceCacheProvider, public locationTracker: LocationTrackerProvider, public routeProvider: RouteProvider, public visitProvider: VisitProvider, private ref: ChangeDetectorRef, private device: Device) {
    var ticks = 1
    setInterval(() => {
      if (this.currentRoute !== null) {
        if (!this.warningShown) {
          this.startWarningAlert()
          this.warningShown = true
        }
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
            if (this.compass.waypoint_number != 0) {
              this.updateWaypointFinder()
            }
            this.visitProvider.updateWaypoints()
            this.updateWaypoints()
          }
          ticks = 1
        }
        ticks++
      }
    }, 1000)
  }

  visitStatusChanged() {
    if (this.visitToggle) {
      this.startVisit()
    } else {
      this.stopVisit()
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
    this.startVisitAlert()
    this.startGPS()
  }

  stopVisit() {
    this.currentVisit.route_id == this.currentRoute.route_id
    this.currentVisit.route_name == this.currentRoute.name
    this.visitProvider.setOnVisit(false)
    this.cleanUpVisit()
    this.uploadAlert()
    this.stopGPS()
  }

  cleanUpVisit() {
    for (var wi in this.currentVisit.waypoints) {
      for (var dri in this.currentVisit.waypoints[wi].data_requests) {
        delete this.currentVisit.waypoints[wi].data_requests[dri].request_help
        delete this.currentVisit.waypoints[wi].data_requests[dri].description
        delete this.currentVisit.waypoints[wi].data_requests[dri].image
        delete this.currentVisit.waypoints[wi].data_requests[dri].question
        delete this.currentVisit.waypoints[wi].data_requests[dri].request_type
        delete this.currentVisit.waypoints[wi].data_requests[dri].placeholder
        delete this.currentVisit.waypoints[wi].data_requests[dri].options
      }
      delete this.currentVisit.waypoints[wi].distance
      delete this.currentVisit.waypoints[wi].bearing
      delete this.currentVisit.waypoints[wi].name
      delete this.currentVisit.waypoints[wi].longitude
      delete this.currentVisit.waypoints[wi].latitude
    }       
  }

  startVisitAlert() {
    let alert = this.alertController.create({
      title: 'Starting Visit!',
      subTitle: 'Find waypoints and collect data.  As you answer questions and take pictures, your data is saved to the phone. When you are finished, stop the visit and upload it to the remote server, or wait until you have an Internet connection and save it from the Visits page.',
      buttons: ['OK']
    })
    alert.present()
  }

  startWarningAlert() {
    let alert = this.alertController.create({
      title: 'Warning!',
      subTitle: this.currentRoute.warning,
      buttons: ['OK']
    })
    alert.present()
  }

  uploadAlert() {
    let alert = this.alertController.create({
      title: 'Upload Data',
      message: 'Do you want to upload this data to the remove service right now?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            this.visitProvider.saveCurrentVisit()
          }
        },
        {
          text: 'Upload Data',
          handler: data => {
            this.uploadVisit()
          }
      }
      ]
    })
    alert.present();
  }

  waypointAlert(index, name, distance) {
    let alert = this.alertController.create({
      title: 'Near a waypoint!',
      subTitle: name,
      message: "You're within " + distance + " meters of the '" + name + "' waypoint.  Select 'Investigate' to check it out.",
      buttons: [
      {
        text: 'Dismiss',
        role: 'cancel',
        handler: () => {}
      },
      {
        text: 'Investigate',
        handler: () => {
          this.investigatingWaypoint = true
          this.navCtrl.push(WaypointPage, {'id': index})
        }
      }
    ]})
    alert.present();
  }

  uploadVisit() {
    var device_info = {
      'cordova': this.device.cordova,
      'uuid': this.device.uuid,
      'model': this.device.model,
      'platform': this.device.platform,
      'version': this.device.version,
      'manufacturer': this.device.manufacturer,
      'isVirtual': this.device.isVirtual,
      'serial': this.device.serial
    }  
    this.rscService.postVisit(this.currentVisit, device_info).subscribe(
      data => {
        if (data['visit_added']) {
          this.currentVisit.submitted = data['visit_added']
        } else {
          this.currentVisit.submitted = false
        }
        this.visitProvider.saveCurrentVisit()
      }
    )
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
      this.compass.waypoint = this.compass.waypoint - 1;
      if (this.compass.waypoint == -1) {
        this.compass.waypoint = this.waypoints.length - 1;
      }
      this.updateWaypointFinder();
    }

  nextWaypoint() {
    this.compass.waypoint = this.compass.waypoint + 1;
    if (this.compass.waypoint == (this.waypoints.length)) {
      this.compass.waypoint = 0;
    }
    this.updateWaypointFinder();
  }

  updateWaypointFinder() {
    this.visitProvider.updateWaypoints()
    this.compass.waypoint_number = this.compass.waypoint + 1;
    this.compass.waypoint_title = this.currentVisit.waypoints[this.compass.waypoint].name;
    var compass_distance_meters = Math.round(parseFloat(this.currentVisit.waypoints[this.compass.waypoint].distance))
    if (compass_distance_meters > 1000) {
      this.compass.waypoint_distance = (compass_distance_meters / 1000).toString() + ' kilometers'
    } else {
      this.compass.waypoint_distance = compass_distance_meters.toString() + ' meters'
    }
    var compass_bearing = Math.round(parseFloat(this.currentVisit.waypoints[this.compass.waypoint].bearing))
    if (this.compass.current_speed <= 0) {
      this.compass.waypoint_bearing = compass_bearing.toString() + '°'
    } else {
      this.compass.waypoint_bearing = compass_bearing.toString() + '°'
    }
    if (this.compass.current_heading) {
      this.compass.true_bearing = Math.round(parseInt(this.currentVisit.waypoints[this.compass.waypoint].bearing) - this.compass.current_heading);
      if (this.compass.true_bearing < 0) {
        this.compass.true_bearing = this.compass.true_bearing + 360;
      }
    } else {
      this.compass.true_bearing = parseInt(this.compass.waypoint_bearing)
    }
  }

  setCurrentLocation() {
    var currentIcon = L.icon({
        iconUrl: 'assets/images/current_location.png',
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -46]
    })
    if (this.currentLocation.coords) {
      if (this.currentLocationMarker) {
        this.currentLocationMarker.setLatLng([this.currentLocation.coords.latitude, this.currentLocation.coords.longitude]);
      } else {
        this.currentLocationMarker = L.marker([this.currentLocation.coords.latitude, this.currentLocation.coords.longitude], {icon: currentIcon}).addTo(this.map)
      }
      this.currentLocationMarker.bindPopup('<b>Current Location</b><br />Latitude: ' + this.currentLocation.coords.latitude +'<br />Longitude: ' + this.currentLocation.coords.longitude)
      this.map.panTo(new L.LatLng(this.currentLocation.coords.latitude, this.currentLocation.coords.longitude))
      this.compass.current_heading = Math.round(this.currentLocation.coords.heading);
      this.compass.current_accuracy = this.currentLocation.coords.accuracy;
      if (this.currentLocation.coords.speed) {
        this.compass.current_speed = this.currentLocation.coords.speed.toFixed(2);
      }
      else {
        this.compass.current_speed = 0;
      }
    }
  }

  updateWaypoints() {
    for (var waypoint of this.currentVisit.waypoints) {
      if ((Math.round(parseFloat(waypoint.distance)) < 5) && (!this.investigatingWaypoint)) {
        if (waypoint.alert != true) {
          this.waypointAlert(waypoint['id'], waypoint['name'], waypoint['distance'])
          waypoint.alert = true
        }
      }
      if (this.leafletWaypointMarkers[waypoint['id']]) {
        this.leafletWaypointMarkers[waypoint['id']].bindPopup(waypoint.message)      
      }
    }    
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
    if (this.waypointMarkers && this.waypointMarkers[0] && this.waypointMarkers[0]['lat'] && this.waypointMarkers[0]['lng']) {
      for (var marker of this.waypointMarkers) {
        this.leafletWaypointMarkers[marker['id']] = L.marker([marker.lat, marker.lng], {icon: marker.icon}).addTo(this.map)
        this.leafletWaypointMarkers[marker['id']].bindPopup(marker.message)
      }
      this.map.panTo(new L.LatLng(this.waypointMarkers[0]['lat'],this.waypointMarkers[0]['lng']))
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
    // to be calculated from site bounding box
  }

  getCenterY() {
    // to be calculated from site bounding box
  }

  getDefaultZoom() {
    // to be calculated from site bounding box
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

  ionViewWillEnter() {
    this.investigatingWaypoint = false
  }

  ionViewWillUnload() {
    if (this.onVisit) {
      this.stopVisit()
    }
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
