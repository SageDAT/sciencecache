import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LocalScienceCacheProvider } from '../local-science-cache/local-science-cache'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import {Storage} from "@ionic/storage";


/*
  Generated class for the RemoteScienceCacheProvider provider.

  This service handles data into and out of the Remove ScienceCache (python) microservice, which
  in turn handles data into and out of the postgres database.
*/
@Injectable()
export class RemoteScienceCacheProvider {
  serviceUrl: string = environment.serviceUrl;
  storedDeviceInfo: any = null

  /////

  serviceData: any
  currentRoute: any
  fullRoutesList:any = []
  serviceRoutes: any = []
  routesList:any = []
  _routesList = new BehaviorSubject < any > ([])
  routesList$ = this._routesList.asObservable()

  badLoad:boolean = false
  _badLoad = new BehaviorSubject <any> ([])
  badLoad$ = this._badLoad.asObservable()

  savingRoute:boolean = false
  _savingRoute = new BehaviorSubject <any> ([])
  savingRoute$ = this._savingRoute.asObservable()
  base_sciencecache_service_url = "https://api.sciencebase.gov/sciencecache-service/"

  constructor(public http: Http, public httpClient: HttpClient, public lscService: LocalScienceCacheProvider,
              private storage: Storage) {
  }

  saveRoute(id) {
    this.savingRoute = true
    this._savingRoute.next(this.savingRoute)
    for (var r in this.routesList) {
      if (this.routesList[r].route_id == id) {
        this.routesList.splice(r, 1)
        this._routesList.next(this.routesList)
        break
      }
    }
    return new Promise(resolve=>{
      this.http.get(this.base_sciencecache_service_url + 'routes/' + id)
      .map(response=>response.json())
      .subscribe(data => {
        this.currentRoute = data
        this.lscService.saveRoute(this.currentRoute)
        this.lscService.loadRoutes().then(localRoutes=>{
          this.lscService._localRoutesList.next(localRoutes)
        })
        this.savingRoute = false
        this._savingRoute.next(this.savingRoute)
        resolve(this.currentRoute)
      })
    })
  }

  postVisit(visit, deviceInfo) {
    var visitURL = this.base_sciencecache_service_url + 'visits/'
    var headers = new Headers()
    headers.append('Content-Type', 'application/json')
    visit.device_info = deviceInfo
    return this.http.post(visitURL, visit, { headers: headers })
      .map(response => {
        return response.json()
      })
  }

  loadRoutes(localRoutes) {
    this.savingRoute = false
    this._savingRoute.next(this.savingRoute)
    this.getRoutes().subscribe(
      data => {
        this.routesList = data;
      if (localRoutes) {
        for (var l in localRoutes) {
          for (var r in this.routesList) {
            if (this.routesList[r].route_id == localRoutes[l].route_id) {
              this.routesList.splice(r, 1)
            }
          }
        }
      }
      this._routesList.next(this.routesList)
    })
  }

  loadRoutes2() {
    var routesUrl = `${this.serviceUrl}/mobile-route`;
    this.httpClient.get(routesUrl, { headers: this.storedDeviceInfo })
  }

  getRoutes(all_fields=false) {
    var time = new Date()
    var routesUrl = this.base_sciencecache_service_url + 'routes/'
    return this.http.get(routesUrl)
      .map(response => {
        time = new Date()
        return response.json()
      })
      .catch(this.handleError)
  }

  fetchRouteSummaries(reloadRoutes = false) {
    var routesUrl = this.base_sciencecache_service_url + 'routes/';
    //  This is BROKEN and should be fixed.
    if ((this.fullRoutesList.length > 0) && (reloadRoutes == false)) {
      return Promise.resolve(resolve=> { return this.fullRoutesList})
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

  postDeviceData(data) {
    const URL = `${this.serviceUrl}/deviceinfo`;
    console.log('Device post url:', URL)
    return this.http.post(URL, data)
      .map(response => response.json()).catch(this.handleError)
  }

  private handleError(error: any): Promise < any > {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  ngOnInit() {

    console.log('ng init remote-science-cache.ts')

    this.storage.get('deviceinfo').then((val) => {
      console.log('Loading device info ', val);
      if(val) {
        this.storedDeviceInfo.uuid = val.uuid
        this.storedDeviceInfo.email = val.email
      }
    });

  }

}
