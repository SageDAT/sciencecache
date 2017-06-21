import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { LocalScienceCacheProvider } from '../../providers/local-science-cache/local-science-cache'

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  template: `<ion-list>
      <ion-list-header>Settings</ion-list-header>
      <button ion-item (click)="resetDB()">Erase Local Data</button>
    </ion-list>`,
})
export class SettingsPage {

  constructor(public navCtrl: NavController, private lscService: LocalScienceCacheProvider) {
  }

  ionViewDidLoad() {
  }

  resetDB() {
    this.lscService.wipeRoutesDB()
    this.lscService.wipeVisitsDB()
  }

}
