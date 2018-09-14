
import {Injectable} from '@angular/core';
import {Day} from '../_models/day';
import * as moment from 'moment';

@Injectable()
export class Utils {
  public getActualDays(): Day[] {
    let actualDays = [];

    for (let counter = 0; counter < 7; counter++) {
      let dateObject =  this.incrementDate(new Date(), counter);
      let momentObject = this.incrementMoment(counter);
      let formattedDayName = this.getFormattedDayName(momentObject);
      let formattedDate = this.getFormattedDate(momentObject);

      let day = new Day(dateObject, formattedDayName, formattedDate);
      actualDays.push(day);
    }

    return actualDays;
  }

  /**
   *
   * @param {Date} date
   * @param {Number} days
   * @returns {Date}
   */
  private incrementDate(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);

    return result;
  }

  /**
   *
   * @param days
   * @returns {moment.Moment}
   */
  private incrementMoment(days) {
    return moment().add(days, 'days');
  }

  /**
   *
   * @param {moment} date
   * @returns {any}
   */
  private getFormattedDate(date) {
    let formatted;

    if (this.isMobileWidth()) {
      formatted = date.locale('be').format('L').replace(/\.[0-9][0-9][0-9][0-9]/, '');

    } else {
      formatted = date.locale('be').format('D MMMM');
    }

    return formatted;
  }

  /**
   * Get formatted name of day
   *
   * @param {moment} date
   * @returns {any}
   */
  private getFormattedDayName(date) {
    let dayName;

    if (this.isMobileWidth()) {
      dayName = date.locale('be').format('ddd')
    } else {
      dayName = date.locale('be').format('dddd');
    }

    return dayName;
  }

  /**
   * Checks that is mobile width
   *
   * @return {Boolean}
   */
  private isMobileWidth() {
    return window.innerWidth < 768;
  }

  /**
   *
   * @param {Date} date
   * @returns {Number}
   */
  public getSelectedDay(date: Date) {
    return date.getDay();
  }
}
