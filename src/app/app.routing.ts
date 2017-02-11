import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/index';

const appRoutes: Routes = [
    { path: 'about', component: HomeComponent },
    { path: 'contact', component: HomeComponent },
  // otherwise redirect to root
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
