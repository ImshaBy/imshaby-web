import {Parish} from './parish';
import {LocalTime} from './localTime';
/**
 * Created by Alena Misan on 03.01.2017.
 */
export class Mass {
  langCode: string;
  parish: Parish;
  duration: number;
  info: string;
  needUpdate: boolean;

  constructor(langCode: string, parish: Parish, duration: number, info: string, needUpdate: boolean) {
    this.langCode = langCode;
    this.parish = parish;
    this.duration = duration;
    this.info = info;
    this.needUpdate = needUpdate;
  }
}
