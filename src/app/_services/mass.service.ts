
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import 'rxjs/Rx';

import { MassSchedule, MassDay } from '../_models/massSchedule';
import { MassScheduleJSON, MassDayJSON } from '../_models/massScheduleJSON';
import { environment } from '../../environments/environment';


@Injectable()
export class MassService {
  // private API_URI = 'masses.json';
  private API_URI = '/api/mass/week';

  constructor(private HttpClient: HttpClient) {}

  //TODO implement if it's needed
  getTodaySchedule():MassSchedule {
    return null;
    // return SCHEDULE;
  }

  getTodayScheduleAsync(pLang: String, pOnline: Boolean) : Observable<MassSchedule> {
    return this.HttpClient.get(this.getServiceURL(pLang, pOnline), {  withCredentials: true}).pipe(
      map((response: { json: () => any; }) => {
        let jsonObject = response.json();
        let massScheduleJSON: MassScheduleJSON = Object.assign(new MassScheduleJSON(), jsonObject);

        return this.transform(massScheduleJSON);
      }));
  }

  private getParams(pLang: String, pOnline: Boolean) {
    const langParam = pLang ? `?lang=${pLang}` : '';
    const onlineParam = pOnline ? `&online=true` : '';

    return langParam + onlineParam;
  }

  private getServiceURL(pLang: String, pOnline: Boolean) {
    const apiURL = environment.apiHost;
    const params = this.getParams(pLang, pOnline);

    return apiURL + this.API_URI + params;
  }

  private transform(massScheduleJSON: MassScheduleJSON) {
    let massDays: MassDayJSON[] = massScheduleJSON.schedule;
    let massDaysFinal: MassDay[] = [];

    for (let massDay of massDays) {
      let massDayFinal = new MassDay();
      massDayFinal.date = new Date(massDay.date);
      massDayFinal.massHours = massDay.massHours;
      massDaysFinal.push(massDayFinal);
    }

    let massSchedule: MassSchedule = new MassSchedule();
    massSchedule.schedule = massDaysFinal;

    return massSchedule;
  }

  //TODO implement if it's needed
  getTodaySchedulePromise() : Promise<MassSchedule> {
    return null;
    // return Promise.resolve(SCHEDULE);
  }

}
