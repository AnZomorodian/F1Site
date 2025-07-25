# F1 Telemetry Analysis Web App

## Overview

**Laptica** is a modern Formula 1 telemetry analysis web application built with Flask and FastF1. The application features a clean, professional design with advanced F1 session analysis capabilities. Users can analyze comprehensive telemetry data, compare driver performances across multiple metrics, and visualize detailed racing statistics through a modern, intuitive interface with enhanced data visualization and improved user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **Styling**: Custom CSS with GP Tempo-inspired dark theme using CSS custom properties
- **JavaScript**: Vanilla JavaScript with Chart.js for data visualization
- **Responsive Design**: Mobile-first approach with Bootstrap grid system

### Backend Architecture
- **Framework**: Flask web framework
- **Structure**: Modular approach with separate files for routes, data management, and app configuration
- **Data Processing**: FastF1 library for F1 telemetry data retrieval and processing
- **Session Management**: Flask sessions with configurable secret key

### Key Design Decisions
- **No Database**: Application fetches data directly from FastF1 API without persistent storage
- **Stateless Design**: Each request fetches fresh data from the F1 API
- **Modular Architecture**: Clear separation between data layer, routing, and presentation

## Key Components

### Core Application Files
- **`app.py`**: Flask application factory with middleware configuration
- **`routes.py`**: API endpoints and view controllers
- **`f1_data.py`**: F1DataManager class for data retrieval and processing
- **`main.py`**: Application entry point

### Frontend Components
- **`templates/base.html`**: Base template with navigation and common structure
- **`templates/index.html`**: Landing page with enhanced driver selection interface
- **`templates/telemetry_premium.html`**: Premium dashboard with advanced visualizations
- **`static/css/style.css`**: Professional GP Tempo-inspired styling with premium dashboard components
- **`static/js/main.js`**: General UI interactions and utilities
- **`static/js/driver-selection.js`**: Enhanced driver selection with team grouping
- **`static/js/advanced-charts.js`**: Premium Chart.js dashboard with 5 chart types

### Data Management
- **F1DataManager**: Enhanced class for comprehensive FastF1 API interactions
- **Advanced Metrics**: Lap times, sector times, speed traps, tire compounds, performance statistics
- **Team/Driver Color Mapping**: Professional color schemes for visualization
- **Year Range**: Supports F1 data from 2018 to current year
- **Premium Dashboard**: 5 chart types with real-time telemetry analysis

## Data Flow

1. **User Selection**: User selects year, event, session, and drivers through the web interface
2. **API Requests**: Frontend makes AJAX calls to Flask API endpoints
3. **Data Retrieval**: F1DataManager fetches data from FastF1 library
4. **Data Processing**: Raw telemetry data is processed and formatted for visualization
5. **Visualization**: Chart.js renders interactive telemetry charts with driver comparisons

### API Endpoints
- `GET /api/events/<year>`: Retrieve available events for a year
- `GET /api/sessions/<year>/<round>`: Get sessions for a specific event
- `GET /api/drivers/<year>/<round>/<session>`: Get drivers for a session

## External Dependencies

### Python Libraries
- **Flask**: Web framework for backend API and routing
- **FastF1**: Official F1 telemetry data library
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing support

### Frontend Libraries
- **Bootstrap 5**: CSS framework for responsive design
- **Chart.js**: JavaScript charting library for telemetry visualization
- **Font Awesome**: Icon library for UI elements

### CDN Resources
- Bootstrap CSS and JavaScript from CDN
- Chart.js from CDN
- Font Awesome icons from CDN

## Deployment Strategy

### Development Environment
- **Host**: 0.0.0.0 (allows external connections)
- **Port**: 5000
- **Debug Mode**: Enabled for development
- **Proxy Middleware**: ProxyFix for deployment behind reverse proxies

### Configuration
- **Session Secret**: Configurable via environment variable `SESSION_SECRET`
- **Logging**: Debug level logging enabled for development
- **Static Files**: Served directly by Flask in development

### Production Considerations
- Application is designed to run behind a reverse proxy
- No database dependencies simplify deployment
- FastF1 data caching disabled for cleaner deployment
- All external resources loaded via CDN for better performance

### Scalability Notes
- Stateless design allows for horizontal scaling
- No persistent data storage requirements
- FastF1 API rate limiting may need consideration for high traffic
- Consider implementing caching layer for frequently accessed data