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
  localRoutesList:any = {}
  _localRoutesList = new BehaviorSubject < any > ([])
  localRoutesList$ = this._localRoutesList.asObservable()
  currentRoute:any = {}
  _currentRoute = new BehaviorSubject < any > ([]);
  currentRoute$ = this._currentRoute.asObservable();

  constructor() {
    console.log('Hello ScienceCacheServiceProvider Provider')
    this.routesDb = new PouchDB('routes', {adapter : 'websql', size: 50})
  }

  wipeRoutesDB() {
    this.routesDb.destroy().then(function (response) {
      console.log('Routes DB destroyed.')
    }).catch(function (err) {
      console.log(err);
    });
  }

  loadRoute(route_id) {
    console.log('Loading Route: ' + route_id)
    this.currentRoute = this.routesDb.get(route_id).then((result) => {
      this.currentRoute = result
      this._currentRoute.next(this.currentRoute);
    }).catch((err) => {

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
    });
  }

  getRoutes() {
    console.log('Getting local routes...')
    if (this.routesData) {
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
        resolve(this.localRoutesList)
      }).catch((error) => {
        console.log(error);
      }); 
    });
  }

  handleChange(change){ 
    let changedDoc = null;
    let changedIndex = null;
    //A document was deleted
    if(change.deleted){
      this.routesData.splice(changedIndex, 1);
    } else {
      //A document was updated
      if(changedDoc){
        this.routesData[changedIndex] = change.doc;
      } else {
      //A document was added
      this.routesData.push(change.doc); 
      }
    }
  }
}
