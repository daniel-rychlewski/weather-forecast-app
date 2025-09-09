import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  location: string;
  country: string;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  constructor(private http: HttpClient) {}

  getWeatherByCoords(latitude: number, longitude: number): Observable<WeatherData> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('current', 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m')
      .set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
      .set('timezone', 'auto')
      .set('forecast_days', '5');

    return this.http.get<any>(`${this.baseUrl}/forecast`, { params }).pipe(
      map(response => this.transformWeatherData(response, 'Current Location')),
      catchError(error => throwError(() => new Error('Failed to fetch weather data')))
    );
  }

  searchCities(query: string): Observable<any[]> {
    const params = new HttpParams()
      .set('name', query)
      .set('count', '5')
      .set('language', 'en')
      .set('format', 'json');

    return this.http.get<any>(`${this.geocodingUrl}/search`, { params }).pipe(
      map(response => response.results || []),
      catchError(error => of([]))
    );
  }

  getWeatherByCity(city: string, country: string, latitude: number, longitude: number): Observable<WeatherData> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('current', 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m')
      .set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
      .set('timezone', 'auto')
      .set('forecast_days', '5');

    return this.http.get<any>(`${this.baseUrl}/forecast`, { params }).pipe(
      map(response => this.transformWeatherData(response, `${city}, ${country}`)),
      catchError(error => throwError(() => new Error('Failed to fetch weather data')))
    );
  }

  private transformWeatherData(data: any, locationName: string): WeatherData {
    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        windSpeed: Math.round(data.current.wind_speed_10m),
        humidity: data.current.relative_humidity_2m,
        location: locationName,
        country: ''
      },
      forecast: data.daily.time.map((date: string, index: number) => ({
        date,
        maxTemp: Math.round(data.daily.temperature_2m_max[index]),
        minTemp: Math.round(data.daily.temperature_2m_min[index]),
        weatherCode: data.daily.weather_code[index]
      }))
    };
  }

  getWeatherCondition(code: number): string {
    const conditions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      80: 'Light rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm'
    };
    return conditions[code] || 'Unknown';
  }

  getWeatherIcon(code: number | undefined | null): string {
    if (code === undefined || code === null) return '❓';
    const icons: { [key: number]: string } = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌧️', 53: '🌧️', 55: '🌧️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      80: '🌦️', 81: '🌦️', 82: '🌦️',
      95: '⛈️'
    };
    return icons[code] || '❓';
  }
}
