import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private http: HttpClient) { }

    private getParams(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {
        const langParam = pLang ? `?lang=${pLang}` : '';
        const onlineParam = pOnline ? `&online=true` : '';
        const cityParam = pCityId ? `&cityId=${pCityId}` : '';
        const parishParam = pParish ? `&parishId=${pParish}` : '';
        const massLangParam = pMassLang ? `&massLang=${pMassLang}` : '';
    
        return langParam + cityParam + onlineParam + parishParam + massLangParam;
      }

    getAvailableCities(): Observable<any> {
        return this.http.get('http://qa-api-imsha.mycloud.by/api/mass/week?lang=be');
    }

    getRelevanteFilters(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string): Observable<any> {
        const params = this.getParams(pLang, pOnline, pCityId, pParish, pMassLang);

        return this.http.get(`http://qa-api-imsha.mycloud.by/api/mass/week${params}`);
    }

    getDefaultFiltersData(): Observable<any> {
        return this.http.get('http://qa-api-imsha.mycloud.by/api/mass/week?lang=be');
    }

    getAvailableLanguages(): Observable<any> {
        return this.http.get('http://qa-api-imsha.mycloud.by/api/mass/week?lang=be');
    }

    getAvailableParishes(): Observable<any> {
        return this.http.get('http://qa-api-imsha.mycloud.by/api/mass/week?lang=be');
    }
}
