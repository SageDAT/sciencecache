import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import 'rxjs/add/operator/map'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subscription } from 'rxjs/Subscription'
import { RouteProvider } from '../route/route'
import { LocationTrackerProvider } from '../location-tracker/location-tracker'
import { LocalScienceCacheProvider } from '../local-science-cache/local-science-cache'

/*
  Generated class for the VisitProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class VisitProvider {

  currentVisit:any = null
  _currentVisit = new BehaviorSubject <any> ([])
  currentVisit$ = this._currentVisit.asObservable()
  onVisit: boolean = false
  _onVisit = new BehaviorSubject <any> ([])
  onVisit$ = this._onVisit.asObservable()
  currentLocation: any
  currentWaypoint: any
  currentWaypointSubscription: Subscription
  waypointFound: boolean = false
  _waypointFound = new BehaviorSubject<any> ([])
  waypointFound$ = this._waypointFound.asObservable()


  constructor(public http: Http, public routeProvider: RouteProvider, public locationTracker: LocationTrackerProvider, public lscService: LocalScienceCacheProvider) {
    this.currentWaypointSubscription = this.routeProvider._currentWaypoint.subscribe(currentWaypoint=> {
      this.currentWaypoint = currentWaypoint;
    })
    this._onVisit.next(this.onVisit)
    this._currentVisit.next(this.currentVisit)
  }

  createNewVisit() {
    var blankVisit = {
      created_date: new Date(),
      uploaded_date: null,
      questions_answered: 0,
      total_questions: 0,
      route_name: this.routeProvider.currentRoute.name,
      route_id: this.routeProvider.currentRoute.route_id,
      route_version: this.routeProvider.currentRoute.route_version,
      waypoints: this.routeProvider.getWaypoints(),
      waypoints_visited: 0,
      photos_taken: 0,
      submitted: false
    }  
    this.currentVisit = blankVisit
    console.log(this.currentVisit)
    this._currentVisit.next(this.currentVisit)
    this._waypointFound.next(this.waypointFound)
  }

  setWaypointFound(id) {
    console.log('Waypoint Found.')
    this.waypointFound = true
    this._waypointFound.next(this.waypointFound)
    for (var waypoint in this.currentVisit.waypoints) {
      if (this.currentVisit.waypoints[waypoint].id == id) {
        if (this.currentVisit.waypoints[waypoint].waypoint_found != true) {
          this.currentVisit.waypoints[waypoint].waypoint_found = true
          this.currentVisit.waypoints_visited = this.currentVisit.waypoints_visited + 1
          this._currentVisit.next(this.currentVisit)
        }
      }
    }
    this._currentVisit.next(this.currentVisit)
  }

  updateWaypoints() {
    this.currentLocation = this.locationTracker.getCurrentLocation()

    for (var waypoint in this.currentVisit.waypoints) {
      var waypointName = '<strong>' + this.currentVisit.waypoints[waypoint].name +'</strong><br />'
      var waypointLat = 'Latitude: ' + this.currentVisit.waypoints[waypoint].latitude + '<br />'
      var waypointLong = 'Longitude: ' + this.currentVisit.waypoints[waypoint].latitude + '<br />'
      var waypointBearing = ''
      var waypointDistance = ''
      
      if (this.currentLocation.coords) {
        this.currentVisit.waypoints[waypoint].distance = this.locationTracker.getDistanceFromLatLonInKm(this.currentLocation.coords.latitude,this.currentLocation.coords.longitude,this.currentVisit.waypoints[waypoint].latitude,this.currentVisit.waypoints[waypoint].longitude) * 1000
        this.currentVisit.waypoints[waypoint].bearing = this.locationTracker.getBearingfromLatLong(this.currentLocation.coords.latitude,this.currentLocation.coords.longitude,this.currentVisit.waypoints[waypoint].latitude,this.currentVisit.waypoints[waypoint].longitude)

        var waypointBearing = 'Bearing: ' + this.currentVisit.waypoints[waypoint].bearing + '<br />'
        var waypointDistance = 'Distance: ' + this.currentVisit.waypoints[waypoint].distance + '<br />'
      } else {
        this.currentVisit.waypoints[waypoint].distance = NaN
        this.currentVisit.waypoints[waypoint].bearing = NaN
      }
      
      this.currentVisit.waypoints[waypoint].message = waypointName + waypointLat + waypointLong + waypointBearing + waypointDistance
    }
  }

  getWaypointFound(id) {
   if (this.currentVisit) {
     for (var waypoint in this.currentVisit.waypoints) {
        if (this.currentVisit.waypoints[waypoint].id == id) {
          if (this.currentVisit.waypoints[waypoint].waypoint_found != true) {
            this.waypointFound = false
          } else {
            this.waypointFound = true
          }
          this._waypointFound.next(this.waypointFound)
        }
      } 
    } else {
      this.waypointFound = false
      this._waypointFound.next(this.waypointFound)
    }
  }

  saveCurrentVisit() {
    for (var waypoint of this.currentVisit.waypoints) {
      this.currentVisit.total_questions = this.currentVisit.total_questions + waypoint.data_requests.length
      this.currentVisit.questions_answered = this.currentVisit.questions_answered + waypoint.data.length
      this.currentVisit.photos_taken = this.currentVisit.photos_taken + waypoint.photos.length
    }
    this.lscService.saveVisit(this.currentVisit)
  }

  addWaypoint() {
  }
      
  setOnVisit(onVisit) {
    this.onVisit = onVisit
    this._onVisit.next(this.onVisit)
    if (onVisit == true) {
      this.createNewVisit()
    }
  }

}