import { Component, OnInit } from '@angular/core';

import { Mass } from '../_models/index';
import { MassDailySchedule } from '../_models/index';

import { MassService } from '../_services/index';

@Component({
  selector: 'home-view',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers:[MassService]
})
export class HomeComponent implements OnInit {
  massSchedule: MassDailySchedule;
  massService: MassService;
  constructor(private pMassService: MassService) {
      console.log("Home component constructor")
      this.massService = pMassService;
  }

  ngOnInit() {
    console.log("Home component onInit")
  }


}
