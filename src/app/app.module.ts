import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

//custom
import { AppComponent } from './app.component';
import { routing }        from './app.routing'

import { HomeComponent } from './home/home.component';
import {MassService} from './_services/mass.service';
import {Utils} from './_services/app.utils';

@NgModule({
  declarations: [
    AppComponent,
    //custom
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

	  routing,
  ],
  providers: [
	  MassService,
    Utils
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
