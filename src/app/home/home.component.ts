import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of} from 'rxjs';
import { WeatherService, WeatherData, CurrentWeather, ForecastDay } from '../services/weather.service';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

interface SearchResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    HttpClientModule
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentWeather: CurrentWeather | null = null;
  forecast: ForecastDay[] = [];
  searchResults: SearchResult[] = [];
  searchQuery = '';
  isLoading = false;
  error: string | null = null;
  showDropdown = false;

  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private weatherService: WeatherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.getUserLocation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length > 2) {
          return this.weatherService.searchCities(query);
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.searchResults = results;
      this.showDropdown = results.length > 0;
    });
  }

  private handleGeolocationError(error: GeolocationPositionError): void {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.error = 'Location access was denied. Please enable location services or search for a city.';
        break;
      case error.POSITION_UNAVAILABLE:
        this.error = 'Location information is unavailable. Please search for a city.';
        break;
      case error.TIMEOUT:
        this.error = 'Location request timed out. Please search for a city.';
        break;
      default:
        this.error = 'Unable to get your location. Please search for a city.';
        break;
    }
    this.isLoading = false;
  }

  private handleWeatherError(error: Error): void {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('offline')) {
      this.error = 'Network error. Please check your internet connection.';
    } else if (message.includes('timeout')) {
      this.error = 'Request timed out. Please try again.';
    } else if (message.includes('failed to fetch')) {
      this.error = 'Unable to connect to weather service. Please try again later.';
    } else {
      this.error = 'Failed to load weather data. Please try again.';
    }
  }

  private getUserLocation(): void {
    if (!navigator.geolocation) {
      this.error = 'Geolocation is not supported by your browser. Please search for a city.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        this.loadWeatherData(position.coords.latitude, position.coords.longitude);
      },
      error => {
        this.handleGeolocationError(error);
      },
      { timeout: 10000 } // 10 second timeout
    );
  }

  private loadWeatherData(lat: number, lon: number): void {
    this.isLoading = true;
    this.error = null;

    this.weatherService.getWeatherByCoords(lat, lon).subscribe({
      next: (data: WeatherData) => {
        this.currentWeather = data.current;
        this.forecast = data.forecast;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.handleWeatherError(err);
        this.isLoading = false;
      }
    });
  }

  onSearchInput(): void {
    this.searchTerms.next(this.searchQuery);
  }

  onSearchSelect(result: SearchResult): void {
    this.isLoading = true;
    this.error = null;
    this.showDropdown = false;
    this.searchQuery = '';

    this.weatherService.getWeatherByCity(
      result.name,
      result.country,
      result.latitude,
      result.longitude
    ).subscribe({
      next: (data: WeatherData) => {
        this.currentWeather = data.current;
        this.forecast = data.forecast;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.handleWeatherError(err);
        this.isLoading = false;
      }
    });
  }

  navigateToDetails(): void {
    if (this.currentWeather) {
      this.router.navigate(['/details'], {
        state: {
          weather: this.currentWeather,
          forecast: this.forecast
        }
      });
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
}
