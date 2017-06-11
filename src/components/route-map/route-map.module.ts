import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RouteMapComponent } from './route-map';

@NgModule({
  declarations: [
    RouteMapComponent,
  ],
  imports: [
    IonicPageModule.forChild(RouteMapComponent),
  ],
  exports: [
    RouteMapComponent
  ]
})
export class RouteMapComponentModule {}
