
import {MassHour} from "./massSchedule";

export class MassScheduleJSON {
  schedule: MassDayJSON[]
}

export class MassDayJSON {
  date: string;
  massHours: MassHour[]
}
