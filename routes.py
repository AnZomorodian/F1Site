import logging
from flask import render_template, request, jsonify, flash
from app import app
from f1_data import F1DataManager
import traceback

# Initialize F1 data manager
f1_data = F1DataManager()

@app.route('/')
def index():
    """Main page with selection interface"""
    try:
        # Get available years, GPs, and sessions
        years = f1_data.get_available_years()
        return render_template('index.html', years=years)
    except Exception as e:
        logging.error(f"Error loading index page: {str(e)}")
        flash(f"Error loading data: {str(e)}", 'error')
        return render_template('index.html', years=[])

@app.route('/api/events/<int:year>')
def get_events(year):
    """Get available events for a given year"""
    try:
        events = f1_data.get_events(year)
        return jsonify(events)
    except Exception as e:
        logging.error(f"Error getting events for year {year}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sessions/<int:year>/<int:round_number>')
def get_sessions(year, round_number):
    """Get available sessions for a given year and round"""
    try:
        sessions = f1_data.get_sessions(year, round_number)
        return jsonify(sessions)
    except Exception as e:
        logging.error(f"Error getting sessions for {year} round {round_number}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers/<int:year>/<int:round_number>/<session>')
def get_drivers(year, round_number, session):
    """Get available drivers for a given session"""
    try:
        drivers = f1_data.get_drivers(year, round_number, session)
        return jsonify(drivers)
    except Exception as e:
        logging.error(f"Error getting drivers for {year} round {round_number} session {session}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/telemetry')
def telemetry():
    """Telemetry visualization page"""
    year = request.args.get('year', type=int)
    round_number = request.args.get('round', type=int)
    session = request.args.get('session')
    drivers = request.args.getlist('drivers')
    
    if not all([year, round_number, session, drivers]):
        flash('Please select year, grand prix, session, and at least one driver', 'error')
        return render_template('index.html', years=f1_data.get_available_years())
    
    try:
        # Get session info
        session_info = f1_data.get_session_info(year, round_number, session)
        
        # Get driver data
        driver_data = []
        for driver in drivers:
            data = f1_data.get_driver_data(year, round_number, session, driver)
            if data:
                driver_data.append(data)
        
        if not driver_data:
            flash('No data available for selected drivers', 'error')
            return render_template('index.html', years=f1_data.get_available_years())
        
        return render_template('telemetry.html', 
                             session_info=session_info,
                             driver_data=driver_data,
                             year=year,
                             round_number=round_number,
                             session=session)
    
    except Exception as e:
        logging.error(f"Error loading telemetry data: {str(e)}")
        logging.error(traceback.format_exc())
        flash(f'Error loading telemetry data: {str(e)}', 'error')
        return render_template('index.html', years=f1_data.get_available_years())

@app.route('/api/telemetry/<int:year>/<int:round_number>/<session>/<driver>')
def get_telemetry_data(year, round_number, session, driver):
    """Get detailed telemetry data for a specific driver"""
    try:
        lap_number = request.args.get('lap', type=int)
        telemetry_data = f1_data.get_telemetry_data(year, round_number, session, driver, lap_number)
        return jsonify(telemetry_data)
    except Exception as e:
        logging.error(f"Error getting telemetry data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/lap_times/<int:year>/<int:round_number>/<session>')
def get_lap_times(year, round_number, session):
    """Get lap times for all drivers in a session"""
    try:
        drivers = request.args.getlist('drivers')
        lap_times = f1_data.get_lap_times(year, round_number, session, drivers)
        return jsonify(lap_times)
    except Exception as e:
        logging.error(f"Error getting lap times: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found_error(error):
    return render_template('index.html', years=f1_data.get_available_years()), 404

@app.errorhandler(500)
def internal_error(error):
    logging.error(f"Internal server error: {str(error)}")
    flash('An internal error occurred. Please try again.', 'error')
    return render_template('index.html', years=f1_data.get_available_years()), 500
