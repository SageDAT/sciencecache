import { Component } from '@angular/core';

/**
 * Generated class for the RouteMapComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'route-map',
  templateUrl: 'route-map.html'
})
export class RouteMapComponent {

  text: string;

  constructor() {
    console.log('Hello RouteMapComponent Component');
    this.text = 'Hello World';
  }

}
