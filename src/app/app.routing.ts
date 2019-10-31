import { Routes, RouterModule } from '@angular/router';
import { MetaGuard } from 'ng2-meta';
import { ByAppComponent } from './byApp';
import { EnAppComponent } from './enApp';
import { RuAppComponent } from './ruApp';
import { PlAppComponent } from './plApp';


const appRoutes: Routes = [
  {
    path: 'by',
    component: ByAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'By',
        description: 'By - Description of the home page'
      }
    }
  },
  {
    path: 'en',
    component: EnAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'En',
        description: 'En - Description of the home page'
      }
    }
  },
  { path: 'ru',
    component: RuAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'Ru',
        description: 'Ru - Description of the home page'
      }
    }
  },
  { path: '',
    pathMatch: 'full',
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'By - redirect',
        description: 'By - redirect - Description of the home page'
      }
    }
  },
  { path: 'pl',
    component: PlAppComponent,
    canActivate: [MetaGuard],
    data: {
      meta: {
        title: 'Pl',
        description: 'Pl- Description of the home page'
      }
    }
  },
  // otherwise redirect to root
   { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
