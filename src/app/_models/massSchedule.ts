import { Mass } from './mass';
import { MassScheduleJSON } from './massScheduleJSON';
import { Nav } from './navigation';

export class MassSchedule {
  nav: Nav;
  schedule: MassDay[]
}

export class MassHour {
  hour: string;
  data: Mass[];
  active: boolean;
}

export class MassDay {
  date: Date;
  massHours: MassHour[]
}
