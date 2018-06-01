import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ObsFormPage } from './obs-form';

@NgModule({
  declarations: [
    ObsFormPage,
  ],
  imports: [
    IonicPageModule.forChild(ObsFormPage),
  ],
})
export class ObsFormPageModule {}
