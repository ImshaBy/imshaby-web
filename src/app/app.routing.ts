import { Routes, RouterModule } from '@angular/router';
import { ByAppComponent } from './byApp';
import { EnAppComponent } from './enApp';
import { RuAppComponent } from './ruApp';
import { PlAppComponent } from './plApp';


const appRoutes: Routes = [
  { path: '', component: ByAppComponent },    
  { path: 'en', component: EnAppComponent },    
  { path: 'ru', component: RuAppComponent }, 
  { path: 'pl', component: PlAppComponent }, 

  // { path: '', redirectTo: '/by', pathMatch: 'full'},   
  // otherwise redirect to root
   { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
