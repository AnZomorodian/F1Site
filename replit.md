# F1 Telemetry Analysis Application

## Overview

This is a Flask-based web application for analyzing Formula 1 telemetry data using the FastF1 library. The application provides an interface for users to select specific F1 sessions and visualize driver performance data, lap times, and telemetry information in a professional, GP Tempo-inspired dark theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Flask
- **UI Framework**: Bootstrap 5.3.0 for responsive design
- **Styling**: Custom CSS with a dark theme inspired by GP Tempo
- **JavaScript**: Vanilla JavaScript with Chart.js for data visualization
- **Icons**: Font Awesome 6.4.0 for consistent iconography

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Structure**: Single-file route definitions with modular data management
- **Session Management**: Flask sessions with configurable secret key
- **Proxy Support**: Werkzeug ProxyFix middleware for deployment behind reverse proxies
- **Logging**: Python's built-in logging module with DEBUG level

### Data Management
- **F1 Data Source**: FastF1 library for accessing Formula 1 telemetry and timing data
- **Caching**: FastF1 built-in caching system for improved performance
- **Data Processing**: Pandas and NumPy for data manipulation and analysis

## Key Components

### Core Application Files
- **app.py**: Flask application factory and configuration
- **main.py**: Application entry point
- **routes.py**: API endpoints and route handlers
- **f1_data.py**: F1DataManager class for data retrieval and processing

### Frontend Components
- **templates/base.html**: Base template with navigation and common layout
- **templates/index.html**: Main selection interface for choosing sessions
- **templates/telemetry.html**: Telemetry visualization and analysis page
- **static/css/style.css**: Custom styling with F1-themed color scheme
- **static/js/main.js**: General JavaScript functionality
- **static/js/telemetry.js**: Telemetry-specific chart management and visualization

### F1DataManager Features
- Team and driver color mapping for consistent visualization
- Support for data from 2018 onwards
- Caching mechanism for improved performance
- Methods for retrieving events, sessions, and driver data

## Data Flow

1. **User Selection**: Users select year, event, session, and drivers through the web interface
2. **API Requests**: Frontend makes AJAX requests to Flask API endpoints
3. **Data Retrieval**: F1DataManager uses FastF1 to fetch data from Formula 1's official sources
4. **Data Processing**: Raw telemetry data is processed and formatted for visualization
5. **Visualization**: Chart.js renders interactive charts with the processed data
6. **Caching**: FastF1 caches data locally to improve subsequent requests

## External Dependencies

### Python Libraries
- **Flask**: Web framework for the backend application
- **FastF1**: Official F1 data access library
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing for data processing
- **Werkzeug**: WSGI utilities and middleware

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework for responsive design
- **Chart.js**: JavaScript charting library for telemetry visualization
- **Font Awesome 6.4.0**: Icon library

### Data Sources
- **Formula 1 Official Data**: Accessed through FastF1 library
- **Live Timing Data**: Real-time and historical F1 session data

## Deployment Strategy

### Configuration
- **Environment Variables**: Session secret configurable via SESSION_SECRET
- **Debug Mode**: Enabled for development, should be disabled in production
- **Host/Port**: Configured to run on all interfaces (0.0.0.0) port 5000
- **Proxy Support**: Includes ProxyFix middleware for deployment behind reverse proxies

### Caching Strategy
- **FastF1 Cache**: Local file-based caching in 'fastf1_cache' directory
- **Performance**: Significantly improves data retrieval times for repeated requests

### File Structure
- **Static Assets**: CSS and JavaScript files served directly by Flask
- **Templates**: Jinja2 templates for server-side rendering
- **Cache Directory**: Created automatically for FastF1 data caching

### Scalability Considerations
- Single-threaded Flask development server (suitable for development)
- Ready for WSGI deployment with gunicorn or similar for production
- Caching mechanism reduces load on F1 data sources