import { Component, ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { MassService } from '../_services/mass.service';
import { DataService } from '../../data.service';
import { MassSchedule } from '../_models/massSchedule';
import { Day } from '../_models/day';
import { Utils } from '../_services/app.utils';
import { delay } from 'rxjs/operators';
import { Nav } from '../_models/navigation';

@Component({
  selector: 'by-view',
  templateUrl: './byApp.component.html',
  styleUrls: ['./byApp.component.css'],
  providers:[MassService, Utils, CookieService]
})

export class ByAppComponent {
  masses: MassSchedule;
  massService: MassService;
  utils: Utils;
  today: Date;
  days: Day[];
  selectedDay: number;
  selectedDate: Date;
  cookieService: CookieService;
  lang: string;
  city: string;
  parish: string;
  massLang: string;
  online: boolean;

  nav: any;

  cityId: string | null = null;
  massLanguageId: string | null = null;
  parishId: string | null = null;
  public isCollapsed: boolean = true;

  massLanguages: any[] = [];
  allLanguages: any[] = [];
  cities: any[] = [];
  allCities: any[] = [];
  parishes: any[] = [];
  allParish: any[] = [];
  

  constructor(
    private pMassService: MassService,
    private pUtils: Utils,
    private pCookieService: CookieService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef) {
    this.massService = pMassService;
    this.utils = pUtils;
    this.cookieService = pCookieService;
    this.masses = new MassSchedule();
    this.lang = 'be';
    this.online = false;
    this.cityId = this.cityId;
    this.parishId = this.parishId;
    this.massLanguageId = this.massLanguageId;
  }
  private loadDefaultFiltersData() {
    this.dataService.getDefaultFiltersData().pipe(delay(500)).subscribe(resp => {
        this.allCities = resp.nav.guided.city;
        this.allLanguages = resp.nav.guided.lang;
        this.allParish = resp.nav.guided.parish;
        this.massLanguages = [...this.allLanguages];
        this.cities = [...this.allCities];
        this.parishes = [...this.allParish];
    });
  }

  private loadRelevanteFiltersLang(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {
    console.log('update parishes');

    this.dataService.getRelevanteFilters(pLang, pOnline, pCityId, pParish, pMassLang).pipe(delay(500)).subscribe(resp => {
      this.allParish = resp.nav.guided.parish;
      this.parishes = [...this.allParish];
    });
  }

  private loadRelevanteFiltersParish(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {
    console.log('update languages');

    this.dataService.getRelevanteFilters(pLang, pOnline, pCityId, pParish, pMassLang).pipe(delay(500)).subscribe(resp => {
      this.allLanguages = resp.nav.guided.lang;
      this.massLanguages = [...this.allLanguages];
    });
  }

  refresh() {
    this.today = new Date();
    this.days = this.getActualDays('be');
    this.selectedDay = this.utils.getSelectedDay(this.today);
    this.selectedDate = this.today;
    this.getTodayScheduleAsyncWithAllParams();
  }

  toggleOnlineMasses() {
    this.online = !this.online;
    this.getTodayScheduleAsyncWithAllParams();
  }

  ngOnInit() {
    this.refresh();
    this.loadDefaultFiltersData();
    this.cdr.detectChanges();
  }

  filterByCity() {
    this.massLanguageId = null;
    this.parishId = null;
    this.online = false;
    this.getTodayScheduleAsyncWithAllParams();
  }

  filterByMassLang() {
    this.loadRelevanteFiltersLang(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
    this.getTodayScheduleAsyncWithAllParams();
  }

  resetMassLangusges() {
    this.loadRelevanteFiltersParish(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
  }

  resetParishes(){
    this.loadRelevanteFiltersLang(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
  }

  filterByParish() {
    this.loadRelevanteFiltersParish(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
    this.getTodayScheduleAsyncWithAllParams();
  }

  expandFilters() {
    this.isCollapsed = !this.isCollapsed;
  }

  onSelect(massDay: Date): void {
      this.refresh();
      this.selectedDay = massDay.getDay();
      this.selectedDate = massDay;
  }

  getTodaySchedule(): MassSchedule {
    return this.massService.getTodaySchedule();
  }

  getTodaySchedulePromise() {
    this.massService.getTodaySchedulePromise().then(masses => this.masses = masses);
  }

  getTodayScheduleAsyncWithAllParams() {
    this.massService.getTodayScheduleAsyncWithAllParams(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId)
    .subscribe(
      masses => {
        this.masses = masses;
        this.nav = masses.nav;
      },
      error => console.error('Error: ' + error)
    );
  }

  /**
   * Check amount of masses to display proper card label
   * @param amount
   * @returns {boolean}
   */
  checkMassesAmount(amount: number): boolean {
    if (amount === 1 || amount === 21 || amount === 31 || amount === 41) {
        return true;
    }
  }

  /**
   * Check if mass info should be updated
   * @param param
   * @returns {boolean}
   */
  needUpdate(param: boolean ): boolean {
    return !!param;
  }

  getActualDays(locale: string): Day[] {
    return this.utils.getActualDays(locale);
  }
}
