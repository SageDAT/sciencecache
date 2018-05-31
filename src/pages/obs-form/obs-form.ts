import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {RouteProvider} from "../../providers/route/route";

/**
 * Generated class for the ObsFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-obs-form',
  templateUrl: 'obs-form.html',
})
export class ObsFormPage {

  obs_id: number = null
  currentRoute: any = null
  showHelp: boolean = false
  currentObsPoint: any = null

  test: any = null

  constructor(public navCtrl: NavController, public navParams: NavParams, public routeProvider: RouteProvider) {
  }

  getObsPoint(obs_id){
    if(obs_id && this.currentRoute) {
      return this.currentRoute.observation_points.find( obspt => {
         return obspt.id == obs_id
      })
    }
  }

  ngOnInit() {
    this.obs_id = this.navParams.get('obs_id')

    this.routeProvider.currentRouteSubject.subscribe(currentRoute=> {
      this.currentRoute = currentRoute;
      this.currentObsPoint = this.getObsPoint(this.obs_id)
    })

  }

  questionOptions(options) {
    let parsedOptions = null
    if(options) {
      try {
        parsedOptions = JSON.parse(options)
      } catch (e) {
        parsedOptions = null
      }
    }
    return parsedOptions
  }

  backToRoute(){
    this.navCtrl.pop()
    this.navCtrl.pop()
  }
}
