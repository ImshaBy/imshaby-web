import { Component, HostListener } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { MetaService } from 'ng2-meta';
import { Router, NavigationEnd, Event } from '@angular/router';

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
  public isCollapsed: boolean = true;


  constructor(
    private pCookieService: CookieService,
    private metaService: MetaService,
    private router: Router,
    ) {
    this.cookieService = pCookieService;
    this.lang = 'be';
  }

  ngOnInit() {
    this.router.events.subscribe((event:Event) => {
      if(event instanceof NavigationEnd ){
        let langs = ['/by', '/ru', '/en', '/pl'];

        if(event.url === '/by') {
          event.url = '/be'
        }

        if (langs.includes(event.url)) {
          this.onChangeLang(event.url.replace('/', ''));
        }
      }
    });
  }

  onChangeLang(pLang: string): void {
    this.lang = pLang;
    this.cookieService.put("i_lang", this.lang);
  }

  expandLangSwitcher() {
    this.isCollapsed = !this.isCollapsed;
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
