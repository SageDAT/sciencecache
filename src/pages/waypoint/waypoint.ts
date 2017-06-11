import { Component, OnInit } from '@angular/core'
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { Subscription } from 'rxjs/Subscription'
import { VisitProvider } from '../../providers/visit/visit'
import { RouteProvider } from '../../providers/route/route'

/**
 * Generated class for the WaypointPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-waypoint',
  templateUrl: 'waypoint.html',
})
export class WaypointPage  implements OnInit{
  id: number
  currentWaypoint: any = null
  currentWaypointSubscription: Subscription;
  currentVisit: any = null
  currentVisitSubscription: Subscription;
  onVisit:boolean = false
  onVisitSubscription: Subscription
  waypointFound: boolean = false
  waypoinFoundSubscription: Subscription
  waypointPhotos = []
  waypointPhotoRows = 1
  public base64Image: string
  options:any
  showHint: boolean = false

  constructor(public navCtrl: NavController, public navParams: NavParams, public routeProvider: RouteProvider, public visitProvider: VisitProvider, private camera: Camera) {
  }
  
  takePicture(){
    this.options = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: true,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.DATA_URL,
    }
    this.camera.getPicture(this.options)
      .then((imageData)=>{
        var base64Image = "data:image/jpeg;base64," + imageData
        this.waypointPhotos.push({'data': base64Image})
        this.waypointPhotoRows = Math.ceil(this.waypointPhotos.length / 3)
      })
  }
  
  setWaypointFound(id) {
    this.visitProvider.setWaypointFound(id)
  }

  questionOptions(options) {
    return JSON.parse(options)
  }

  ngOnInit() {
    this.id = this.navParams.get('id')
    if (this.id) {
      this.routeProvider.getWaypoint(this.id)
      this.currentWaypointSubscription = this.routeProvider._currentWaypoint.subscribe(currentWaypoint=> 
      {
        this.currentWaypoint = currentWaypoint;
      })
    }
    this.onVisitSubscription = this.visitProvider._onVisit.subscribe(onVisit=> {
      this.onVisit = onVisit
    })
    this.currentVisitSubscription = this.visitProvider._currentVisit.subscribe(currentVisit=> {
      this.currentVisit = currentVisit
    })
    this.waypoinFoundSubscription = this.visitProvider._waypointFound.subscribe(waypointFound=> {
      this.waypointFound = waypointFound
    })
  }


}
