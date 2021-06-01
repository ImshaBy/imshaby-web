import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import 'rxjs/Rx';

import { MassSchedule, MassDay } from '../_models/massSchedule';
import { MassScheduleJSON, MassDayJSON } from '../_models/massScheduleJSON';
import { environment } from '../../environments/environment';
import { Nav } from '../_models/navigation';


@Injectable()
export class MassService {
  // private API_URI = 'masses.json';
  private API_URI = '/api/mass/week';

  constructor(private http: HttpClient) {}

  //TODO implement if it's needed
  getTodaySchedule():MassSchedule {
    return null;
  }

  getTodayScheduleAsyncWithAllParams(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) : Observable<MassSchedule> {
    const URL = this.getServiceURL(pLang, pOnline, pCityId, pParish, pMassLang);

    return this.http.get(URL, { withCredentials: true }).pipe(
      map((response: Response) => {
        let massScheduleJSON: MassScheduleJSON = Object.assign(new MassScheduleJSON(), response);

        return this.transform(massScheduleJSON);
      }));
  }

  private getParams(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {
    const langParam = pLang ? `?lang=${pLang}` : '';
    const onlineParam = pOnline ? `&online=true` : '';
    const cityParam = pCityId ? `&cityId=${pCityId}` : '';
    const parishParam = pParish ? `&parishId=${pParish}` : '';
    const massLangParam = pMassLang ? `&massLang=${pMassLang}` : '';

    return langParam + cityParam + onlineParam + parishParam + massLangParam;
  }

  private getServiceURL(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {
    const apiURL = environment.apiHost;
    const params = this.getParams(pLang, pOnline, pCityId, pParish, pMassLang);

    return apiURL + this.API_URI + params;
  }

  private transform(massScheduleJSON: MassScheduleJSON) {
    let massDays: MassDayJSON[] = massScheduleJSON.schedule;
    let massDaysFinal: MassDay[] = [];
    let nav: Nav = massScheduleJSON.nav;

    for (let massDay of massDays) {
      let massDayFinal = new MassDay();
      massDayFinal.date = new Date(massDay.date);
      massDayFinal.massHours = massDay.massHours;
      massDaysFinal.push(massDayFinal);
    }

    let massSchedule: MassSchedule = new MassSchedule();
    massSchedule.schedule = massDaysFinal;
    massSchedule.nav = nav;

    return massSchedule;
  }

  //TODO implement if it's needed
  getTodaySchedulePromise() : Promise<MassSchedule> {
    return null;
    // return Promise.resolve(SCHEDULE);
  }

}
