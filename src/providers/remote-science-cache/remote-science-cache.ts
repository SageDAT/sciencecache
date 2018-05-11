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

  currentRoute: any
  routesList:any = []
  routesListSubject = new BehaviorSubject < any > ([])
  badLoadSubject = new BehaviorSubject <any> ([])
  savingRoute:boolean = false
  savingRouteSubject = new BehaviorSubject <any> ([])
  base_sciencecache_service_url = "https://api.sciencebase.gov/sciencecache-service/"

  constructor(public http: Http, public httpClient: HttpClient, public lscService: LocalScienceCacheProvider,
              private storage: Storage) {
  }

  saveRoute(id) {
    this.savingRoute = true
    this.savingRouteSubject.next(this.savingRoute)
    for (var r in this.routesList) {
      if (this.routesList[r].route_id == id) {
        this.routesList.splice(r, 1)
        this.routesListSubject.next(this.routesList)
        break
      }
    }
    return new Promise(resolve=>{
      this.httpClient.get(`${this.serviceUrl}/mobile-routes/${id}`)
        .subscribe(data => {
          this.currentRoute = data
          this.lscService.saveRoute(this.currentRoute)
          this.lscService.loadRoutes().then(localRoutes=>{
            this.lscService._localRoutesList.next(localRoutes)
          })
          this.savingRoute = false
          this.savingRouteSubject.next(this.savingRoute)
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
    this.savingRouteSubject.next(this.savingRoute)
    this.getRoutes().subscribe(data => {
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
        this.routesListSubject.next(this.routesList)
      })
  }

  getRoutes() {
    let routesUrl = `${this.serviceUrl}/mobile-routes`;
    return this.httpClient.get(routesUrl, {headers: this.storedDeviceInfo})
      .catch(this.handleError)
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

    this.storage.get('deviceinfo').then((val) => {
      if(val) {
        this.storedDeviceInfo.uuid = val.uuid
        this.storedDeviceInfo.email = val.email
      }
    });

  }

}
