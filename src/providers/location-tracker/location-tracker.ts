import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/toPromise';
import 'rxjs/Rx';

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LocationTrackerProvider {

  public watch: any
  public lat: number = 0
  public lng: number = 0
  currentLocation:any = {}
  _currentLocation = new BehaviorSubject < any > ([])
  currentLocation$ = this._currentLocation.asObservable()

  constructor(public zone: NgZone, public backgroundGeolocation: BackgroundGeolocation, public geolocation: Geolocation) {
  }
 

   // Credit: http://stackoverflow.com/a/27943/52160
   // ToDo: This should probably be replaced with the haversine formula.
   getDistanceFromLatLonInKm(latitude1,longitude1,latitude2,longitude2) {
    console.log(latitude1)
    console.log(latitude2)
    console.log(longitude1)
    console.log(longitude2)
    var R = 6371; // Radius of the earth in km
    var dLat = this.degreeToRadian(latitude2-latitude1);
    var dLon = this.degreeToRadian(longitude2-longitude1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreeToRadian(latitude1)) * Math.cos(this.degreeToRadian(latitude2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distance = R * c; // Distance in km
    return distance;
   }

/*   function getBearingfromLatLong(latitude1, longitude1, latitude2, longitude2) {
     var dLon = (lng2-lng1);
             var y = Math.sin(dLon) * Math.cos(lat2);
             var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
             var brng = this._toDeg(Math.atan2(y, x));
             return 360 - ((brng + 360) % 360);  }
*/
  
   degreeToRadian(deg) {
    return deg * (Math.PI/180)
   }

   getBearingfromLatLong(latitude1, longitude1, latitude2, longitude2) {
     var dLon = this._toRad(longitude2 - longitude1);
     var y = Math.sin(dLon) * Math.cos(this._toRad(latitude2));
     var x = Math.cos(this._toRad(latitude1)) * Math.sin(this._toRad(latitude2)) - Math.sin(this._toRad(latitude1)) * Math.cos(this._toRad(latitude2)) * Math.cos(dLon);
     var brng = this._toDeg(Math.atan2(y, x));
     return ((brng + 360) % 360);
   };

   _toRad(deg) {
     return deg * Math.PI / 180;
   };

   _toDeg(rad) {
     return rad * 180 / Math.PI;
   };




  startTracking() {

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10, 
      debug: true,
      interval: 5000 
    }
    this.backgroundGeolocation.configure(config).subscribe((location) => {
      //console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
      }); 
    }, 
    (err) => {
      console.log(err);
    });
    this.backgroundGeolocation.start();
    let options = {
      frequency: 5000, 
      enableHighAccuracy: true
    }
    this.watch = this.geolocation
      .watchPosition(options)
      .filter((p: any) => p.code === undefined)
      .subscribe((position: Geoposition) => {
        this.currentLocation = position
        this._currentLocation.next(this.currentLocation)
        this.zone.run(() => {
          this.lat = position.coords.latitude
          this.lng = position.coords.longitude
        })
      })
   }
  
  stopTracking() {
    console.log('stopTracking');
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
  } 

}