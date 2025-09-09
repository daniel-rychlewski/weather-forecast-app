import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HomeComponent } from './home.component';
import { WeatherService, WeatherData, CurrentWeather, ForecastDay } from '../services/weather.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let weatherService: jasmine.SpyObj<WeatherService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const weatherServiceSpy = jasmine.createSpyObj('WeatherService', [
      'getWeatherByCoords', 'searchCities', 'getWeatherCondition', 'getWeatherIcon', 'getWeatherByCity'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: WeatherService, useValue: weatherServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load weather data', fakeAsync(() => {
    const mockWeatherData: WeatherData = {
      current: {
        temperature: 16,
        weatherCode: 1,
        windSpeed: 12,
        humidity: 65,
        location: 'Current Location',
        country: ''
      },
      forecast: [
        { date: '2023-12-01', maxTemp: 17, minTemp: 8, weatherCode: 1 }
      ]
    };

    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
      success({ coords: { latitude: 51.5074, longitude: -0.1278 } } as any);
    });

    weatherService.getWeatherByCoords.and.returnValue(of(mockWeatherData));

    component.ngOnInit();
    tick();

    expect(weatherService.getWeatherByCoords).toHaveBeenCalledWith(51.5074, -0.1278);

    // After the observable completes, isLoading should be false
    tick();
    expect(component.isLoading).toBeFalse();
    expect(component.currentWeather).toEqual(mockWeatherData.current);
    expect(component.forecast).toEqual(mockWeatherData.forecast);
  }));

  it('should handle geolocation error', fakeAsync(() => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((_, error) => {
      if (error) {
        error({message: 'Geolocation error'} as any);
      }
    });

    const mockWeatherData: WeatherData = {
      current: {
        temperature: 16,
        weatherCode: 1,
        windSpeed: 12,
        humidity: 65,
        location: 'London, UK',
        country: 'UK'
      },
      forecast: [
        { date: '2023-12-01', maxTemp: 17, minTemp: 8, weatherCode: 1 }
      ]
    };

    weatherService.getWeatherByCoords.and.returnValue(of(mockWeatherData));

    component.ngOnInit();
    tick();

    expect(weatherService.getWeatherByCoords).toHaveBeenCalledTimes(0);
    expect(component.currentWeather).toEqual(null);
  }));

  it('should handle weather service error', fakeAsync(() => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success) => {
      success({ coords: { latitude: 51.5074, longitude: -0.1278 } } as any);
    });

    weatherService.getWeatherByCoords.and.returnValue(throwError(() => new Error('API error')));

    component.ngOnInit();
    tick();

    expect(component.error).toBe('Failed to load weather data. Please try again.');
    expect(component.isLoading).toBeFalse();
  }));

  it('should not search for short queries', fakeAsync(() => {
    component.searchQuery = 'Lo';
    component.onSearchInput();
    tick(300);

    expect(weatherService.searchCities).not.toHaveBeenCalled();
    expect(component.searchResults).toEqual([]);
  }));

  it('should select a city from search results', fakeAsync(() => {
    const mockSearchResult = {
      id: 1,
      name: 'London',
      country: 'UK',
      latitude: 51.5074,
      longitude: -0.1278
    };

    const mockWeatherData: WeatherData = {
      current: {
        temperature: 16,
        weatherCode: 1,
        windSpeed: 12,
        humidity: 65,
        location: 'London, UK',
        country: 'UK'
      },
      forecast: [
        { date: '2023-12-01', maxTemp: 17, minTemp: 8, weatherCode: 1 }
      ]
    };

    weatherService.getWeatherByCity.and.returnValue(of(mockWeatherData));

    component.onSearchSelect(mockSearchResult);
    tick();

    expect(weatherService.getWeatherByCity).toHaveBeenCalledWith(
      'London', 'UK', 51.5074, -0.1278
    );
    expect(component.showDropdown).toBeFalse();
    expect(component.searchQuery).toBe('');

    tick();
    expect(component.isLoading).toBeFalse();
    expect(component.currentWeather).toEqual(mockWeatherData.current);
  }));

  it('should navigate to details page', () => {
    const mockCurrentWeather: CurrentWeather = {
      temperature: 16,
      weatherCode: 1,
      windSpeed: 12,
      humidity: 65,
      location: 'London, UK',
      country: 'UK'
    };

    const mockForecast: ForecastDay[] = [
      { date: '2023-12-01', maxTemp: 17, minTemp: 8, weatherCode: 1 }
    ];

    component.currentWeather = mockCurrentWeather;
    component.forecast = mockForecast;

    component.navigateToDetails();

    expect(router.navigate).toHaveBeenCalledWith(['/details'], {
      state: {
        weather: mockCurrentWeather,
        forecast: mockForecast
      }
    });
  });

  it('should not navigate to details if no weather data', () => {
    component.currentWeather = null;
    component.forecast = [];

    component.navigateToDetails();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should get weather condition and icon', () => {
    weatherService.getWeatherCondition.and.returnValue('Clear sky');
    weatherService.getWeatherIcon.and.returnValue('☀️');

    const condition = component.getWeatherCondition(0);
    const icon = component.getWeatherIcon(0);

    expect(condition).toBe('Clear sky');
    expect(icon).toBe('☀️');
    expect(weatherService.getWeatherCondition).toHaveBeenCalledWith(0);
    expect(weatherService.getWeatherIcon).toHaveBeenCalledWith(0);
  });
});
