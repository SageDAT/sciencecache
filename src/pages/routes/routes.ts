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

  localRoutes: any = [];
  remoteRoutes: any = [];
  localRoutesList: any = [];
  badLoad: any = {};
  badLoadBool: boolean = false;
  routeBadLoad: any = {};
  routeBadLoadBool: boolean = false;
  savingRoute: boolean = false;
  localRoutesLoaded: boolean = false;

  constructor(public http: Http, public alertController: AlertController, public navCtrl: NavController,
              public lscService: LocalScienceCacheProvider, public rscService: RemoteScienceCacheProvider) {
  }

  loadRoute(id) {
    this.navCtrl.push(RoutePage, {'id': id})
  }

  removeRoute(index) {
    this.lscService.deleteRoute(this.localRoutesList[index]);
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

  setup() {

    this.rscService.routesListSubject.subscribe(routesList =>{
      this.remoteRoutes = routesList;
    })
    this.lscService.localRoutesListSubject.subscribe(localRoutesList=> {
      this.localRoutesList = localRoutesList
    });
    this.lscService.localRoutesLoadedSubject.subscribe(localRoutesLoaded=> {
      this.localRoutesLoaded = localRoutesLoaded
    });
    this.rscService.badLoadSubject.subscribe(badLoad => {
      this.badLoad = badLoad
    });
    this.rscService.badLoadBoolSubject.subscribe(badLoadBool => {
      this.badLoadBool = badLoadBool
    });
    this.rscService.routeBadLoadSubject.subscribe( routeBad => {
      this.routeBadLoad = routeBad
    });
    this.rscService.routeBadLoadBoolSubject.subscribe(badBadBool => {
      this.routeBadLoadBool = badBadBool
    });
    this.rscService.savingRouteSubject.subscribe(savingRoute=> {
      this.savingRoute = savingRoute
    })

  }

  ngOnInit() {
    this.setup();
  }

  infoAlert(index) {
    let alert = this.alertController.create({
      title: this.remoteRoutes[index].name,
      subTitle: this.remoteRoutes[index].description,
      message: '<span>Difficulty: ' + this.remoteRoutes[index].route_difficulty.difficulty + '</span><br /><span>Length: ' + this.remoteRoutes[index].route_length.length + '</span><br /><span>Waypoints: ' + this.remoteRoutes[index].waypoint_count + '</span>',
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
          this.downloadRoute(this.remoteRoutes[index].route)
        }
      }
    ]
    });
    alert.present();
  }

}
