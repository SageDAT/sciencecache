import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Camera } from '@ionic-native/camera'
import { BackgroundGeolocation } from '@ionic-native/background-geolocation'
import { Geolocation } from '@ionic-native/geolocation';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { MyApp } from './app.component';

import { HelpPage } from '../pages/help/help';
import { VisitsPage } from '../pages/visits/visits';
import { RoutesPage } from '../pages/routes/routes';
import { TabsPage } from '../pages/tabs/tabs';
import { RoutePage } from '../pages/route/route';
import { WaypointPage } from '../pages/waypoint/waypoint';
import { SettingsPage } from '../pages/settings/settings';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalScienceCacheProvider } from '../providers/local-science-cache/local-science-cache';
import { RemoteScienceCacheProvider } from '../providers/remote-science-cache/remote-science-cache';
import { LocationTrackerProvider } from '../providers/location-tracker/location-tracker';
import { RouteProvider } from '../providers/route/route';
import { VisitProvider } from '../providers/visit/visit';
import {RegistrationPage} from "../pages/registration/registration";
import {IonicStorageModule} from "@ionic/storage";
import {ObsFormPage} from "../pages/obs-form/obs-form";

@NgModule({
  declarations: [
    MyApp,
    HelpPage,
    VisitsPage,
    RoutesPage,
    RoutePage,
    TabsPage,
    SettingsPage,
    WaypointPage,
    RegistrationPage,
    ObsFormPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp, {
      scrollAssist: false,
      autoFocusAssist: false
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelpPage,
    VisitsPage,
    RoutesPage,
    RoutePage,
    WaypointPage,
    SettingsPage,
    TabsPage,
    RegistrationPage,
    ObsFormPage
  ],
  providers: [
    HttpModule,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LocalScienceCacheProvider,
    RemoteScienceCacheProvider,
    LocationTrackerProvider,
    BackgroundGeolocation,
    Geolocation,
    Camera,
    Device,
    Network,
    RouteProvider,
    VisitProvider
  ]
})
export class AppModule {}
