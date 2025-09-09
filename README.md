# Weather Forecast App

A modern, responsive Angular weather application that provides current weather conditions and 5-day forecasts using the Open-Meteo API.

## Features

### Home Page
- **Current Weather**: Displays weather information based on your current location
  - Location name (City, Country)
  - Temperature in Celsius
  - Weather condition (e.g., Sunny, Rainy, Cloudy)
  - Weather icon representing current conditions

- **5-Day Forecast**: Responsive grid layout showing weather forecast for the next 5 days
  - Date for each day
  - Expected high and low temperatures
  - Weather condition description
  - Visual weather icons

- **City Search**: Intelligent search functionality
  - Real-time city search with dropdown results
  - Tap any result to view detailed weather information
  - Search for weather data in cities worldwide

### Weather Details Page
- Comprehensive weather details for selected locations
- Large, prominent temperature display
- Full-size weather icon
- Detailed weather information including:
  - Wind speed (km/h)
  - Humidity percentage
  - Weather condition description

## Technical Implementation

### Architecture
- **Angular Framework**: Built with Angular and TypeScript
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Component-Based Architecture**: Modular and maintainable code structure
- **Service Layer**: Separated business logic with WeatherService handling all API communications

### API Integration
- **Open-Meteo API**: Free weather API with no key required
- **Endpoints Used**:
  - Forecast API: `/v1/forecast` for current weather and forecasts
  - Geocoding API: `/v1/search` for city search functionality
- **Smart Caching**: Efficient API call management

### Error Handling
- Comprehensive error management for various scenarios:
  - Network connectivity issues
  - Geolocation permission denied
  - API timeouts and failures
  - User-friendly error messages with recovery suggestions

### User Experience
- **Intuitive Interface**: Clean, modern design with clear visual hierarchy
- **Loading States**: Visual feedback during data fetching
- **Smart Defaults**: Graceful degradation when location services are unavailable

## Development Features

### Code Quality
- **Type Safety**: Full TypeScript implementation with interfaces
- **Modular Structure**: Well-organized components and services
- **Scalable Architecture**: Easy to extend with new features
- **Maintainable Code**: Clear separation of concerns

### Testing
- Comprehensive unit test coverage including:
  - WeatherService tests with HTTP mocking
  - Component tests with service mocking
  - Error handling scenarios
  - User interaction testing

## Running Tests

The project uses **Karma** with **Jasmine** for unit testing.

- To run all tests in watch mode:

```bash
ng test
```

- To run tests once (useful in CI/CD):
```bash
ng test --watch=false --browsers=ChromeHeadless
```

### Performance
- **Optimized API Calls**: Minimal unnecessary requests
- **Efficient Rendering**: Change detection optimization
- **Responsive Design**: Fluid layouts across device sizes

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Angular CLI (v15 or higher)
- Modern web browser with geolocation support

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `ng serve`
4. Open browser to `http://localhost:4200`

### Building for Production
- Run `ng build` to build the project
- The build artifacts will be stored in the `dist/` directory

## Usage

1. **Automatic Location Detection**: The app will automatically detect your location and show local weather
2. **Search for Cities**: Use the search bar to find weather information for any city worldwide
3. **View Details**: Click "View Details" or search results to see comprehensive weather information
4. **Navigate Back**: Use the back button to return to the home page

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## API Notes

- This application uses the free Open-Meteo API
- No API key required
- Rate limiting may apply with excessive requests
- Data is provided for educational and demonstration purposes

## Future Enhancements

Potential improvements for future versions:
- Weather maps integration
- Historical weather data
- Severe weather alerts
- Temperature unit switching (Celsius/Fahrenheit)
- Multilingual support
- Offline functionality with service workers
- Push notifications for weather alerts

## Contributing

This is a demonstration project built for educational purposes. Feel free to fork and extend according to your needs.

## License

This project is created for educational purposes using the free Open-Meteo API.

---

**Note**: Weather data provided by Open-Meteo API. Please refer to their terms of service for appropriate usage guidelines.
