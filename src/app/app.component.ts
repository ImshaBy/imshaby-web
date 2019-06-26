import { Component, HostListener } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { Mass } from './_models/index';
import {MassService} from './_services/mass.service';
import {MassSchedule} from './_models/massSchedule';
import {Day} from './_models/day';
import {Utils} from './_services/app.utils';
import {Parish} from './_models/parish';

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
    this.massService = pMassService;
    this.utils = pUtils;
    this.masses = new MassSchedule();
  }

  refresh(){
    this.today = new Date();
    // this.masses = this.getTodaySchedule();

    // this.getTodaySchedulePromise();
    this.days = this.getActualDays();
    this.selectedDay = this.utils.getSelectedDay(this.today);
    this.selectedDate = this.today;
    this.getTodayScheduleAsync();
  }

  ngOnInit() {
    this.refresh();
  }

  onSelect(massDay: Date): void {
      this.refresh();
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
      },
      error => console.error('Error: ' + error)
    );
  }

  /**
   * Check amount of masses to display proper card label
   * @param amount
   * @returns {boolean}
   */
  checkMassesAmount(amount: number) {
    if (amount === 1 || amount === 21 || amount === 31 || amount === 41) {
        return true;
    }
  }

  /**
   * Check if mass info should be updated
   * @param param
   * @returns {boolean}
   */
  needUpdate(param: boolean ) {
    return !!param;
  }

  getActualDays(): Day[] {
    return this.utils.getActualDays();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {

     if (window.pageYOffset > 315 && window.pageYOffset < document.getElementById('tabs-box').offsetHeight + 315 ) {
       let element = document.getElementById('navbar');
       element.classList.add('sticky');
     } else {
       let element = document.getElementById('navbar');
       element.classList.remove('sticky');
     }
  }
}
