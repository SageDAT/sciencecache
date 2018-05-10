import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
//import {Observable} from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

import {Storage} from "@ionic/storage";

/*
  Generated class for the LocalScienceCacheProvider provider.

  This service handles data into and out of the lcoal Pouch Database.
*/
@Injectable()
export class LocalScienceCacheProvider {

  routesDb: any
  routesData: any
  remote: any

  visitsDb: any
  visitsData: any

  localVisitsLoaded:boolean = false
  _localVisitsLoaded = new BehaviorSubject <any> ([])
  localVisitsLoaded$ = this._localVisitsLoaded.asObservable()

  localVisitsList = []
  _localVisitsList = new BehaviorSubject <any> ([])
  localVisitsList$ = this._localVisitsList.asObservable()

  userConfigDb: any
  userConfigData: any

  localRoutesLoaded:boolean = false
  _localRoutesLoaded = new BehaviorSubject <any> ([])
  localRoutesLoaded$ = this._localRoutesLoaded.asObservable()

  localRoutesList = []
  _localRoutesList = new BehaviorSubject <any> ([])
  localRoutesList$ = this._localRoutesList.asObservable()

  currentRoute:any = null
  _currentRoute = new BehaviorSubject <any> ([]);
  currentRoute$ = this._currentRoute.asObservable();

  /////

  storedDeviceInfo: any = null

  constructor(private storage: Storage) {
    this.routesDb = new PouchDB('routes')
    this.visitsDb = new PouchDB('visits')
    this.userConfigDb = new PouchDB('userConfig')
  }

// Visits DB Stuff

  wipeVisitsDB() {
    this.visitsDb.destroy().then(function (response) {
    }).catch(function (err) {
      console.log(err);
    });
  }

  saveVisit(visit) {
    console.log(visit)
    this.visitsDb.post(visit)
  }

  updateVisit(visit) {
    this.visitsDb.put(visit).catch((err) => {
      console.log(err);
    });
  }

  loadVisits() {
    if (this.localVisitsList.length > 0) {
      this.localVisitsLoaded = true
      this._localVisitsLoaded.next(this.localVisitsLoaded)
      this._localVisitsList.next(this.localVisitsList)
      return Promise.resolve(this.visitsData);
    }
    return new Promise(resolve => {
      this.localVisitsLoaded = false
      this._localVisitsLoaded.next(this.localVisitsLoaded)
      this.visitsDb.allDocs({
        include_docs: true
      }).then((results) => {
        results.rows.map((row) => {
          this.localVisitsList.push(row.doc)
        })
        this._localVisitsList.next(this.localVisitsList)
        this.localVisitsLoaded = true
        this._localVisitsLoaded.next(this.localVisitsLoaded)
        resolve(this.localVisitsList)
      }).catch((error) => {
        console.log(error)
        this.localVisitsLoaded = false
        this._localVisitsLoaded.next(this.localVisitsLoaded)
      });
    })
  }

// userConfig DB Stuff
  saveUserConfig(userConfig) {
    this.userConfigDb.post(userConfig)
  }


// Routes DB Stuff

  wipeRoutesDB() {
    this.routesDb.destroy().then(function (response) {
    }).catch(function (err) {
      console.log(err);
    });
  }

  saveRoute(route) {
    this.routesDb.post(route)
    this.localRoutesList = []
    this._localRoutesList.next(this.localRoutesList)
  }

  deleteRoute(route){
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
    this.routesDb.put(route).catch((err) => {
      console.log(err);
    });
  }

  loadRoute(routeId) {
    this.currentRoute = this.routesDb.get(routeId).then((result) => {
      this.currentRoute = result
      this._currentRoute.next(this.currentRoute);
    }).catch((err) => {
      console.log(err)
    })
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

  loadRoutes() {
    if (this.localRoutesList.length > 0) {
      this.localRoutesLoaded = true
      this._localRoutesLoaded.next(this.localRoutesLoaded)
      this._localRoutesList.next(this.localRoutesList)
      return Promise.resolve(this.routesData);
    }
    return new Promise(resolve => {
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
        resolve(this.localRoutesList)
      }).catch((error) => {
        this.localRoutesLoaded = false
        this._localRoutesLoaded.next(this.localRoutesLoaded)
      });
    })
  }

  ngOnInit() {

    this.storage.get('deviceinfo').then((val) => {
      if(val) {
        this.storedDeviceInfo.uuid = val.uuid
        this.storedDeviceInfo.email = val.email
      }
    });

  }


}
