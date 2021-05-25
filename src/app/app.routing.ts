import { Routes, RouterModule } from '@angular/router';
import { MetaGuard } from 'ng2-meta';
import { ByAppComponent } from './byApp';
import { EnAppComponent } from './enApp';
import { RuAppComponent } from './ruApp';
import { PlAppComponent } from './plApp';


const appRoutes: Routes = [
  { 
    path: '',
    component: ByAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'Святая Імша Мінск',
        description: 'Святая Эўхарыстыя ў горадзе Мінск: расклад, час і месца. Рыма-Каталіцкая Імша і Грэка-Каталіцкая Літургія'
      }
    }
  },    
  { 
    path: 'en', 
    component: EnAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'Holy Mass Minsk',
        description: 'Holy Eucharist in Minsk: schedule, time and place. Roman Catholic Mass and Greek Catholic Liturgy'
      }
    }
  },    
  { path: 'ru',
    component: RuAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'Святая Месса Минск',
        description: 'Святая Евхаристия в городе Минск: расписание, время и место. Римско-Католическая Месса и Греко-Католическая Литургия'
      }
    }
  }, 
  { 
    path: 'pl',
    component: PlAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'Msza Święta Mińsk',
        description: 'Święta Eucharystia w mieście Mińsk: rozkład, czas i miejsce. Msza Rzymskokatolicka i Liturgia Greckokatolicka'
      }
    }
  },  
    
  // otherwise redirect to root
  { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' });
