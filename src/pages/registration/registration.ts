import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {RemoteScienceCacheProvider} from "../../providers/remote-science-cache/remote-science-cache";
import {Device} from "@ionic-native/device";
import {RoutePage} from "../route/route";
import {TabsPage} from "../tabs/tabs";
import { Storage } from '@ionic/storage';

export class DeviceInfo {
  user_email: String;
  cordova: String;
  uuid: String;
  model: String;
  platform: String;
  version: String;
  manufacturer: String;
  is_virtual: String;
  serial: String;

  constructor(email, cordova, uuid, model, platform, version, manufacturer, isVirtual, serial) {
    this.user_email = email;
    this.cordova = cordova;
    this.uuid = uuid;
    this.model = model;
    this.platform = platform;
    this.version = version;
    this.manufacturer = manufacturer;
    this.is_virtual = isVirtual;
    this.serial = serial;
  }

}

/**
 * Generated class for the RegistrationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {

  isRegistered:boolean = false;
  emailProvided:boolean = false;
  email:string = null;
  deviceinfo:any = null
  isValidEmail:boolean = null;
  registrationFailed: boolean = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, public rscService: RemoteScienceCacheProvider,
              private device: Device, private storage: Storage) {}

  setDeviceInfo() {
    if(this.email){
      this.email = this.email.trim()
      if(this.email == '') this.email = null
    }

    const deviceinfo = new DeviceInfo(this.email, this.device.cordova, this.device.uuid, this.device.model,
      this.device.platform, this.device.version, this.device.manufacturer, this.device.isVirtual, this.device.serial)

    return deviceinfo
  }

  sendDeviceInfo() {
    this.deviceinfo = this.setDeviceInfo()
    console.log('will send: ', JSON.stringify(this.deviceinfo))
    this.rscService.postDeviceData(this.deviceinfo)
      .subscribe( data => {
        console.log('Registration success.', data)
        this.isRegistered = true
        this.storage.set('deviceinfo', this.deviceinfo)
        if(this.deviceinfo.user_email) {
          this.emailProvided = true
        } else {
          this.emailProvided = false
        }
      }, error => {
        console.log('Registering failed.', JSON.stringify(error))
        this.registrationFailed = true
      });
  }

  setup() {

    this.storage.get('deviceinfo').then((val) => {
      console.log('Loading device info ', val);
      if(val && val.uuid) {
        // this.isRegistered = true
        this.gotoRoutes()
      }
    });

    if(this.isRegistered) {
      this.gotoRoutes()
    }
  }

  gotoRoutes() {
    this.navCtrl.push(TabsPage)
  }

  ngOnInit() {
    // this.storage.remove('deviceinfo')
    this.setup()
    this.deviceinfo = this.setDeviceInfo()

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrationPage');
  }

  checkValidEmail() {
    this.isValidEmail = false
    if(this.email == null) {
      this.isValidEmail = true
    }
    if(this.email == '') {
      this.isValidEmail = true
    }
    if(this.email) {

    }
    return this.isValidEmail
  }

}
