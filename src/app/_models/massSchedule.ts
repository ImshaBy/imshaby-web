import {Mass} from './mass';
import {MassScheduleJSON} from './massScheduleJSON';

export class MassSchedule {
  schedule: MassDay[]
}

export class MassHour{
  hour: string;
  data: Mass[];
  active: boolean;
}

export class MassDay {
  date: Date;
  massHours: MassHour[]
}
