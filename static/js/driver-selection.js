// Enhanced Driver Selection Interface for F1 Telemetry Pro

document.addEventListener('DOMContentLoaded', function() {
    const driversContainer = document.getElementById('driversContainer');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const yearSelect = document.getElementById('year');
    const roundSelect = document.getElementById('round');
    const sessionSelect = document.getElementById('session');
    
    let selectedDrivers = [];
    let availableDrivers = [];

    // Event listeners
    yearSelect.addEventListener('change', loadEvents);
    roundSelect.addEventListener('change', loadSessions);
    sessionSelect.addEventListener('change', loadDrivers);

    function loadEvents() {
        const year = yearSelect.value;
        if (!year) return;

        roundSelect.disabled = true;
        sessionSelect.disabled = true;
        roundSelect.innerHTML = '<option value="">Loading...</option>';

        fetch(`/api/events/${year}`)
            .then(response => response.json())
            .then(events => {
                roundSelect.innerHTML = '<option value="">Select Grand Prix</option>';
                events.forEach(event => {
                    const option = document.createElement('option');
                    option.value = event.round_number;
                    option.textContent = `${event.event_name} (${event.location})`;
                    roundSelect.appendChild(option);
                });
                roundSelect.disabled = false;
            })
            .catch(error => {
                console.error('Error loading events:', error);
                roundSelect.innerHTML = '<option value="">Error loading events</option>';
            });
    }

    function loadSessions() {
        const year = yearSelect.value;
        const round = roundSelect.value;
        if (!year || !round) return;

        sessionSelect.disabled = true;
        sessionSelect.innerHTML = '<option value="">Loading...</option>';

        fetch(`/api/sessions/${year}/${round}`)
            .then(response => response.json())
            .then(sessions => {
                sessionSelect.innerHTML = '<option value="">Select Session</option>';
                sessions.forEach(session => {
                    const option = document.createElement('option');
                    option.value = session.code;
                    option.textContent = session.name;
                    sessionSelect.appendChild(option);
                });
                sessionSelect.disabled = false;
            })
            .catch(error => {
                console.error('Error loading sessions:', error);
                sessionSelect.innerHTML = '<option value="">Error loading sessions</option>';
            });
    }

    function loadDrivers() {
        const year = yearSelect.value;
        const round = roundSelect.value;
        const session = sessionSelect.value;
        
        if (!year || !round || !session) return;

        driversContainer.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading drivers...</div>';

        fetch(`/api/drivers/${year}/${round}/${session}`)
            .then(response => response.json())
            .then(drivers => {
                availableDrivers = drivers;
                renderDriverSelection();
            })
            .catch(error => {
                console.error('Error loading drivers:', error);
                driversContainer.innerHTML = '<div class="text-danger">Error loading drivers</div>';
            });
    }

    function renderDriverSelection() {
        if (!availableDrivers.length) {
            driversContainer.innerHTML = '<div class="text-muted">No drivers available</div>';
            return;
        }

        // Group drivers by team
        const driversByTeam = {};
        availableDrivers.forEach(driver => {
            if (!driversByTeam[driver.team]) {
                driversByTeam[driver.team] = [];
            }
            driversByTeam[driver.team].push(driver);
        });

        let html = '<div class="drivers-grid">';
        
        Object.keys(driversByTeam).forEach(team => {
            const teamDrivers = driversByTeam[team];
            const teamColor = teamDrivers[0].team_color || '#FFFFFF';
            
            html += `
                <div class="team-section mb-3">
                    <div class="team-header" style="border-left: 4px solid ${teamColor};">
                        <h6 class="team-name mb-1">${team}</h6>
                        <small class="text-muted">${teamDrivers.length} driver${teamDrivers.length > 1 ? 's' : ''}</small>
                    </div>
                    <div class="team-drivers">
            `;
            
            teamDrivers.forEach(driver => {
                const isSelected = selectedDrivers.includes(driver.code);
                html += `
                    <div class="driver-card ${isSelected ? 'selected' : ''}" data-driver="${driver.code}">
                        <div class="driver-content">
                            <div class="driver-info">
                                <div class="driver-number" style="background: ${driver.color};">
                                    ${driver.driver_number || driver.code}
                                </div>
                                <div class="driver-details">
                                    <div class="driver-code">${driver.code}</div>
                                    <div class="driver-name">${driver.first_name} ${driver.last_name}</div>
                                </div>
                            </div>
                            <div class="selection-indicator">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        driversContainer.innerHTML = html;

        // Add click handlers
        document.querySelectorAll('.driver-card').forEach(card => {
            card.addEventListener('click', function() {
                toggleDriverSelection(this.dataset.driver);
            });
        });
        
        updateAnalyzeButton();
    }

    function toggleDriverSelection(driverCode) {
        const index = selectedDrivers.indexOf(driverCode);
        const card = document.querySelector(`[data-driver="${driverCode}"]`);
        
        if (index > -1) {
            selectedDrivers.splice(index, 1);
            card.classList.remove('selected');
        } else {
            selectedDrivers.push(driverCode);
            card.classList.add('selected');
        }
        
        updateAnalyzeButton();
    }

    function updateAnalyzeButton() {
        const hasSelections = selectedDrivers.length > 0;
        const hasSession = yearSelect.value && roundSelect.value && sessionSelect.value;
        
        analyzeBtn.disabled = !(hasSelections && hasSession);
        
        if (hasSelections) {
            analyzeBtn.innerHTML = `
                <i class="fas fa-chart-area me-2"></i>
                Analyze ${selectedDrivers.length} Driver${selectedDrivers.length > 1 ? 's' : ''}
            `;
        } else {
            analyzeBtn.innerHTML = `
                <i class="fas fa-chart-area me-2"></i>
                Select Drivers to Analyze
            `;
        }
    }

    // Form submission handler
    document.getElementById('selectionForm').addEventListener('submit', function(e) {
        // Add selected drivers as hidden inputs
        selectedDrivers.forEach(driver => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'drivers';
            input.value = driver;
            this.appendChild(input);
        });
    });
});