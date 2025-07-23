// Telemetry visualization and data management

class TelemetryManager {
    constructor(sessionData) {
        this.sessionData = sessionData;
        this.telemetryData = new Map();
        this.currentChart = null;
        this.currentChartType = 'speed';
        this.isLoading = false;
        
        this.initializeChart();
        this.bindEvents();
    }

    initializeChart() {
        const ctx = document.getElementById('telemetryChart');
        if (!ctx) return;

        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Speed Comparison',
                        color: '#e0e0e0',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.95)',
                        titleColor: '#e0e0e0',
                        bodyColor: '#e0e0e0',
                        borderColor: '#3671C6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: (context) => {
                                const point = context[0];
                                const distance = point.label;
                                return `Distance: ${Math.round(distance)}m`;
                            },
                            label: (context) => {
                                const value = context.parsed.y;
                                const label = context.dataset.label;
                                
                                switch (this.currentChartType) {
                                    case 'speed':
                                        return `${label}: ${Math.round(value)} km/h`;
                                    case 'throttle':
                                    case 'brake':
                                        return `${label}: ${Math.round(value)}%`;
                                    case 'gear':
                                        return `${label}: Gear ${value}`;
                                    case 'rpm':
                                        return `${label}: ${Math.round(value)} RPM`;
                                    default:
                                        return `${label}: ${value}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Distance (m)',
                            color: '#e0e0e0',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#888888',
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(136, 136, 136, 0.2)',
                            lineWidth: 1
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Speed (km/h)',
                            color: '#e0e0e0',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#888888',
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(136, 136, 136, 0.2)',
                            lineWidth: 1
                        }
                    }
                }
            }
        });
    }

    bindEvents() {
        // Chart type change handlers are bound in the HTML template
    }

    async loadAllTelemetryData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            const loadPromises = this.sessionData.drivers.map(driver => 
                this.loadDriverTelemetry(driver.code, driver.fastest_lap)
            );
            
            await Promise.all(loadPromises);
            
            if (this.currentChartType === 'lap_times') {
                await this.loadLapTimesData();
            } else {
                this.updateChart();
            }
            
            showMessage('Telemetry data loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error loading telemetry data:', error);
            showMessage(`Error loading telemetry: ${error.message}`, 'error');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async loadDriverTelemetry(driverCode, lapNumber = null) {
        try {
            const url = `/api/telemetry/${this.sessionData.year}/${this.sessionData.round_number}/${this.sessionData.session}/${driverCode}`;
            const params = lapNumber ? `?lap=${lapNumber}` : '';
            
            const data = await fetchWithErrorHandling(url + params);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            this.telemetryData.set(driverCode, data);
            return data;
            
        } catch (error) {
            console.error(`Error loading telemetry for ${driverCode}:`, error);
            throw error;
        }
    }

    async loadLapTimesData() {
        try {
            const drivers = this.sessionData.drivers.map(d => d.code);
            const url = `/api/lap_times/${this.sessionData.year}/${this.sessionData.round_number}/${this.sessionData.session}`;
            const params = `?${drivers.map(d => `drivers=${d}`).join('&')}`;
            
            const data = await fetchWithErrorHandling(url + params);
            this.lapTimesData = data;
            this.updateLapTimesChart();
            
        } catch (error) {
            console.error('Error loading lap times:', error);
            throw error;
        }
    }

    switchChartType(chartType) {
        this.currentChartType = chartType;
        
        // Update chart title
        const titleElement = document.getElementById('chartTitle');
        const titleMap = {
            'speed': 'Speed Comparison',
            'throttle': 'Throttle Application',
            'brake': 'Braking Analysis',
            'gear': 'Gear Usage',
            'rpm': 'Engine RPM',
            'lap_times': 'Lap Times Comparison'
        };
        
        if (titleElement) {
            titleElement.innerHTML = `<i class="fas fa-chart-area me-2"></i>${titleMap[chartType]}`;
        }
        
        if (chartType === 'lap_times') {
            if (this.lapTimesData) {
                this.updateLapTimesChart();
            } else {
                this.loadLapTimesData();
            }
        } else if (this.telemetryData.size > 0) {
            this.updateChart();
        }
    }

    updateChart() {
        if (!this.currentChart || this.telemetryData.size === 0) return;

        const datasets = [];
        const yAxisLabel = this.getYAxisLabel();
        
        for (const [driverCode, data] of this.telemetryData) {
            const driver = this.sessionData.drivers.find(d => d.code === driverCode);
            if (!driver || !data.distance || data.error) continue;

            const telemetryValues = this.getTelemetryValues(data);
            if (!telemetryValues || telemetryValues.length === 0) continue;

            const dataset = {
                label: `${driverCode} (Lap ${data.lap_number})`,
                data: data.distance.map((distance, index) => ({
                    x: distance,
                    y: telemetryValues[index]
                })),
                borderColor: driver.color,
                backgroundColor: this.hexToRgba(driver.color, 0.1),
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointBackgroundColor: driver.color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            };

            datasets.push(dataset);
        }

        this.currentChart.data.datasets = datasets;
        this.currentChart.options.scales.y.title.text = yAxisLabel;
        this.currentChart.options.plugins.title.text = document.getElementById('chartTitle').textContent.replace(/.*\s/, '');
        this.currentChart.update();
    }

    updateLapTimesChart() {
        if (!this.currentChart || !this.lapTimesData) return;

        const datasets = [];
        
        for (const [driverCode, data] of Object.entries(this.lapTimesData)) {
            const driver = this.sessionData.drivers.find(d => d.code === driverCode);
            if (!driver || !data.lap_numbers || !data.lap_times) continue;

            const dataset = {
                label: driverCode,
                data: data.lap_numbers.map((lapNumber, index) => ({
                    x: lapNumber,
                    y: data.lap_times[index]
                })),
                borderColor: driver.color,
                backgroundColor: this.hexToRgba(driver.color, 0.1),
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: driver.color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            };

            datasets.push(dataset);
        }

        this.currentChart.data.datasets = datasets;
        this.currentChart.options.scales.x.title.text = 'Lap Number';
        this.currentChart.options.scales.y.title.text = 'Lap Time (seconds)';
        this.currentChart.options.plugins.tooltip.callbacks.label = (context) => {
            const lapTime = utils.formatLapTime(context.parsed.y);
            return `${context.dataset.label}: ${lapTime}`;
        };
        this.currentChart.update();
    }

    getTelemetryValues(data) {
        switch (this.currentChartType) {
            case 'speed':
                return data.speed;
            case 'throttle':
                return data.throttle;
            case 'brake':
                return data.brake;
            case 'gear':
                return data.gear;
            case 'rpm':
                return data.rpm;
            default:
                return data.speed;
        }
    }

    getYAxisLabel() {
        const labelMap = {
            'speed': 'Speed (km/h)',
            'throttle': 'Throttle (%)',
            'brake': 'Brake (%)',
            'gear': 'Gear',
            'rpm': 'RPM',
            'lap_times': 'Lap Time (seconds)'
        };
        return labelMap[this.currentChartType] || 'Value';
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    exportChart() {
        if (!this.currentChart) return;

        try {
            const canvas = this.currentChart.canvas;
            const url = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.download = `f1-telemetry-${this.currentChartType}-${this.sessionData.year}-${this.sessionData.session}.png`;
            link.href = url;
            link.click();
            
            showMessage('Chart exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting chart:', error);
            showMessage('Error exporting chart', 'error');
        }
    }

    // Public method to get current data for external use
    getCurrentData() {
        return {
            sessionData: this.sessionData,
            telemetryData: this.telemetryData,
            lapTimesData: this.lapTimesData,
            currentChartType: this.currentChartType
        };
    }

    // Method to clear all data
    clearData() {
        this.telemetryData.clear();
        this.lapTimesData = null;
        if (this.currentChart) {
            this.currentChart.data.datasets = [];
            this.currentChart.update();
        }
    }
}

// Utility functions for telemetry analysis
window.TelemetryUtils = {
    calculateDelta: function(telemetry1, telemetry2) {
        if (!telemetry1 || !telemetry2) return null;
        
        const minLength = Math.min(telemetry1.distance.length, telemetry2.distance.length);
        const deltas = [];
        
        for (let i = 0; i < minLength; i++) {
            const delta = telemetry1.speed[i] - telemetry2.speed[i];
            deltas.push({
                distance: telemetry1.distance[i],
                delta: delta
            });
        }
        
        return deltas;
    },

    findBrakingPoints: function(telemetryData) {
        if (!telemetryData.brake || !telemetryData.distance) return [];
        
        const brakingPoints = [];
        let inBraking = false;
        
        for (let i = 0; i < telemetryData.brake.length; i++) {
            const brake = telemetryData.brake[i];
            
            if (brake > 10 && !inBraking) {
                // Start of braking zone
                brakingPoints.push({
                    distance: telemetryData.distance[i],
                    type: 'brake_start',
                    intensity: brake
                });
                inBraking = true;
            } else if (brake < 5 && inBraking) {
                // End of braking zone
                brakingPoints.push({
                    distance: telemetryData.distance[i],
                    type: 'brake_end',
                    intensity: brake
                });
                inBraking = false;
            }
        }
        
        return brakingPoints;
    },

    analyzeCorneringSpeeds: function(telemetryData, speedThreshold = 100) {
        if (!telemetryData.speed || !telemetryData.distance) return [];
        
        const corners = [];
        let inCorner = false;
        let cornerStart = null;
        
        for (let i = 0; i < telemetryData.speed.length; i++) {
            const speed = telemetryData.speed[i];
            
            if (speed < speedThreshold && !inCorner) {
                cornerStart = {
                    distance: telemetryData.distance[i],
                    speed: speed
                };
                inCorner = true;
            } else if (speed > speedThreshold && inCorner) {
                corners.push({
                    start: cornerStart,
                    end: {
                        distance: telemetryData.distance[i],
                        speed: speed
                    },
                    minSpeed: Math.min(...telemetryData.speed.slice(
                        telemetryData.distance.indexOf(cornerStart.distance),
                        i
                    ))
                });
                inCorner = false;
            }
        }
        
        return corners;
    }
};

// Make TelemetryManager available globally
window.TelemetryManager = TelemetryManager;
