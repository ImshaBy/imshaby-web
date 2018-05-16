
import {Injectable} from '@angular/core';

import {Day} from '../_models/day';

@Injectable()
export class Utils {
  public DAYS = ['Нядзеля', 'Панядзелак', 'Аўторак', 'Серада', 'Чацвер', 'Пятнiца', 'Субота'];

  public getActualDays(): Day[] {
    let actualDays = [];
    let now = new Date();
    let counter = 0;
    while (counter < 7) {
      let date =  this.addDays(now, counter);
      let day = new Day(date, this.DAYS[date.getDay()], date.toDateString());
      actualDays.push(day);
      counter++;
    }
    return actualDays;
  }

  private addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
  return result;
}

  public getSelectedDay( date: Date){
    return date.getDay();
  }

}
