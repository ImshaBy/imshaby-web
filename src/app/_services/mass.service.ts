import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/Rx';

import { SCHEDULE } from '../stubs/massScheduleStub';
import {MassDailySchedule} from "../_models/massDailySchedule";

@Injectable()
export class MassService {
  // private API_URL = "http://zenwebapi.azurewebsites.net/api/UserApi/";
  private API_URL = "http://localhost:5000/api/UserApi";


  getTodaySchedule():MassDailySchedule {
    return SCHEDULE;
  }
  getTodayScheduleAsync():Promise<MassDailySchedule> {
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
