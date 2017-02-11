
import {Injectable} from "@angular/core";

import {Day} from "../_models/day";

@Injectable()
export class Utils {
  public DAYS = ["Sunday", "Monday", "Tuesday", "Wensday", "Thursday", "Friday", "Sutturday"];

  public getActualDays():Day[] {
    console.log("actual days")
    var actualDays = [];
    var now = new Date();
    var counter = 0;
    while(counter < 7){
      var date =  this.addDays(now, counter);
      var day = new Day(date, this.DAYS[date.getDay()], date.toDateString());
      actualDays.push(day);
      counter++;
    }
    console.log("actual days - finished")

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
