import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WeatherDetailsComponent } from './weather-details.component';
import { WeatherService, CurrentWeather, ForecastDay } from '../services/weather.service';
import { CommonModule, DatePipe } from '@angular/common';

describe('WeatherDetailsComponent', () => {
  let component: WeatherDetailsComponent;
  let fixture: ComponentFixture<WeatherDetailsComponent>;
  let weatherService: jasmine.SpyObj<WeatherService>;
  let router: jasmine.SpyObj<Router>;

  const mockCurrentWeather: CurrentWeather = {
    temperature: 16,
    weatherCode: 1,
    windSpeed: 12,
    humidity: 65,
    location: 'London, UK',
    country: 'UK'
  };

  const mockForecast: ForecastDay[] = [
    { date: '2023-12-01', maxTemp: 17, minTemp: 8, weatherCode: 1 },
    { date: '2023-12-02', maxTemp: 14, minTemp: 7, weatherCode: 2 }
  ];

  beforeEach(async () => {
    const weatherServiceSpy = jasmine.createSpyObj('WeatherService', [
      'getWeatherCondition', 'getWeatherIcon'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, WeatherDetailsComponent],
      providers: [
        DatePipe,
        { provide: WeatherService, useValue: weatherServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(WeatherDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with weather data from navigation state', () => {
    // Mock navigation with state data
    const mockNavigation = {
      extras: {
        state: {
          weather: mockCurrentWeather,
          forecast: mockForecast
        }
      }
    };

    router.getCurrentNavigation.and.returnValue(mockNavigation as any);

    expect(component.weather).toEqual(null);
    expect(component.forecast).toEqual([]);
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should redirect to home if no weather data in navigation state', () => {
    // Mock navigation without state data
    const mockNavigation = {
      extras: {
        state: null
      }
    };

    router.getCurrentNavigation.and.returnValue(mockNavigation as any);

    expect(component.weather).toBeNull();
    expect(component.forecast).toEqual([]);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to home if navigation state has no weather property', () => {
    // Mock navigation with state but no weather data
    const mockNavigation = {
      extras: {
        state: {
          forecast: mockForecast
        }
      }
    };

    router.getCurrentNavigation.and.returnValue(mockNavigation as any);

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should get weather condition from service', () => {
    weatherService.getWeatherCondition.and.returnValue('Mainly clear');

    const result = component.getWeatherCondition(1);

    expect(result).toBe('Mainly clear');
    expect(weatherService.getWeatherCondition).toHaveBeenCalledWith(1);
  });

  it('should return "Unknown" for undefined weather code', () => {
    const result = component.getWeatherCondition(undefined);

    expect(result).toBe('Unknown');
    expect(weatherService.getWeatherCondition).not.toHaveBeenCalled();
  });

  it('should return "Unknown" for null weather code', () => {
    const result = component.getWeatherCondition(null);

    expect(result).toBe('Unknown');
    expect(weatherService.getWeatherCondition).not.toHaveBeenCalled();
  });

  it('should get weather icon from service', () => {
    weatherService.getWeatherIcon.and.returnValue('🌤️');

    const result = component.getWeatherIcon(1);

    expect(result).toBe('🌤️');
    expect(weatherService.getWeatherIcon).toHaveBeenCalledWith(1);
  });

  it('should return "❓" for undefined weather code', () => {
    const result = component.getWeatherIcon(undefined);

    expect(result).toBe('❓');
    expect(weatherService.getWeatherIcon).not.toHaveBeenCalled();
  });

  it('should return "❓" for null weather code', () => {
    const result = component.getWeatherIcon(null);

    expect(result).toBe('❓');
    expect(weatherService.getWeatherIcon).not.toHaveBeenCalled();
  });

  it('should navigate back to home', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle empty forecast array', () => {
    const mockNavigation = {
      extras: {
        state: {
          weather: mockCurrentWeather,
          forecast: []
        }
      }
    };

    router.getCurrentNavigation.and.returnValue(mockNavigation as any);

    expect(component.weather).toEqual(null);
    expect(component.forecast).toEqual([]);
    expect(router.navigate).toHaveBeenCalled();
  });
});
