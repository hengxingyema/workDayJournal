import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from '../../../../../../..';

@IonicPage({
  segment: 'secondPage/user/:userId/name/:name'
})
@Component({
  templateUrl: 'second-page.html'
})
export class SecondPage {

  userId: string;
  name: string;
  constructor(public nav: NavController, public params: NavParams) {
    this.userId = this.params.data.userId;
    this.name = this.params.data.name;
  }

  goToNextPage() {
    this.nav.push('ThirdPage', { paramOne: 'Tobey', paramTwo: 'Kevin'});
  }
}
