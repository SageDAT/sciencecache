import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
//import {Observable} from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

/*
  Generated class for the LocalScienceCacheProvider provider.

  This service handles data into and out of the lcoal Pouch Database.
*/
@Injectable()
export class LocalScienceCacheProvider {

  routesData: any
  routesDb: any
  remote: any
  serviceData: any

  localRoutesLoaded:boolean = false
  _localRoutesLoaded = new BehaviorSubject <any> ([])
  localRoutesLoaded$ = this._localRoutesLoaded.asObservable()

  localRoutesList:any = {}
  _localRoutesList = new BehaviorSubject <any> ([])
  localRoutesList$ = this._localRoutesList.asObservable()

  currentRoute:any = {}
  _currentRoute = new BehaviorSubject <any> ([]);
  currentRoute$ = this._currentRoute.asObservable();

  constructor() {
    this.routesDb = new PouchDB('routes', {adapter : 'websql', size: 50})
  }

  wipeRoutesDB() {
    this.routesDb.destroy().then(function (response) {
    }).catch(function (err) {
      console.log(err);
    });
  }

  loadRoute(route_id) {
    this.currentRoute = this.routesDb.get(route_id).then((result) => {
      this.currentRoute = result
      this._currentRoute.next(this.currentRoute);
    }).catch((err) => {
      console.log(err)
    })
  }

  saveRoute(route) {
    this.routesDb.post(route)
    this.getRoutes().then(routes=>{
      this._localRoutesList.next(this.localRoutesList)
    })
  }

  deleteRoute(route){
    this.routesDb.remove(route).then(data=>{
      this.getRoutes().then(routes=>{
        this._localRoutesList.next(this.localRoutesList)
      })
    }).catch((err) => {
      console.log(err);
    });
  }

  updateRoute(route){
    this.routesDb.put(route).catch((err) => {
      console.log(err);
    });
  }

  getRoute(routeId) {
    return new Promise(resolve => {
      this.routesDb.get(routeId).then((result) => {
        this.currentRoute = result
        resolve(this.currentRoute)
        }).catch((err) => {
      })    
    })
  }

  getRoutes() {
    if (this.routesData) {
      this.localRoutesLoaded = true
      this._localRoutesLoaded.next(this.localRoutesLoaded)
      return Promise.resolve(this.routesData);
    }
    return new Promise(resolve => {
      this.routesDb.allDocs({
        include_docs: true
      }).then((result) => {
        this.localRoutesList = []
        let docs = result.rows.map((row) => {
          this.localRoutesList.push(row.doc)
        })
        this._localRoutesList.next(this.localRoutesList)
        this.localRoutesLoaded = true
        this._localRoutesLoaded.next(this.localRoutesLoaded)
        resolve(this.localRoutesList)
      }).catch((error) => {
        console.log(error)
        this.localRoutesLoaded = false
        this._localRoutesLoaded.next(this.localRoutesLoaded)
      });
    })
  }

}
