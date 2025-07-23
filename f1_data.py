import fastf1
import pandas as pd
import numpy as np
import logging
from datetime import datetime

class F1DataManager:
    """Manages F1 data retrieval and processing using FastF1"""
    
    def __init__(self):
        # Initialize without caching for cleaner deployment
        logging.info("F1DataManager initialized - ready for F1 data analysis")
        
        # Team colors mapping
        self.team_colors = {
            'RED BULL RACING': '#3671C6',
            'MERCEDES': '#27F4D2',
            'FERRARI': '#ED1131',
            'MCLAREN': '#FF8000',
            'ALPINE': '#0090FF',
            'ASTON MARTIN': '#229971',
            'HAAS': '#B6BABD',
            'ALPHATAURI': '#5E8FAA',
            'ALFA ROMEO': '#C92D4B',
            'WILLIAMS': '#64C4FF',
            'RB': '#6692FF',
            'KICK SAUBER': '#52C832'
        }
        
        # Driver colors for consistent visualization
        self.driver_colors = {
            'VER': '#3671C6', 'PER': '#3671C6',
            'HAM': '#27F4D2', 'RUS': '#27F4D2',
            'LEC': '#ED1131', 'SAI': '#ED1131',
            'NOR': '#FF8000', 'PIA': '#FF8000',
            'ALO': '#0090FF', 'OCO': '#0090FF',
            'STR': '#229971', 'ALB': '#229971',
            'MAG': '#B6BABD', 'HUL': '#B6BABD',
            'TSU': '#5E8FAA', 'RIC': '#5E8FAA',
            'BOT': '#C92D4B', 'ZHO': '#C92D4B',
            'SAR': '#64C4FF', 'COL': '#64C4FF'
        }
    
    def format_lap_time(self, lap_time):
        """Format lap time from timedelta to MM:SS.SSS format"""
        if pd.isna(lap_time):
            return None
        
        total_seconds = lap_time.total_seconds()
        minutes = int(total_seconds // 60)
        seconds = total_seconds % 60
        
        return f"{minutes}:{seconds:06.3f}"
    
    def get_available_years(self):
        """Get available years for F1 data"""
        current_year = datetime.now().year
        # FastF1 typically has data from 2018 onwards
        return list(range(2018, current_year + 1))
    
    def get_events(self, year):
        """Get events (Grand Prix) for a given year"""
        try:
            schedule = fastf1.get_event_schedule(year)
            events = []
            
            for idx, event in schedule.iterrows():
                if pd.notna(event['EventDate']) and event['EventDate'] <= pd.Timestamp.now():
                    events.append({
                        'round_number': event['RoundNumber'],
                        'event_name': event['EventName'],
                        'location': event['Location'],
                        'country': event['Country'],
                        'date': event['EventDate'].strftime('%Y-%m-%d') if pd.notna(event['EventDate']) else None
                    })
            
            return events
        except Exception as e:
            logging.error(f"Error getting events for year {year}: {str(e)}")
            return []
    
    def get_sessions(self, year, round_number):
        """Get available sessions for a given event"""
        try:
            event = fastf1.get_event(year, round_number)
            sessions = []
            
            session_map = {
                'Practice 1': 'FP1',
                'Practice 2': 'FP2',
                'Practice 3': 'FP3',
                'Sprint Qualifying': 'SQ',
                'Sprint': 'S',
                'Qualifying': 'Q',
                'Race': 'R'
            }
            
            for session_name, session_code in session_map.items():
                try:
                    session = fastf1.get_session(year, round_number, session_code)
                    if session is not None:
                        sessions.append({
                            'name': session_name,
                            'code': session_code,
                            'date': session.date.strftime('%Y-%m-%d %H:%M') if hasattr(session, 'date') and session.date else None
                        })
                except:
                    continue
            
            return sessions
        except Exception as e:
            logging.error(f"Error getting sessions for {year}, round {round_number}: {str(e)}")
            return []
    
    def get_drivers(self, year, round_number, session):
        """Get drivers for a given session with enhanced team information"""
        try:
            session_obj = fastf1.get_session(year, round_number, session)
            session_obj.load()
            
            drivers = []
            results = session_obj.results
            
            for idx, driver in results.iterrows():
                driver_code = driver['Abbreviation']
                team_name = driver['TeamName']
                driver_number = driver.get('DriverNumber', '')
                
                # Get colors
                driver_color = self.driver_colors.get(driver_code, '#FFFFFF')
                team_color = self.team_colors.get(team_name, driver_color)
                
                drivers.append({
                    'code': driver_code,
                    'full_name': driver['FullName'],
                    'first_name': driver['FirstName'],
                    'last_name': driver['LastName'],
                    'team': team_name,
                    'driver_number': str(driver_number) if driver_number else '',
                    'color': driver_color,
                    'team_color': team_color,
                    'position': driver.get('Position', None)
                })
            
            # Group by team for better organization
            drivers.sort(key=lambda x: (x['team'], x['code']))
            return drivers
        except Exception as e:
            logging.error(f"Error getting drivers: {str(e)}")
            return []
    
    def get_session_info(self, year, round_number, session):
        """Get session information"""
        try:
            session_obj = fastf1.get_session(year, round_number, session)
            event = fastf1.get_event(year, round_number)
            
            return {
                'year': year,
                'round_number': round_number,
                'session': session,
                'event_name': event['EventName'],
                'location': event['Location'],
                'country': event['Country'],
                'date': session_obj.date.strftime('%Y-%m-%d %H:%M') if hasattr(session_obj, 'date') and session_obj.date else None
            }
        except Exception as e:
            logging.error(f"Error getting session info: {str(e)}")
            return {}
    
    def get_driver_data(self, year, round_number, session, driver):
        """Get basic driver data for a session"""
        try:
            session_obj = fastf1.get_session(year, round_number, session)
            session_obj.load()
            
            driver_laps = session_obj.laps.pick_driver(driver)
            if driver_laps.empty:
                return None
            
            # Get fastest lap
            fastest_lap = driver_laps.pick_fastest()
            
            # Get team info
            results = session_obj.results
            driver_info = results[results['Abbreviation'] == driver]
            
            if driver_info.empty:
                return None
            
            driver_info = driver_info.iloc[0]
            team_name = driver_info['TeamName']
            color = self.driver_colors.get(driver, self.team_colors.get(team_name, '#FFFFFF'))
            
            # Calculate lap times statistics
            valid_laps = driver_laps[driver_laps['Time'].notna()]
            
            data = {
                'driver': driver,
                'full_name': driver_info['FullName'],
                'team': team_name,
                'color': color,
                'fastest_lap_time': self.format_lap_time(fastest_lap['LapTime']) if fastest_lap is not None and pd.notna(fastest_lap['LapTime']) else None,
                'fastest_lap_number': int(fastest_lap['LapNumber']) if fastest_lap is not None else None,
                'total_laps': len(driver_laps),
                'valid_laps': len(valid_laps),
                'position': driver_info.get('Position', None)
            }
            
            if len(valid_laps) > 0:
                lap_times = valid_laps['LapTime'].dt.total_seconds()
                data['average_lap_time'] = float(lap_times.mean())
                data['best_lap_time'] = float(lap_times.min())
            
            return data
        except Exception as e:
            logging.error(f"Error getting driver data for {driver}: {str(e)}")
            return None
    
    def get_telemetry_data(self, year, round_number, session, driver, lap_number=None):
        """Get detailed telemetry data for a driver"""
        try:
            session_obj = fastf1.get_session(year, round_number, session)
            session_obj.load()
            
            driver_laps = session_obj.laps.pick_driver(driver)
            
            if lap_number:
                lap = driver_laps[driver_laps['LapNumber'] == lap_number]
                if lap.empty:
                    return {'error': f'Lap {lap_number} not found for {driver}'}
                lap = lap.iloc[0]
            else:
                # Use fastest lap if no specific lap requested
                lap = driver_laps.pick_fastest()
            
            if lap is None:
                return {'error': f'No valid lap found for {driver}'}
            
            # Get telemetry data
            telemetry = lap.get_telemetry()
            
            if telemetry.empty:
                return {'error': f'No telemetry data available for {driver}'}
            
            # Convert telemetry to JSON-serializable format
            telemetry_data = {
                'lap_number': int(lap['LapNumber']),
                'lap_time': str(lap['LapTime']) if pd.notna(lap['LapTime']) else None,
                'driver': driver,
                'distance': telemetry['Distance'].tolist(),
                'speed': telemetry['Speed'].tolist(),
                'throttle': telemetry['Throttle'].tolist(),
                'brake': telemetry['Brake'].tolist(),
                'gear': telemetry['nGear'].tolist(),
                'rpm': telemetry['RPM'].tolist(),
                'drs': telemetry['DRS'].tolist() if 'DRS' in telemetry.columns else []
            }
            
            return telemetry_data
        except Exception as e:
            logging.error(f"Error getting telemetry data: {str(e)}")
            return {'error': str(e)}
    
    def get_lap_times(self, year, round_number, session, drivers):
        """Get comprehensive lap times data with advanced metrics"""
        try:
            session_obj = fastf1.get_session(year, round_number, session)
            session_obj.load()
            
            lap_times_data = {}
            
            for driver in drivers:
                driver_laps = session_obj.laps.pick_driver(driver)
                valid_laps = driver_laps[driver_laps['Time'].notna()]
                
                if not valid_laps.empty:
                    lap_numbers = valid_laps['LapNumber'].tolist()
                    
                    # Enhanced lap times with multiple metrics
                    lap_times = []
                    sector1_times = []
                    sector2_times = []
                    sector3_times = []
                    speed_traps = []
                    tire_compounds = []
                    
                    for _, lap_row in valid_laps.iterrows():
                        # Lap time
                        if pd.isna(lap_row['LapTime']):
                            lap_times.append(None)
                        else:
                            lap_times.append(float(lap_row['LapTime'].total_seconds()))
                        
                        # Sector times
                        sector1_times.append(float(lap_row['Sector1Time'].total_seconds()) if pd.notna(lap_row['Sector1Time']) else None)
                        sector2_times.append(float(lap_row['Sector2Time'].total_seconds()) if pd.notna(lap_row['Sector2Time']) else None)
                        sector3_times.append(float(lap_row['Sector3Time'].total_seconds()) if pd.notna(lap_row['Sector3Time']) else None)
                        
                        # Speed trap
                        speed_traps.append(float(lap_row['SpeedST']) if pd.notna(lap_row['SpeedST']) else None)
                        
                        # Tire compound
                        tire_compounds.append(str(lap_row['Compound']) if pd.notna(lap_row['Compound']) else 'Unknown')
                    
                    # Performance statistics
                    fastest_lap_time = min([t for t in lap_times if t is not None]) if lap_times else None
                    average_lap_time = sum([t for t in lap_times if t is not None]) / len([t for t in lap_times if t is not None]) if lap_times else None
                    
                    lap_times_data[driver] = {
                        'lap_numbers': lap_numbers,
                        'lap_times': lap_times,
                        'sector1_times': sector1_times,
                        'sector2_times': sector2_times,
                        'sector3_times': sector3_times,
                        'speed_traps': speed_traps,
                        'tire_compounds': tire_compounds,
                        'color': self.driver_colors.get(driver, '#FFFFFF'),
                        'fastest_lap_time': fastest_lap_time,
                        'average_lap_time': average_lap_time,
                        'total_laps': len(lap_times)
                    }
            
            return lap_times_data
        except Exception as e:
            logging.error(f"Error getting lap times: {str(e)}")
            return {}
