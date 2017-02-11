
import {Mass} from "./mass";

export class MassDailySchedule {
  schedule: [
      {
        date: Date,
        massHours: [MassHourSchedule]
      }
  ]
}


export class MassHourSchedule{
  hour: string;
  data: [Mass];
  active: boolean;
}
