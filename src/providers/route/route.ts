import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
//import {Observable} from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import { LocalScienceCacheProvider } from '../local-science-cache/local-science-cache'

/*
  Generated class for the RouteProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class RouteProvider {

  currentRoute:any = {}
  _currentRoute = new BehaviorSubject <any> ([])
  currentRoute$ = this._currentRoute.asObservable()
  currentWaypoint: any 
  _currentWaypoint = new BehaviorSubject <any> ([])
  currentWaypoint$ = this._currentWaypoint.asObservable()

  constructor(public http: Http, public lscService: LocalScienceCacheProvider) {
    console.log('Hello RouteProvider Provider');
  }

  getRemoteRoute(id) {
  }

  saveRemoteRoute(id) {
    console.log('saving remote route to local datastore.')
  }

  getLocalRoute(RouteId) {
    console.log('Loading Route: ' + RouteId)
     this.lscService.getRoute(RouteId).then(data=>{
      console.log('Data returned.')
      console.log(data)
      this.currentRoute = data;
      this._currentRoute.next(this.currentRoute)
    })
  }

  getWaypoints() {
    var routeWaypoints = []
    if (this.currentRoute.waypoints.length > 0) {
      for (var waypoint of this.currentRoute.waypoints) {
        routeWaypoints.push({'id': waypoint.waypoint_id, waypoint_found: false})
      }
    }
    return routeWaypoints
  }

  getWaypoint(waypointId) {
    console.log('getting waypoint')
    if (this.currentRoute.waypoints.length <= 0) {
      this.currentWaypoint = null
    } else {
      for (var waypoint of this.currentRoute.waypoints) {
        if (waypoint.waypoint_id == waypointId) {
          this.currentWaypoint = waypoint
          this.currentWaypoint.isFound = false
        }
      }
    }
    console.log(this.currentWaypoint)
    this._currentWaypoint.next(this.currentWaypoint)
  }
}
