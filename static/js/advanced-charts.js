// Advanced F1 Telemetry Charts - Premium Dashboard
class F1TelemetryDashboard {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#f47600',
            secondary: '#00d4ff',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            grid: '#374151',
            text: '#f9fafb'
        };
        
        // Set Chart.js global defaults for dark theme
        Chart.defaults.color = this.chartColors.text;
        Chart.defaults.borderColor = this.chartColors.grid;
        Chart.defaults.backgroundColor = 'rgba(244, 118, 0, 0.1)';
    }

    // Enhanced Lap Times Chart with Multiple Metrics
    createLapTimesChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const datasets = Object.keys(data).map(driver => ({
            label: driver,
            data: data[driver].lap_times.map((time, index) => ({
                x: data[driver].lap_numbers[index],
                y: time
            })),
            borderColor: data[driver].color,
            backgroundColor: data[driver].color + '20',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.2,
            fill: false
        }));

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Lap Times Comparison',
                        font: { size: 18, weight: 'bold' },
                        color: this.chartColors.text
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'point',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const minutes = Math.floor(context.parsed.y / 60);
                                const seconds = (context.parsed.y % 60).toFixed(3);
                                return `${context.dataset.label}: ${minutes}:${seconds.padStart(6, '0')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Lap Number',
                            font: { weight: 'bold' }
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Lap Time (seconds)',
                            font: { weight: 'bold' }
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        },
                        ticks: {
                            callback: function(value) {
                                const minutes = Math.floor(value / 60);
                                const seconds = (value % 60).toFixed(1);
                                return `${minutes}:${seconds.padStart(4, '0')}`;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Sector Performance Radar Chart
    createSectorRadarChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const drivers = Object.keys(data);
        const datasets = drivers.map(driver => {
            const driverData = data[driver];
            const avgSector1 = this.calculateAverage(driverData.sector1_times);
            const avgSector2 = this.calculateAverage(driverData.sector2_times);
            const avgSector3 = this.calculateAverage(driverData.sector3_times);

            return {
                label: driver,
                data: [avgSector1, avgSector2, avgSector3],
                borderColor: driverData.color,
                backgroundColor: driverData.color + '30',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8
            };
        });

        this.charts[containerId] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Sector 1', 'Sector 2', 'Sector 3'],
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Sector Performance',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: false,
                        grid: {
                            color: this.chartColors.grid + '60'
                        },
                        angleLines: {
                            color: this.chartColors.grid + '60'
                        },
                        pointLabels: {
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                return `${value.toFixed(1)}s`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Speed Trap Comparison Chart
    createSpeedChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const datasets = Object.keys(data).map(driver => ({
            label: driver,
            data: data[driver].speed_traps.map((speed, index) => ({
                x: data[driver].lap_numbers[index],
                y: speed
            })).filter(point => point.y !== null),
            borderColor: data[driver].color,
            backgroundColor: data[driver].color + '20',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.1
        }));

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Speed Trap Analysis',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Lap Number'
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Speed (km/h)'
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        }
                    }
                }
            }
        });
    }

    // Tire Strategy Visualization
    createTireStrategyChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const tireColors = {
            'SOFT': '#ff0000',
            'MEDIUM': '#ffff00', 
            'HARD': '#ffffff',
            'INTERMEDIATE': '#00ff00',
            'WET': '#0000ff',
            'Unknown': '#888888'
        };

        const drivers = Object.keys(data);
        const maxLaps = Math.max(...drivers.map(d => data[d].lap_numbers.length));

        const datasets = drivers.map((driver, driverIndex) => {
            const driverData = data[driver];
            const tireData = [];
            
            driverData.lap_numbers.forEach((lapNum, lapIndex) => {
                const compound = driverData.tire_compounds[lapIndex];
                tireData.push({
                    x: lapNum,
                    y: driverIndex,
                    compound: compound,
                    backgroundColor: tireColors[compound] || tireColors['Unknown']
                });
            });

            return {
                label: driver,
                data: tireData,
                backgroundColor: function(context) {
                    return context.raw.backgroundColor;
                },
                borderColor: data[driver].color,
                borderWidth: 1,
                pointRadius: 8,
                pointHoverRadius: 10
            };
        });

        this.charts[containerId] = new Chart(ctx, {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tire Strategy Overview',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label} - Lap ${context.raw.x}: ${context.raw.compound}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Lap Number'
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Drivers'
                        },
                        ticks: {
                            callback: function(value, index) {
                                return drivers[value] || '';
                            },
                            stepSize: 1
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        }
                    }
                }
            }
        });
    }

    // Performance Delta Chart
    createDeltaChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const drivers = Object.keys(data);
        if (drivers.length < 2) return;

        const baseDriver = drivers[0];
        const baseData = data[baseDriver];
        
        const datasets = drivers.slice(1).map(driver => {
            const driverData = data[driver];
            const deltaData = [];
            
            // Calculate delta to base driver
            baseData.lap_numbers.forEach((lapNum, index) => {
                const baseLapTime = baseData.lap_times[index];
                const driverLapIndex = driverData.lap_numbers.indexOf(lapNum);
                
                if (driverLapIndex !== -1 && baseLapTime && driverData.lap_times[driverLapIndex]) {
                    const delta = driverData.lap_times[driverLapIndex] - baseLapTime;
                    deltaData.push({
                        x: lapNum,
                        y: delta
                    });
                }
            });

            return {
                label: `${driver} vs ${baseDriver}`,
                data: deltaData,
                borderColor: driverData.color,
                backgroundColor: driverData.color + '20',
                borderWidth: 3,
                pointRadius: 4,
                tension: 0.2,
                fill: true
            };
        });

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Performance Delta (vs ${baseDriver})`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Lap Number'
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Time Delta (seconds)'
                        },
                        grid: {
                            color: this.chartColors.grid + '40'
                        },
                        ticks: {
                            callback: function(value) {
                                return (value >= 0 ? '+' : '') + value.toFixed(3) + 's';
                            }
                        }
                    }
                }
            }
        });
    }

    // Utility function to calculate average
    calculateAverage(array) {
        const validValues = array.filter(val => val !== null && !isNaN(val));
        return validValues.length > 0 ? validValues.reduce((a, b) => a + b) / validValues.length : 0;
    }

    // Destroy all charts
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Global dashboard instance
window.f1Dashboard = new F1TelemetryDashboard();