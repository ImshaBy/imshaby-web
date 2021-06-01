
import {MassHour} from './massSchedule';
import { Nav } from './navigation';

export class MassScheduleJSON {
  nav: Nav;
  schedule: MassDayJSON[]
}

export class MassDayJSON {
  date: string;
  massHours: MassHour[]
}
