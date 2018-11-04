/**
 * Created by Alena Misan on 03.01.2017.
 */
export class Day {
  public dayName: string;
  public humanFormat: string;
  public date: Date;

  constructor(date: Date, dayName: string, humanFormat: string) {
    this.date = date;
    this.dayName = dayName;
    this.humanFormat = humanFormat;
  }
}
