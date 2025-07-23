# F1 Telemetry Analysis Web App

A modern, professional web application for analyzing Formula 1 telemetry data inspired by GP Tempo's sleek interface. Built with Flask and FastF1 to provide real-time F1 session analysis and driver comparisons.

## Features

🏁 **Live F1 Data Analysis**
- Real-time access to Formula 1 telemetry and timing data
- Support for all sessions: Practice, Qualifying, Sprint, Race
- Driver-by-driver performance comparison

📊 **Advanced Visualizations**
- Interactive telemetry charts with Chart.js
- Lap time comparisons and sector analysis
- Professional GP Tempo-inspired dark theme

🎯 **User-Friendly Interface**
- Intuitive session and driver selection
- Responsive design for all devices
- Fast loading with optimized data processing

## Quick Start

### Prerequisites
- Python 3.11+
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd f1-telemetry-app
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Run the application**
```bash
python main.py
```

4. **Open your browser**
Navigate to `http://localhost:5000`

## Usage

1. **Select Year**: Choose the F1 season you want to analyze
2. **Pick Event**: Select from available Grand Prix events
3. **Choose Session**: Pick Practice, Qualifying, Sprint, or Race
4. **Select Drivers**: Compare multiple drivers' performance
5. **Analyze**: View detailed telemetry data and lap comparisons

## Technology Stack

### Backend
- **Flask** - Python web framework
- **FastF1** - Official F1 data access library
- **Pandas & NumPy** - Data processing and analysis
- **Gunicorn** - Production WSGI server

### Frontend
- **Bootstrap 5** - Responsive UI framework
- **Chart.js** - Interactive data visualization
- **Font Awesome** - Professional icons
- **Custom CSS** - GP Tempo-inspired styling

### Data Source
- **Official F1 Data** - Accessed through FastF1 API
- **Real-time Updates** - Live session data when available

## Project Structure

```
f1-telemetry-app/
├── app.py              # Flask app configuration
├── main.py             # Application entry point
├── routes.py           # API endpoints and web routes
├── f1_data.py          # F1 data management class
├── templates/          # Jinja2 HTML templates
│   ├── base.html       # Base template
│   ├── index.html      # Main selection page
│   └── telemetry.html  # Data visualization page
├── static/             # Static assets
│   ├── css/            # Custom stylesheets
│   └── js/             # JavaScript files
└── requirements.txt    # Python dependencies
```

## API Endpoints

- `GET /` - Main application interface
- `GET /api/events/<year>` - Get available events for year
- `GET /api/sessions/<year>/<round>` - Get sessions for event
- `GET /api/drivers/<year>/<round>/<session>` - Get drivers for session
- `GET /telemetry` - Telemetry visualization page

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **FastF1** team for the excellent F1 data library
- **GP Tempo** for design inspiration
- **Formula 1** for providing official data access
- **Bootstrap** and **Chart.js** communities

## Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

Made with ❤️ for F1 fans and data enthusiasts