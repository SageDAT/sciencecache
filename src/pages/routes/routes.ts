import { Component, OnInit } from '@angular/core'
import { AlertController } from 'ionic-angular'
import { NavController } from 'ionic-angular'
import { Http } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/map'
import { RoutePage } from '../route/route'
import { LocalScienceCacheProvider } from '../../providers/local-science-cache/local-science-cache'
import { RemoteScienceCacheProvider } from '../../providers/remote-science-cache/remote-science-cache'

@Component({
  selector: 'page-routes',
  templateUrl: 'routes.html',
})
export class RoutesPage implements OnInit {

  newRoute: any
  localRoutesSubscription:Subscription
  localRoutesLoadedSubscription:Subscription
  serviceRoutesSubscription:Subscription
  badLoadSubscription:Subscription
  savingRouteSubscription:Subscription
  localRoutes: any = []
  remoteRoutes: any = []
  localRoutesList: any = []
  badLoad:boolean = false
  savingRoute: boolean = false
  localRoutesLoaded: boolean = false
  displayCards: any = []
  
  constructor(public http: Http, public alertController: AlertController, public navCtrl: NavController, public lscService: LocalScienceCacheProvider, public rscService: RemoteScienceCacheProvider) {
  }

  loadRoute(id) {
    this.navCtrl.push(RoutePage, {'id': id})
  }
  
  removeRoute(index) {
    this.lscService.deleteRoute(this.localRoutesList[index])
    this.lscService.loadRoutes().then(data=> {
      this.rscService.loadRoutes(data)
    })    
  }

  downloadRoute(id) {
    this.rscService.saveRoute(id)
  }

  ionViewWillEnter() {
    this.lscService.loadRoutes().then(localRoutes => {
      this.rscService.loadRoutes(localRoutes)
    })    
  }

  ngOnInit() {
    this.serviceRoutesSubscription = this.rscService._routesList.subscribe(routesList=> {
      this.remoteRoutes = routesList
    })
    this.localRoutesSubscription = this.lscService._localRoutesList.subscribe(localRoutesList=> {
      this.localRoutesList = localRoutesList
    })
    this.localRoutesLoadedSubscription = this.lscService._localRoutesLoaded.subscribe(localRoutesLoaded=> {
      this.localRoutesLoaded = localRoutesLoaded
    })
    this.badLoadSubscription = this.rscService._badLoad.subscribe(badLoad=> {
      this.badLoad = badLoad
    })
    this.savingRouteSubscription = this.rscService._savingRoute.subscribe(savingRoute=> {
      this.savingRoute = savingRoute
    })
  }

  infoAlert(index) {
    let alert = this.alertController.create({
      title: this.remoteRoutes[index].name,
      subTitle: this.remoteRoutes[index].description,
      message: '<span>Difficulty: ' + this.remoteRoutes[index].route_difficulty.name + '</span><br /><span>Length: ' + this.remoteRoutes[index].route_length.length + '</span><br /><span>Waypoints: ' + this.remoteRoutes[index].waypoints_count + '</span>',
      buttons: [
      {
        text: 'Dismiss',
        role: 'cancel',
        handler: () => {
          console.log('Dismiss clicked');
        }
      },
      {
        text: 'Download',
        handler: () => {
          this.downloadRoute(this.remoteRoutes[index].id)
        }
      }
    ]
    });
    alert.present();
  }

}
