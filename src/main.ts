import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  wifiOutline,
  bedOutline,
  locationOutline,
  peopleOutline,
  checkmarkCircleOutline,
  funnelOutline,
  optionsOutline,
  calendarOutline,
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

/*
|--------------------------------------------------------------------------
| REGISTER ICONS (OBLIGATORIO)
|--------------------------------------------------------------------------
*/
addIcons({
  'wifi-outline': wifiOutline,
  'bed-outline': bedOutline,
  'location-outline': locationOutline,
  'people-outline': peopleOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'funnel-outline': funnelOutline,
  'options-outline': optionsOutline,
  'calendar-outline': calendarOutline,
});

/*
|--------------------------------------------------------------------------
| BOOTSTRAP
|--------------------------------------------------------------------------
*/
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});