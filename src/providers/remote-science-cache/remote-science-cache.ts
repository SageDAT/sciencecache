import { Injectable } from '@angular/core';
import { LocalScienceCacheProvider } from '../local-science-cache/local-science-cache'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/Rx';
/*
  Generated class for the RemoteScienceCacheProvider provider.

  This service handles data into and out of the Remove ScienceCache (python) microservice, which 
  in turn handles data into and out of the postgres database.
*/
@Injectable()
export class RemoteScienceCacheProvider {
  serviceData: any
  currentRoute: any
  fullRoutesList:any = []
  routesList:any = []
  _routesList = new BehaviorSubject < any > ([])
  routesList$ = this._routesList.asObservable()

  badLoad:boolean = false
  _badLoad = new BehaviorSubject <any> ([])
  badLoad$ = this._badLoad.asObservable()


  constructor(public http: Http, public lscService: LocalScienceCacheProvider) {
    console.log('Hello RemoteScienceCacheProvider Provider');
  }

saveRoute(id) {
  console.log('Saving Route: ' + id)
  for (var r in this.routesList) {
    if (this.routesList[r].id == id) {
      this.routesList.splice(r, 1)
      this._routesList.next(this.routesList)
      break
    }
  }
  return new Promise(resolve=>{
    this.http.get('https://beta.sciencebase.gov/sciencecache-service/routes/' + id)
    .map(response=>response.json())
    .subscribe(data => {
      console.log('Loaded: ' + data.id)
      this.currentRoute = data
      this.lscService.saveRoute(this.currentRoute)
      resolve(this.currentRoute)
    })
  })
}

  loadRoutes(localRoutes) {
    console.log('loading routes and remove local')
    console.log(localRoutes)
    this.fetchRouteSummaries().then(data =>{
      console.log('removing local routes from service routes')
      console.log(this.fullRoutesList)
      for (var l in localRoutes) {
        for (var r in this.routesList) {
          if (this.routesList[r].id == localRoutes[l].id) {
            this.routesList.splice(r, 1);
          }
        }
      }
      console.log(this.fullRoutesList)
      console.log(this.routesList)
      this._routesList.next(this.routesList)
    })
  }

  fetchRouteSummaries(reloadRoutes = false) {
    console.log('fetching routes from service')
    var routesUrl = 'https://beta.sciencebase.gov/sciencecache-service/routes/';
    if (this.fullRoutesList.length > 0 && reloadRoutes == false) {
      console.log('Returning full routes list...')
      return Promise.resolve(this.fullRoutesList);
    }
    return new Promise(resolve => {
      this.http.get(routesUrl)
        .map(res => res.json())
        .subscribe(data => {
          this.routesList = data
          this.fullRoutesList = Object.assign({}, this.routesList)
          resolve(this.routesList)
        })
    })  
  }



}
