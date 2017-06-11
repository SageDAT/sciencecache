import { Component, OnInit } from '@angular/core'
import { AlertController, LoadingController } from 'ionic-angular'
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
  serviceRoutesSubscription:Subscription
  badLoadSubscription:Subscription
  localRoutes: any = []
  serviceRoutes: any = []
  routesList: any = []
  localRoutesList: any = []
  badLoad:boolean = false
  displayCards: any = []
  
  constructor(public http: Http, public alertController: AlertController, public navCtrl: NavController, public lscService: LocalScienceCacheProvider, public rscService: RemoteScienceCacheProvider, public loadingController: LoadingController) {
  }

  loadRoute(id) {
    this.navCtrl.push(RoutePage, {'id': id})
  }
  
  removeRoute(index) {
    this.lscService.deleteRoute(this.localRoutesList[index])
    this.lscService.getRoutes().then(data=>
    { 
      this.rscService.loadRoutes(data)
    })    
  }

  infoAlert(index) {
    let alert = this.alertController.create({
      title: this.routesList[index].name,
      subTitle: this.routesList[index].description,
      message: '<span>Difficulty: ' + this.routesList[index].route_difficulty.name + '</span><br /><span>Length: ' + this.routesList[index].route_length.length + '</span><br /><span>Waypoints: ' + this.routesList[index].waypoints_count + '</span>',
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
          this.downloadRoute(this.routesList[index].id)
        }
      }
    ]
    });
    alert.present();
  }

  downloadRoute(id) {
    this.rscService.saveRoute(id)
  }

  ionViewWillEnter() {
    this.lscService.getRoutes().then(data=>
    { 
      console.log('loading service')
      this.rscService.loadRoutes(data)
    })    
  }

  ngOnInit() {
    let loader = this.loadingController.create({
      content: "Retrieving ScienceCache Routes."
    })

    this.serviceRoutesSubscription = this.rscService._routesList.subscribe(routesList=> {
      this.routesList = routesList
    })
    this.localRoutesSubscription = this.lscService._localRoutesList.subscribe(localRoutesList=> {
      this.localRoutesList = localRoutesList
    })
    this.badLoadSubscription = this.rscService._badLoad.subscribe(badLoad=> {
      this.badLoad = badLoad
    })
  }

}
