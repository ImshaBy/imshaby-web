import { Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Mass } from './_models/index';
import {MassService} from "./_services/mass.service";
import {MassSchedule} from "./_models/massSchedule";
import {Day} from "./_models/day";
import {Utils} from "./_services/app.utils";
import {Parish} from "./_models/parish";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[MassService, Utils]
})
export class AppComponent {
  masses: MassSchedule;
  massService: MassService;
  utils: Utils;
  today: Date;
  days: Day[];
  selectedDay: number;
  selectedDate: Date;

  constructor(private pMassService: MassService, private pUtils: Utils) {
    console.log("AppComponent  constructor")
    this.massService = pMassService;
    this.utils = pUtils;
    this.masses = new MassSchedule();
  }

  refresh(){
    console.log("AppComponent  refresh");
    this.today = new Date();
    // this.masses = this.getTodaySchedule();
    this.getTodayScheduleAsync();
    // this.getTodaySchedulePromise();
    this.days = this.getActualDays();
    this.selectedDay = this.utils.getSelectedDay(this.today);
    this.selectedDate = this.today;
  }

  ngOnInit() {
    this.refresh();
  }

  onSelect(massDay: Date): void {
    console.log(massDay);
    this.selectedDay = massDay.getDay();
    this.selectedDate = massDay;
  }

  getTodaySchedule(): MassSchedule {
    return this.massService.getTodaySchedule();
  }

  getTodaySchedulePromise(){
    this.massService.getTodaySchedulePromise().then(masses => this.masses = masses);
  }

  getTodayScheduleAsync() {
    this.massService.getTodayScheduleAsync()
    .subscribe(
      masses => {
        this.masses = masses;
        console.log(this.masses);
      },
      error => console.error('Error: ' + error),
      () => console.log('Completed async!')
    );
  }



  getActualDays(): Day[] {
    return this.utils.getActualDays();
  }

}
