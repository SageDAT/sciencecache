import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {HttpClient, HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LocalScienceCacheProvider } from '../local-science-cache/local-science-cache'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import {Storage} from "@ionic/storage";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";



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
  badLoadSubject = new BehaviorSubject <any> ({})
  badLoadBoolSubject = new BehaviorSubject <boolean> (false)
  routeBadLoadSubject = new BehaviorSubject <any> ({})
  routeBadLoadBoolSubject = new BehaviorSubject <boolean> (false)
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
      if (this.routesList[r].route == id) {
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
            this.lscService.localRoutesListSubject.next(localRoutes)
          })
          this.savingRoute = false
          this.savingRouteSubject.next(this.savingRoute)
          this.routeBadLoadBoolSubject.next(false)
          this.routeBadLoadSubject.next({})
          resolve(this.currentRoute)
        }, error => {
          this.routeBadLoadBoolSubject.next(true)
          this.routeBadLoadSubject.next(error)
          this.handleHttpClientError(error)
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
              if (this.routesList[r].route == localRoutes[l].route) {
                this.routesList.splice(r, 1)
              }
            }
          }
        }
        this.routesListSubject.next(this.routesList)
        this.badLoadBoolSubject.next(false)
        this.badLoadSubject.next({})
    }, error => {
      this.badLoadBoolSubject.next(true)
      this.badLoadSubject.next(error)
      this.handleHttpClientError(error)
    })
  }

  getRoutes() {
    let routesUrl = `${this.serviceUrl}/mobile-routes`;
    return this.httpClient.get(routesUrl, {headers: this.storedDeviceInfo})
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

  private handleHttpClientError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      let e = 'An error occurred: ' + error.error.message
      this.badLoadSubject.next(e)
      this.routeBadLoadSubject.next(e)
    } else {
      // The backend returned an unsuccessful response code, response body may contain info
      let e = `Service returned code ${error.status}, `+`with: ${error.error}`
      this.badLoadSubject.next(e)
      this.routeBadLoadSubject.next(e)
    }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable(
      'Something bad happened; please try again later.');
  };

  ngOnInit() {

    this.storage.get('deviceinfo').then((val) => {
      if(val) {
        this.storedDeviceInfo.uuid = val.uuid
        this.storedDeviceInfo.email = val.email
      }
    });

  }

}
