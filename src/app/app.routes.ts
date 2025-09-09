import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { WeatherDetailsComponent } from './weather-details/weather-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'details', component: WeatherDetailsComponent },
  { path: '**', redirectTo: '' }
];
