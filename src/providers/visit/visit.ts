import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
//import {Observable} from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs/Subscription'
import { RouteProvider } from '../route/route'
//import { LocalScienceCacheProvider } from '../local-science-cache/local-science-cache'

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
  currentWaypoint: any
  currentWaypointSubscription: Subscription
  waypointFound: boolean = false
  _waypointFound = new BehaviorSubject<any> ([])
  waypointFound$ = this._waypointFound.asObservable()


  constructor(public http: Http, public routeProvider: RouteProvider) {
    console.log('Visit provider.')
    this.currentWaypointSubscription = this.routeProvider._currentWaypoint.subscribe(currentWaypoint=> {
      this.currentWaypoint = currentWaypoint;
    })
    this._onVisit.next(this.onVisit)
    this._currentVisit.next(this.currentVisit)
  }

  createNewVisit() {
    console.log('Adding a new visit.')
    var blankVisit = {
      current: null,
      images: [],
      created_date: null,
      questions: [],
      questions_answered: 0,
      route_id: 0,
      user: null,
      waypoints: this.routeProvider.getWaypoints(),
      waypoints_visited: 0
    }
    this.currentVisit = blankVisit
    this._currentVisit.next(this.currentVisit)
  }

  setWaypointFound(id) {
    this.waypointFound = true
    this._waypointFound.next(this.waypointFound)
    for (var waypoint in this.currentVisit.waypoints) {
      if (this.currentVisit.waypoints[waypoint].id == id) {
        this.currentVisit.waypoints[waypoint].waypoint_found = true
      }
    }
    console.log(this.currentVisit)
  }

  updateCurrentVisit() {

  }

  saveCurrentVisit() {

  }

  addWaypoint() {

  }
      
  setOnVisit(onVisit) {
    this.onVisit = onVisit
    this._onVisit.next(this.onVisit)
    this.createNewVisit()
  }

}
