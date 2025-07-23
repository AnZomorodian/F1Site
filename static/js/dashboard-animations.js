// Dashboard Animation and Enhancement System
class DashboardAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupCounterAnimations();
        this.setupChartAnimations();
        this.setupHoverEffects();
    }

    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger counter animation
                    if (entry.target.classList.contains('metric-card')) {
                        this.animateCounter(entry.target);
                    }
                    
                    // Trigger chart animation
                    if (entry.target.classList.contains('chart-container')) {
                        this.animateChart(entry.target);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all metric cards and chart containers
        document.querySelectorAll('.metric-card, .chart-container, .driver-performance-card')
            .forEach(el => observer.observe(el));
    }

    setupCounterAnimations() {
        // Add counter animation CSS
        const style = document.createElement('style');
        style.textContent = `
            .metric-value {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease-out;
            }
            
            .metric-card.animate-in .metric-value {
                opacity: 1;
                transform: translateY(0);
            }
            
            .chart-container {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.8s ease-out;
            }
            
            .chart-container.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .driver-performance-card {
                opacity: 0;
                transform: scale(0.95);
                transition: all 0.6s ease-out;
            }
            
            .driver-performance-card.animate-in {
                opacity: 1;
                transform: scale(1);
            }
        `;
        document.head.appendChild(style);
    }

    animateCounter(card) {
        const valueElement = card.querySelector('.metric-value');
        if (!valueElement) return;

        const finalText = valueElement.textContent;
        const hasNumbers = /\d/.test(finalText);
        
        if (hasNumbers) {
            // Extract number from text
            const numberMatch = finalText.match(/[\d.]+/);
            if (numberMatch) {
                const finalNumber = parseFloat(numberMatch[0]);
                const suffix = finalText.replace(numberMatch[0], '');
                
                // Animate counter
                let current = 0;
                const increment = finalNumber / 30;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= finalNumber) {
                        current = finalNumber;
                        clearInterval(timer);
                    }
                    
                    valueElement.textContent = current.toFixed(1) + suffix;
                }, 50);
            }
        }
    }

    animateChart(container) {
        const canvas = container.querySelector('canvas');
        if (!canvas) return;

        // Add a subtle pulse effect to indicate chart loading
        canvas.style.filter = 'brightness(0.8)';
        setTimeout(() => {
            canvas.style.filter = 'brightness(1)';
            canvas.style.transition = 'filter 0.5s ease';
        }, 200);
    }

    setupChartAnimations() {
        // Override Chart.js default animations for premium feel
        if (window.Chart) {
            Chart.defaults.animation = {
                duration: 1500,
                easing: 'easeOutCubic'
            };
            
            Chart.defaults.animations = {
                tension: {
                    duration: 1000,
                    easing: 'easeOutCubic',
                    from: 1,
                    to: 0.2,
                    loop: false
                }
            };
        }
    }

    setupHoverEffects() {
        // Enhanced hover effects for metric cards
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
                this.style.boxShadow = '0 10px 25px rgba(244, 118, 0, 0.3)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });

        // Enhanced hover effects for driver cards
        document.querySelectorAll('.driver-performance-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    // Real-time data update simulation
    simulateRealTimeUpdates() {
        setInterval(() => {
            const metricCards = document.querySelectorAll('.metric-card .metric-value');
            metricCards.forEach(card => {
                const currentText = card.textContent;
                if (currentText.includes('km/h')) {
                    // Simulate speed fluctuation
                    const currentSpeed = parseFloat(currentText);
                    const variation = (Math.random() - 0.5) * 2; // ±1 km/h
                    const newSpeed = Math.max(0, currentSpeed + variation);
                    card.textContent = newSpeed.toFixed(1) + ' km/h';
                    
                    // Flash effect
                    card.style.color = '#10b981';
                    setTimeout(() => {
                        card.style.color = '';
                    }, 500);
                }
            });
        }, 5000); // Update every 5 seconds
    }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new DashboardAnimations();
    
    // Add loading animation for the entire dashboard
    const dashboard = document.querySelector('.container-fluid');
    if (dashboard) {
        dashboard.style.opacity = '0';
        dashboard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            dashboard.style.transition = 'all 0.8s ease-out';
            dashboard.style.opacity = '1';
            dashboard.style.transform = 'translateY(0)';
        }, 100);
    }
});