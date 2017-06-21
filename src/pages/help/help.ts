import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SettingsPage } from '../settings/settings'
import { PopoverController } from 'ionic-angular';
import { LocalScienceCacheProvider } from '../../providers/local-science-cache/local-science-cache'

@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})

export class HelpPage {

  constructor(public navCtrl: NavController, public lscService: LocalScienceCacheProvider, private popoverCtrl: PopoverController) {
  }

  presentPopover() {
    let popover = this.popoverCtrl.create(SettingsPage);
    popover.present()
  }

}
