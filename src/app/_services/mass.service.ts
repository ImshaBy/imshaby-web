import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/Rx';

import {MassSchedule, MassDay} from '../_models/massSchedule';
import {MassScheduleJSON, MassDayJSON} from '../_models/massScheduleJSON';
import { environment } from '../../environments/environment';


@Injectable()
export class MassService {
  // private API_URI = 'masses.json';
  private API_URI = '/api/mass/week';

  constructor(private http: Http) {}

  //TODO implement if it's needed
  getTodaySchedule():MassSchedule {
    return null;
    // return SCHEDULE;
  }
  getTodayScheduleAsync() : Observable<MassSchedule> {
    return this.http.get(this.getServiceURL(), { withCredentials: true})
      .map((response) => {
        let jsonObject = response.json();
        let massScheduleJSON: MassScheduleJSON = Object.assign(new MassScheduleJSON(), jsonObject);

        return this.transform(massScheduleJSON);
      });
  }


  private getServiceURL() {
    let apiURL = environment.apiHost;

    return apiURL + this.API_URI;
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


  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      let headers = new Headers({'Authorization': 'Bearer ' + currentUser.token});
      return new RequestOptions({headers: headers});
    }
  }

  private handleError(error:Response) {
    return Observable.throw(error.json().error || 'Server error');
  }

}
