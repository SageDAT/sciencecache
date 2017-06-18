import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocalScienceCacheProvider } from '../../providers/local-science-cache/local-science-cache'

@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {

  constructor(public navCtrl: NavController, public lscService: LocalScienceCacheProvider) {
  }

  resetDB() {
    this.lscService.wipeRoutesDB()
    this.lscService.wipeVisitsDB()
  }

}
