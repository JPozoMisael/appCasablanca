import { bootstrapApplication } from '@angular/platform-browser';

import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular
} from '@ionic/angular/standalone';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';

import { addIcons } from 'ionicons';

import {

  // EXISTENTES
  wifiOutline,
  bedOutline,
  locationOutline,
  peopleOutline,
  checkmarkCircleOutline,
  funnelOutline,
  optionsOutline,
  calendarOutline,

  // NUEVOS
  waterOutline,
  snowOutline,
  restaurantOutline,
  sunnyOutline,
  carOutline,
  timeOutline,
  shieldCheckmarkOutline,
  flashOutline,
  pricetagOutline,
  sparklesOutline,
  star,
  starOutline,
  homeOutline,
  businessOutline,
  

} from 'ionicons/icons';

import { routes } from './app/app.routes';

import { AppComponent } from './app/app.component';

import { authInterceptor } from './app/core/interceptors/auth.interceptor';

/* =========================================================
   REGISTER ICONS
========================================================= */

addIcons({

  // BASE
  'wifi-outline': wifiOutline,
  'bed-outline': bedOutline,
  'location-outline': locationOutline,
  'people-outline': peopleOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'funnel-outline': funnelOutline,
  'options-outline': optionsOutline,
  'calendar-outline': calendarOutline,

  // NUEVOS
  'water-outline': waterOutline,
  'snow-outline': snowOutline,
  'restaurant-outline': restaurantOutline,
  'sunny-outline': sunnyOutline,
  'car-outline': carOutline,
  'time-outline': timeOutline,
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'flash-outline': flashOutline,
  'pricetag-outline': pricetagOutline,
  'sparkles-outline': sparklesOutline,

  // STARS
  'star': star,
  'star-outline': starOutline,
  'homeOutline': homeOutline,
  'businessOutline': businessOutline

});

/* =========================================================
   BOOTSTRAP
========================================================= */

bootstrapApplication(AppComponent, {

  providers: [

    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },

    provideIonicAngular(),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    provideAnimations()

  ],

});