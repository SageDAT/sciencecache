import { Component } from '@angular/core';

import { HelpPage } from '../help/help';
import { VisitsPage } from '../visits/visits';
import { RoutesPage } from '../routes/routes';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = RoutesPage;
  tab2Root = VisitsPage;
  tab3Root = HelpPage;

  constructor() {

  }
}
