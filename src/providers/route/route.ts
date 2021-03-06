import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import { LocalScienceCacheProvider } from '../local-science-cache/local-science-cache'

@Injectable()
export class RouteProvider {

  currentRoute:any = {}
  currentRouteSubject = new BehaviorSubject <any> ([])
  currentWaypoint: any
  currentWaypointSubject = new BehaviorSubject <any> ([])

  constructor(public http: Http, public lscService: LocalScienceCacheProvider) {
  }

  sortWaypointsByID(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]
        var y = b[key]
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

  getLocalRoute(RouteId) {
     this.lscService.getRoute(RouteId).then(data=>{
      this.currentRoute = data;
      this.currentRoute.waypoints = this.sortWaypointsByID(this.currentRoute.observation_points, 'id');
      this.currentRouteSubject.next(this.currentRoute)
    })
  }

  getWaypoints() {
    var routeWaypoints = []
    if (this.currentRoute.waypoints.length > 0) {
      for (var waypoint of this.currentRoute.waypoints) {
        routeWaypoints.push({'id': waypoint.id, 'name' : waypoint.name, 'latitude': waypoint.latitude, 'longitude': waypoint.longitude, 'distance': 0, 'bearing': 0, 'photos': [], 'data_requests': waypoint.data_requests, 'data': [], waypoint_found: false})
      }
    }
    return routeWaypoints
  }

  getWaypoint(waypointId) {
    if (this.currentRoute.waypoints.length <= 0) {
      this.currentWaypoint = null
    } else {
      for (var waypoint in this.currentRoute.waypoints) {
        if (this.currentRoute.waypoints[waypoint].id == waypointId) {
          this.currentWaypoint = this.currentRoute.waypoints[waypoint]
          this.currentWaypoint.index = parseInt(waypoint)
          console.log(this.currentWaypoint)
          this.currentWaypoint.isFound = false
        }
      }
    }
    this.currentWaypointSubject.next(this.currentWaypoint)
  }
}
