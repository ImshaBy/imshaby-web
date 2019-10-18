import { Routes, RouterModule } from '@angular/router';
import { ByAppComponent } from './byApp';
import { EnAppComponent } from './enApp';
import { RuAppComponent } from './ruApp';

const appRoutes: Routes = [
  { path: 'by', component: ByAppComponent },    
  { path: 'en', component: EnAppComponent },    
  { path: 'ru', component: RuAppComponent }, 
  { path: '', redirectTo: '/by', pathMatch: 'full'},   
  // otherwise redirect to root
  { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
