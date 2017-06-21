import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Network } from "@ionic-native/network";
import { Device } from "@ionic-native/device"
import { RouteProvider } from '../../providers/route/route'
import { LocalScienceCacheProvider } from '../../providers/local-science-cache/local-science-cache'
import { RemoteScienceCacheProvider } from '../../providers/remote-science-cache/remote-science-cache'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/map'

declare var navigator: any;
declare var Connection: any;

@Component({
  selector: 'page-visits',
  templateUrl: 'visits.html'
})
export class VisitsPage implements OnInit {

  localVisitsSubscription:Subscription
  localVisitsLoadedSubscription:Subscription
  localVisitsList: any
  loadVisitsLoaded: boolean = false
  allowUploads: boolean = false
  device_info: any = {}

  constructor(public navCtrl: NavController, public routeProvider: RouteProvider, public rscService: RemoteScienceCacheProvider, public lscService: LocalScienceCacheProvider, private network: Network, public platform: Platform, private device: Device) {
  }

  ionViewWillEnter() {
    this.lscService.loadVisits().then(localVisits =>{
      console.log(localVisits)
    })
  }

  ionViewDidEnter() {
    let networkType = this.network.type
    if (networkType = 'wifi') {
      this.allowUploads = true
    }
    this.device_info = {
      'cordova': this.device.cordova,
      'uuid': this.device.uuid,
      'model': this.device.model,
      'platform': this.device.platform,
      'version': this.device.version,
      'manufacturer': this.device.manufacturer,
      'isVirtual': this.device.isVirtual,
      'serial': this.device.serial
    }
  }

  uploadVisit(visit_index) {
    this.rscService.postVisit(this.localVisitsList[visit_index], this.device_info).subscribe(
      data => {
        if (data['visit_added']) {
          this.localVisitsList[visit_index].submitted = data['visit_added']
        } else {
          this.localVisitsList[visit_index].submitted = false
        }
        this.lscService.updateVisit(this.localVisitsList[visit_index])
      }
    )
  }

  formatDate(timedate) {
    if (!timedate) {
      return false
    }
    var year = timedate.substring(0,4)
    var month = timedate.substring(5,7)
    var day = timedate.substring(8,10)
    var thisTime = timedate.substring(11,19)
    return month + '-' + day + '-' + year + ', ' + thisTime
  }

  ngOnInit() {
    this.localVisitsSubscription = this.lscService._localVisitsList.subscribe(localRoutesList=> {
      this.localVisitsList = localRoutesList
    })
    this.localVisitsLoadedSubscription = this.lscService._localVisitsLoaded.subscribe(localRoutesLoaded=> {
      this.loadVisitsLoaded = localRoutesLoaded
    })
  }

}