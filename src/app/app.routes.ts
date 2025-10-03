import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'leveler',
    loadComponent: () => import('./components/leveler/leveler.component').then(m => m.LevelerComponent)
  },
  {
    path: 'compass',
    loadComponent: () => import('./components/compass/compass.component').then(m => m.CompassComponent)
  },
  {
    path: 'light-sensor',
    loadComponent: () => import('./components/light-sensor/light-sensor.component').then(m => m.LightSensorComponent)
  },
  {
    path: 'accelerometer',
    loadComponent: () => import('./components/accelerometer/accelerometer.component').then(m => m.AccelerometerComponent)
  },
  {
    path: 'gyroscope',
    loadComponent: () => import('./components/gyroscope/gyroscope.component').then(m => m.GyroscopeComponent)
  },
  {
    path: 'magnetometer',
    loadComponent: () => import('./components/magnetometer/magnetometer.component').then(m => m.MagnetometerComponent)
  },
  {
    path: 'proximity',
    loadComponent: () => import('./components/proximity/proximity.component').then(m => m.ProximityComponent)
  },
  {path: '**', redirectTo: '/home'}
];
