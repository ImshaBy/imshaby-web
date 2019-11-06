import { Component } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { MassService } from '../_services/mass.service';
import { MassSchedule } from '../_models/massSchedule';
import { Day } from '../_models/day';
import { Utils } from '../_services/app.utils';

@Component({
  selector: 'by-view',
  templateUrl: './byApp.component.html',
  styleUrls: ['./byApp.component.css'],
  providers:[MassService, Utils, CookieService]
})

export class ByAppComponent {
  masses: MassSchedule;
  massService: MassService;
  utils: Utils;
  today: Date;
  days: Day[];
  selectedDay: number;
  selectedDate: Date;
  cookieService: CookieService;
  lang: string;

  constructor(private pMassService: MassService, private pUtils: Utils, private pCookieService: CookieService ) {
    this.massService = pMassService;
    this.utils = pUtils;
    this.cookieService = pCookieService;
    this.masses = new MassSchedule();
    this.lang = 'be';
  }

  refresh(){
    this.today = new Date();

    this.days = this.getActualDays('be');
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
      this.getTodayScheduleAsync();
  }

  getTodaySchedule(): MassSchedule {
    return this.massService.getTodaySchedule();
  }

  getTodaySchedulePromise(){
    this.massService.getTodaySchedulePromise().then(masses => this.masses = masses);
  }

  getTodayScheduleAsync() {
    this.massService.getTodayScheduleAsync(this.lang)
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
  checkMassesAmount(amount: number): boolean {
    if (amount === 1 || amount === 21 || amount === 31 || amount === 41) {
        return true;
    }
  }

  /**
   * Check if mass info should be updated
   * @param param
   * @returns {boolean}
   */
  needUpdate(param: boolean ): boolean {
    return !!param;
  }

  getActualDays(locale: string): Day[] {
    return this.utils.getActualDays(locale);
  }
}
