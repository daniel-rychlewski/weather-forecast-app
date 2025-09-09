import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherService, CurrentWeather, ForecastDay } from '../services/weather.service';
import {CommonModule, DatePipe} from '@angular/common';

@Component({
  selector: 'app-weather-details',
  templateUrl: './weather-details.component.html',
  imports: [
    CommonModule,
    DatePipe
  ],
  styleUrls: ['./weather-details.component.css']
})
export class WeatherDetailsComponent {
  weather: CurrentWeather | null = null;
  forecast: ForecastDay[] = [];

  constructor(
    private weatherService: WeatherService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.weather = navigation.extras.state['weather'];
      this.forecast = navigation.extras.state['forecast'];
    }
    if (!this.weather) {
      this.router.navigate(['/']);
    }
  }

  getWeatherCondition(code: number | undefined | null): string {
    if (code === undefined || code === null) return 'Unknown';
    return this.weatherService.getWeatherCondition(code);
  }

  getWeatherIcon(code: number | undefined | null): string {
    if (code === undefined || code === null) return '❓';
    return this.weatherService.getWeatherIcon(code);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
