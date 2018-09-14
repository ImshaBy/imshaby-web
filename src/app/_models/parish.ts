/**
 * Created by Alena Misan on 03.01.2017.
 */
export class Parish {
  parishId: string;
  name: string;
  imgPath: string;
  gps: Location;
  address: string;
  needUpdate: boolean;
}

export class Location {
  latitude: number;
  langitude: number;
}
