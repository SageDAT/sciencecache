import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaypointPage } from './waypoint';

@NgModule({
  declarations: [
    WaypointPage,
  ],
  imports: [
    IonicPageModule.forChild(WaypointPage),
  ],
  exports: [
    WaypointPage
  ]
})
export class WaypointPageModule {}
