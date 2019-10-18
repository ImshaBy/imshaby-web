import { Component, HostListener } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';

import { Day } from './_models/day';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CookieService]
})

export class AppComponent {
  days: Day[];
  cookieService: CookieService;
  lang: string;

  constructor(private pCookieService: CookieService ) {
    this.cookieService = pCookieService;
    this.lang = 'be';
  }

  onChangeLang(pLang: string): void {
    this.lang = pLang;
    this.cookieService.put("i_lang", this.lang);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
     if (window.pageYOffset > 315 && window.pageYOffset < document.getElementById('tabs-box').offsetHeight + 315 ) {
       let element = document.getElementById('navbar');
       element.classList.add('sticky');
     } else {
       let element = document.getElementById('navbar');
       element.classList.remove('sticky');
     }
  }
}
