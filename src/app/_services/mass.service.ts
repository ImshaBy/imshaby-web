import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/Rx';

import { SCHEDULE } from '../stubs/massScheduleStub';
import {MassSchedule, MassDay} from "../_models/massSchedule";
import {MassScheduleJSON, MassDayJSON} from "../_models/massScheduleJSON";


@Injectable()
export class MassService {
  // private API_URL = "masses.json";
  private API_URL = "http://localhost:3000/api/mass/week";

  constructor(private http: Http) {}

  getTodaySchedule():MassSchedule {
    return SCHEDULE;
  }
  getTodayScheduleAsync() : Observable<MassSchedule> {
    console.log("async call");
    return this.http.get(this.API_URL)
      .map((response) => {
        let jsonObject = response.json();
        let massScheduleJSON: MassScheduleJSON = Object.assign(new MassScheduleJSON(), jsonObject);
        return this.transform(massScheduleJSON);
      });
  }

  private transform(massScheduleJSON: MassScheduleJSON) {
    let massDays: MassDayJSON[] = massScheduleJSON.schedule;
    let massDaysFinal: MassDay[] = [];
    for (let massDay of massDays) {
      let massDayFinal = new MassDay();
      console.log("massDay processing:")
      console.log(massDay.date);
      massDayFinal.date = new Date(massDay.date);
      console.log(massDayFinal.date);
      massDayFinal.massHours = massDay.massHours;
      massDaysFinal.push(massDayFinal);
    }
    let massSchedule: MassSchedule = new MassSchedule();
    massSchedule.schedule = massDaysFinal;
    return massSchedule;
  }


  getTodaySchedulePromise() : Promise<MassSchedule> {
    return Promise.resolve(SCHEDULE);
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
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }

}
