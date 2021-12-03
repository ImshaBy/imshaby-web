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
  availableOnline: boolean = true
  ;

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
        this.updateOnlineAvailability(resp.nav.guided.online);

        this.massLanguages = [...this.allLanguages];
        this.cities = [...this.allCities];
        this.parishes = [...this.allParish];
        this.allCities.length < 2
    });
  }

  private updateOnlineAvailability(onlineValues: any[]) {
    if (onlineValues && onlineValues.length < 2) {
      this.availableOnline = false;
    } else if (onlineValues) {
      this.availableOnline = true;
    }
  }

  private loadRelevanteFiltersLang(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {
    console.log('update parishes');

    this.dataService.getRelevanteFilters(pLang, pOnline, pCityId, pParish, pMassLang).pipe(delay(500)).subscribe(resp => {
      this.allParish = resp.nav.guided.parish;
      this.updateOnlineAvailability(resp.nav.guided.online);


      this.parishes = [...this.allParish];
    });
  }

  private loadRelevanteFiltersParish(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {
    console.log('update languages');

    this.dataService.getRelevanteFilters(pLang, pOnline, pCityId, pParish, pMassLang).pipe(delay(500)).subscribe(resp => {
      this.allLanguages = resp.nav.guided.lang;

      this.updateOnlineAvailability(resp.nav.guided.online);


      this.massLanguages = [...this.allLanguages];
    });
  }


  private loadRelevanteFiltersParishAndLang(pLang: String, pOnline: Boolean, pCityId: string, pParish: string, pMassLang: string) {

    this.dataService.getRelevanteFilters(pLang, pOnline, pCityId, pParish, pMassLang).pipe(delay(500)).subscribe(resp => {
      this.allLanguages = resp.nav.guided.lang;
      this.allParish = resp.nav.guided.parish;
      this.updateOnlineAvailability(resp.nav.guided.online);
      this.parishes = [...this.allParish];
      this.massLanguages = [...this.allLanguages];
      this.updateDayTabsWithMasses();

    });
  }

  refresh() {
    this.today = new Date();
    this.days = this.getActualDays('be');
    this.selectedDay = this.utils.getSelectedDay(this.today);
    this.selectedDate = this.today;
    this.getTodayScheduleAsyncWithAllParams();
  }

  refreshWithSelection(date: Date){
    this.days = this.getActualDays('be');
    this.selectedDay = this.utils.getSelectedDay(date);
    this.selectedDate = date;
    this.getTodayScheduleAsyncWithAllParams();
  }

  toggleOnlineMasses() {
    this.online = !this.online;
    this.loadRelevanteFiltersParishAndLang(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
    this.refreshWithSelection(this.selectedDate);
    // this.getTodayScheduleAsyncWithAllParams();
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
    // this.getTodayScheduleAsyncWithAllParams();
    this.refreshWithSelection(this.selectedDate);
  }

  filterByMassLang() {
    this.loadRelevanteFiltersLang(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
    // this.getTodayScheduleAsyncWithAllParams();
    this.refreshWithSelection(this.selectedDate);
  }

  resetMassLangusges() {
    this.loadRelevanteFiltersParish(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
  }

  resetParishes(){
    this.loadRelevanteFiltersLang(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
  }

  filterByParish() {
    this.loadRelevanteFiltersParish(this.lang, this.online, this.cityId, this.parishId, this.massLanguageId);
    // this.getTodayScheduleAsyncWithAllParams();
    this.refreshWithSelection(this.selectedDate);
  }

  expandFilters() {
    this.isCollapsed = !this.isCollapsed;
  }

  onSelect(massDay: Date): void {
      this.refresh();
      this.selectedDay = massDay.getDay();
      this.selectedDate = massDay;
  }

  updateDayTabsWithMasses(): boolean {
    if(this.masses.schedule){
      this.days.forEach(tabDay => {
        let massDay = this.masses.schedule.find(day => day.date.toLocaleDateString() == tabDay.date.toLocaleDateString());
        if(massDay){
          tabDay.hasMasses = true;
        }
      })
    }else{
      console.log("not initialized yet..")
    }
    return false;
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
        this.updateDayTabsWithMasses();
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
