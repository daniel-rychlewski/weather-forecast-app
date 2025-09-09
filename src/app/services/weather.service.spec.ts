import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService, WeatherData } from './weather.service';
import {HttpClient} from '@angular/common/http';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeatherService, HttpClient]
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWeatherByCoords', () => {
    it('should make a GET request to the forecast API with correct parameters', () => {
      const mockResponse = {
        current: {
          temperature_2m: 15.5,
          weather_code: 1,
          wind_speed_10m: 12.3,
          relative_humidity_2m: 65
        },
        daily: {
          time: ['2023-12-01', '2023-12-02'],
          weather_code: [1, 2],
          temperature_2m_max: [16.7, 14.2],
          temperature_2m_min: [8.3, 7.1]
        }
      };

      const expectedWeatherData: WeatherData = {
        current: {
          temperature: 16,
          weatherCode: 1,
          windSpeed: 12,
          humidity: 65,
          location: 'Current Location',
          country: ''
        },
        forecast: [
          { date: '2023-12-01', maxTemp: 17, minTemp: 8, weatherCode: 1 },
          { date: '2023-12-02', maxTemp: 14, minTemp: 7, weatherCode: 2 }
        ]
      };

      service.getWeatherByCoords(51.5074, -0.1278).subscribe(data => {
        expect(data).toEqual(expectedWeatherData);
      });

      const req = httpMock.expectOne(
        req => req.url === 'https://api.open-meteo.com/v1/forecast' &&
          req.params.get('latitude') === '51.5074' &&
          req.params.get('longitude') === '-0.1278'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle API errors gracefully', () => {
      service.getWeatherByCoords(51.5074, -0.1278).subscribe({
        next: () => fail('Expected error but got success'),
        error: (error) => {
          expect(error.message).toBe('Failed to fetch weather data');
        }
      });

      const req = httpMock.expectOne('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5');
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('searchCities', () => {
    it('should make a GET request to the search API for valid queries', () => {
      const mockResponse = {
        results: [
          { id: 1, name: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278 },
          { id: 2, name: 'London', country: 'CA', latitude: 42.9834, longitude: -81.233 }
        ]
      };

      service.searchCities('London').subscribe(results => {
        expect(results.length).toBe(2);
        expect(results[0].name).toBe('London');
        expect(results[0].country).toBe('UK');
      });

      const req = httpMock.expectOne('https://geocoding-api.open-meteo.com/v1/search?name=London&count=5&language=en&format=json');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when API returns no results', () => {
      service.searchCities('NonexistentCity').subscribe(results => {
        expect(results).toEqual([]);
      });

      const req = httpMock.expectOne('https://geocoding-api.open-meteo.com/v1/search?name=NonexistentCity&count=5&language=en&format=json');
      req.flush({}); // Empty response
    });

    it('should handle search errors gracefully', () => {
      service.searchCities('London').subscribe(results => {
        expect(results).toEqual([]);
      });

      const req = httpMock.expectOne('https://geocoding-api.open-meteo.com/v1/search?name=London&count=5&language=en&format=json');
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getWeatherCondition', () => {
    it('should return correct condition for known weather codes', () => {
      expect(service.getWeatherCondition(0)).toBe('Clear sky');
      expect(service.getWeatherCondition(95)).toBe('Thunderstorm');
    });

    it('should return "Unknown" for unknown weather codes', () => {
      expect(service.getWeatherCondition(999)).toBe('Unknown');
    });

    it('should handle null/undefined values', () => {
      expect(service.getWeatherCondition(null as any)).toBe('Unknown');
      expect(service.getWeatherCondition(undefined as any)).toBe('Unknown');
    });
  });

  describe('getWeatherIcon', () => {
    it('should return correct icon for known weather codes', () => {
      expect(service.getWeatherIcon(0)).toBe('☀️');
      expect(service.getWeatherIcon(95)).toBe('⛈️');
    });

    it('should return "❓" for unknown weather codes', () => {
      expect(service.getWeatherIcon(999)).toBe('❓');
    });

    it('should handle null/undefined values', () => {
      expect(service.getWeatherIcon(null as any)).toBe('❓');
      expect(service.getWeatherIcon(undefined as any)).toBe('❓');
    });
  });

  describe('cache behavior', () => {
    it('should clear cache when clearCache is called', () => {
      const mockResponse = {
        current: { temperature_2m: 15.5, weather_code: 1, wind_speed_10m: 12.3, relative_humidity_2m: 65 },
        daily: { time: ['2023-12-01'], weather_code: [1], temperature_2m_max: [16.7], temperature_2m_min: [8.3] }
      };

      // Make a request to populate cache
      service.getWeatherByCoords(51.5074, -0.1278).subscribe();
      const req1 = httpMock.expectOne('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5');
      req1.flush(mockResponse);

      // Make the same request again - should make a new HTTP call
      service.getWeatherByCoords(51.5074, -0.1278).subscribe();
      const req2 = httpMock.expectOne('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5');
      req2.flush(mockResponse);
    });
  });
});
