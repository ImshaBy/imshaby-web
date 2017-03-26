
import {Injectable} from "@angular/core";

import {Day} from "../_models/day";

@Injectable()
export class Utils {
  public DAYS = ["Sunday", "Monday", "Tuesday", "Wendsday", "Thursday", "Friday", "Saturday"];

  public getActualDays():Day[] {
    var actualDays = [];
    var now = new Date();
    var counter = 0;
    while(counter < 7){
      var date =  this.addDays(now, counter);
      var day = new Day(date, this.DAYS[date.getDay()], date.toDateString());
      actualDays.push(day);
      counter++;
    }
    return actualDays;
  }

  private addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
  return result;
}

  public getSelectedDay( date: Date){
    return date.getDay();
  }

}
