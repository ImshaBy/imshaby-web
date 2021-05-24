import { BrowserModule,  } from '@angular/platform-browser';
import { MetaModule } from 'ng2-meta';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'angular2-cookie/core';

//custom
import { AppComponent } from './app.component';
import { routing } from './app.routing'
import { RuAppComponent } from './ruApp/index';
import { EnAppComponent } from './enApp/index';
import { ByAppComponent } from './byApp/index';
import { PlAppComponent } from './plApp/index';

import { MassService } from './_services/mass.service';
import { Utils } from './_services/app.utils';

@NgModule({
  declarations: [
    AppComponent,
    //custom
    RuAppComponent,
    EnAppComponent,
    ByAppComponent,
    PlAppComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    MetaModule.forRoot(),
  ],
  providers: [
	  MassService,
    Utils,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
