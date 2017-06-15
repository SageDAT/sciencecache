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

  routesDb: any
  routesData: any
  remote: any

  localRoutesLoaded:boolean = false
  _localRoutesLoaded = new BehaviorSubject <any> ([])
  localRoutesLoaded$ = this._localRoutesLoaded.asObservable()

  localRoutesList = []
  _localRoutesList = new BehaviorSubject <any> ([])
  localRoutesList$ = this._localRoutesList.asObservable()

  currentRoute:any = null
  _currentRoute = new BehaviorSubject <any> ([]);
  currentRoute$ = this._currentRoute.asObservable();

  constructor() {
    this.routesDb = new PouchDB('routes', {adapter : 'websql', size: 100})
  }

  wipeRoutesDB() {
    console.log('Destroying local database')
    this.routesDb.destroy().then(function (response) {
    }).catch(function (err) {
      console.log(err);
    });
  }

  saveRoute(route) {
    console.log('Saving route to local datastore')
    this.routesDb.post(route)
    console.log(route)
    this.localRoutesList = []
    this._localRoutesList.next(this.localRoutesList)
  }

  deleteRoute(route){
    console.log('Deleting local database record')
    this.routesDb.remove(route).then(data=>{
      this.localRoutesList = []
      this._localRoutesList.next(this.localRoutesList)
      this.loadRoutes().then(localRoutes=>{
        this._localRoutesList.next(this.localRoutesList)
      })
    }).catch((err) => {
      console.log(err);
    });
  }

  updateRoute(route){
    console.log('Updating route in local datastore')
    this.routesDb.put(route).catch((err) => {
      console.log(err);
    });
  }

  loadRoute(routeId) {
    console.log('Loading route: ' + routeId)
    this.currentRoute = this.routesDb.get(routeId).then((result) => {
      this.currentRoute = result
      this._currentRoute.next(this.currentRoute);
    }).catch((err) => {
      console.log(err)
    })
  }

  getRoute(routeId) {
    console.log('Getting route: ' + routeId)
    return new Promise(resolve => {
      this.routesDb.get(routeId).then((result) => {
        this.currentRoute = result
        resolve(this.currentRoute)
        }).catch((err) => {
      })    
    })
  }

  loadRoutes() {
    console.log('Getting routes...')
    if (this.localRoutesList.length > 0) {
      console.log('We already have them.  Refreshing list subscription.')
      console.log(this.localRoutesList)
      this.localRoutesLoaded = true
      this._localRoutesLoaded.next(this.localRoutesLoaded)
      this._localRoutesList.next(this.localRoutesList)
      return Promise.resolve(this.routesData);
    }
    return new Promise(resolve => {
      console.log('Getting routes out of local datastore')
      this.localRoutesLoaded = false
      this._localRoutesLoaded.next(this.localRoutesLoaded)
      this.routesDb.allDocs({
        include_docs: true
      }).then((results) => {
        results.rows.map((row) => {
          this.localRoutesList.push(row.doc)
        })
        this._localRoutesList.next(this.localRoutesList)
        this.localRoutesLoaded = true
        this._localRoutesLoaded.next(this.localRoutesLoaded)
        console.log(this.localRoutesList)
        resolve(this.localRoutesList)
      }).catch((error) => {
        console.log('Wha..?')
        console.log(error)
        this.localRoutesLoaded = false
        this._localRoutesLoaded.next(this.localRoutesLoaded)
      });
    })
  }

}
