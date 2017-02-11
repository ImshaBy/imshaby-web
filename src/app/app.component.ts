import { Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Mass } from './_models/index';
import {MassService} from "./_services/mass.service";
import {MassDailySchedule} from "./_models/massDailySchedule";
import {Day} from "./_models/day";
import {Utils} from "./_services/app.utils";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[MassService, Utils]
})
export class AppComponent {
  masses: MassDailySchedule;
  massService: MassService;
  utils: Utils;
  today: Date;
  days: Day[];
  selectedDay: number;

  constructor(private pMassService: MassService, private pUtils: Utils) {
    console.log("AppComponent  constructor")
    this.massService = pMassService;
    this.utils = pUtils;
  }

  refresh(){
    console.log("AppComponent  refresh");
    this.today = new Date();
    this.masses = this.getTodaySchedule();
    this.days = this.getActualDays();
    this.selectedDay = this.utils.getSelectedDay(this.today);
  }

  ngOnInit() {
    this.refresh();
    console.log("out log");
    console.log(this.masses);
  }

  onSelect(massDay: Date): void {
    this.selectedDay = massDay.getDay();
  }

  getTodaySchedule(): MassDailySchedule {
    return this.massService.getTodaySchedule();
  }

  getActualDays(): Day[] {
    return this.utils.getActualDays();
  }

}
