// Global state
let buttonsInitialized = false;  // This flag to prevent duplicate initialization
let flightSwiper = null;

const flightOptions = [
    { city: 'Paris', price: 1300 },
    { city: 'London', price: 800 },
    { city: 'New York', price: 3500 },
    { city: 'Tokyo', price: 3200 },
    { city: 'Sydney', price: 1300 },
    { city: 'Rome', price: 900 },
    { city: 'Dubai', price: 800 },
    { city: 'Barcelona', price: 700 },
    { city: 'Amsterdam', price: 600 },
    { city: 'Seoul', price: 3500 },
    { city: 'Prague', price: 400 },
    { city: 'Jeddah', price: 300 },
    { city: 'Istanbul', price: 1200 },
]

// UI Initialization Functions
function initializeSlider() {
    const slider = document.getElementById('budgetSlider');
    const budgetValue = document.getElementById('budgetValue');
    
    if (slider && budgetValue) {
        slider.value = 5000; // Default value
        budgetValue.textContent = slider.value;
        
        slider.addEventListener('input', function(e) {
            budgetValue.textContent = e.target.value;
        });
    }
}

function updateFlightCarousel(){
    const flightContainer = document.querySelector('.flight-selector-container');
    if (!flightContainer) return;

    // Check remaining flights
    const flightsLeft = parseInt(document.getElementById('flightsLeft').textContent || '0');
    const isFlightsDisabled = flightsLeft <= 0;

    // Destroy existing swiper instance if it exists
    if (flightSwiper) {
        flightSwiper.destroy();
        flightSwiper = null;
    }

    flightContainer.innerHTML = `
        <div class="swiper-container flight-swiper">
            <div class="swiper-wrapper">
                ${flightOptions.map(flight => `
                    <div class="swiper-slide">
                        <button 
                            onclick="${isFlightsDisabled ? '' : `simulateTransaction(${flight.price}, 'flights')`}"
                            class="w-64 bg-blue-500 text-white rounded-lg p-6 hover:bg-blue-600 transition-colors ${isFlightsDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${isFlightsDisabled ? 'disabled' : ''}
                        >
                            <div class="text-2xl font-bold mb-2">${flight.city}</div>
                            <div class="text-xl">$${flight.price.toLocaleString()}</div>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="swiper-button-prev ${isFlightsDisabled ? 'opacity-50' : ''}"></div>
            <div class="swiper-button-next ${isFlightsDisabled ? 'opacity-50' : ''}"></div>
        </div>
    `;

    // Initialize New Swiper
    flightSwiper = new Swiper('.flight-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 16,
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        speed: 500,
        grabCursor: !isFlightsDisabled,
        touchEventsTarget: 'container',
        centeredSlides: true,
        enabled: !isFlightsDisabled,
    });
}

function initializeTransactionButtons() {
    // Prevent duplicate initialization
    if (buttonsInitialized) return;
    // Credit card spending buttons
    const creditCardContainer = document.querySelector('.flex.space-x-2.mb-4');
    if (creditCardContainer) {
        creditCardContainer.innerHTML = ''; // Clear any existing content
        const spendingAmounts = [50, 100, 200];
        spendingAmounts.forEach(amount => {
            const button = document.createElement('button');
            button.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors';
            button.textContent = `$${amount}`;
            button.onclick = () => simulateTransaction(amount, 'creditCard');
            creditCardContainer.appendChild(button);
        });
    }

    // Initialise Flight Carousel
    updateFlightCarousel();

    // Next month button
    const nextMonthButton = document.querySelector('.p-4.border-t.bg-gray-50');
    if (nextMonthButton) {
        nextMonthButton.className = 'sticky-next-month p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 text-center transition-colors';
        nextMonthButton.onclick = nextMonth;
    }

    buttonsInitialized = true;
}


// Game State Management Functions
async function startGame() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value;
    if (!name.trim()) {
        alert('Please enter your name');
        return;
    }
    
    const budget = parseInt(document.getElementById('budgetSlider').value);
    
    try {
        // Clear existing state before starting new game
        localStorage.removeItem('gameState');
        GameState.currentState = null;

        // Debug log
        console.log('Starting new game with:', {
            name: name,
            budget: budget
        });

    
        const data = await API.post('init', {
            monthlyBudget: budget,
            playerName: name
        });

        // Store player's name
        GameState.playerName = name;
        
        document.getElementById('setupScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.remove('hidden');
        await GameState.updateDashboard(data);
        
        // Initialize transaction buttons after showing main screen
        initializeTransactionButtons();
    } catch (error) {
        alert(error.message);
        console.error('Error starting game:', error);
    }
}

async function simulateTransaction(amount, category) {
    try {
        let data = { amount, category };
        
        // Add city for flight transactions
        if (category === 'flights') {
            const activeSlide = flightSwiper.slides[flightSwiper.activeIndex];
            const cityElement = activeSlide.querySelector('.text-2xl');
            data.city = cityElement.textContent;
        }
        
        const response = await API.post('simulate', data);
        await GameState.updateDashboard(response);

        // Update flight carousel after each transaction
        updateFlightCarousel();

        if (response.tierUp) {
            celebrateNewTier(response.newTier);
        }
    } catch (error) {
        alert(error.message);
        console.error('Error processing transaction:', error);
    }
}

async function nextMonth() {
    // Disable the button immediately to prevent double-clicks
    const nextMonthButton = document.querySelector('.sticky-next-month');
    if (nextMonthButton) {
        nextMonthButton.onclick = null;
        nextMonthButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    try {
        console.log('Advancing to next month');
        const data = await API.post('next-month', {});
        console.log('Month Data received:', data);
        await GameState.updateDashboard(data);
        // Update flight carousel after each month change
        updateFlightCarousel();
    } catch (error) {
        console.error('Error advancing month:', error);
        alert('Failed to advance to next month');
    } finally {
        // Re-enable the button and restore the click handler
        if (nextMonthButton) {
            nextMonthButton.onclick = nextMonth;
            nextMonthButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

// History Update Functions
function updateHistory(history = []) {
    // Update recent transactions in dashboard
    const recentHistoryHtml = history.slice(-3).reverse().map(transaction => `
        <div class="p-2 bg-gray-50 rounded flex justify-between items-center">
            <div>
                <div class="font-medium">${transaction.category}: $${transaction.amount}</div>
                <div class="text-xs text-gray-500">${transaction.date}</div>
            </div>
            <div class="text-right">
                <div class="text-sm">+${transaction.pointsEarned} pts</div>
            </div>
        </div>
    `).join('');
    
    const dashboardHistory = document.getElementById('history');
    if (dashboardHistory) {
        dashboardHistory.innerHTML = recentHistoryHtml;
    }

    // Update full history page if it exists
    const fullHistory = document.getElementById('fullHistory');
    if (fullHistory) {
        const fullHistoryHtml = history.reverse().map(transaction => `
            <div class="p-4 bg-white rounded-lg shadow">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-medium">${transaction.category}</div>
                        <div class="text-sm text-gray-500">${transaction.date}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-medium">$${transaction.amount}</div>
                        <div class="text-sm text-green-600">+${transaction.pointsEarned} pts</div>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mt-2">
                    Tier: ${transaction.tier}
                </div>
            </div>
        `).join('');
        fullHistory.innerHTML = fullHistoryHtml;
    }
}
// Tier Celebration
function celebrateNewTier(newTier) {
    // Create celebration overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const content = document.createElement('div');
    content.className = 'bg-white p-8 rounded-lg shadow-lg text-center';
    content.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Congratulations! 🎉</h2>
        <p class="text-xl mb-6">You've reached ${newTier} tier!</p>
        <button class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Continue</button>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Remove overlay when button is clicked
    content.querySelector('button').onclick = () => {
        overlay.remove();
    };
}

// Initial Page Load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard initializing...');
    // Initialize slider if it exists (dashboard only)
    const slider = document.getElementById('budgetSlider');
    if (slider) {
        initializeSlider();
    }

    // Initialize start game button
    const startButton = document.querySelector('#setupScreen button');
    if (startButton) {
        startButton.onclick = startGame;
    }

    try {
        // Check if we have an existing game state
        const currentState = GameState.getCurrentState();
        const setupScreen = document.getElementById('setupScreen');
        const mainScreen = document.getElementById('mainScreen');

        // Only proceed with dashboard-specific logic if we're on the dashboard page
        if (setupScreen && mainScreen) {
            if (currentState && currentState.monthlyBudget) {
            // Only show main screen if we have a valid state with a monthly budget
            setupScreen.classList.add('hidden');
            mainScreen.classList.remove('hidden');
            initializeTransactionButtons();
            await GameState.updateDashboard(currentState);
            } else {
                // Show setup screen if no valid state exists
                setupScreen.classList.remove('hidden');
                mainScreen.classList.add('hidden');
            }
        } else {
            // Not on dashboard page, just update the state if we have one
            if (currentState) {
                await GameState.updateDashboard(currentState);
            }
        }

    
        // Profile-specific updates
        if (document.getElementById('tierBenefits')) {
            updateProfileStats(data);
            updateTierBenefits(data.tier);
            updateNextTierProgress(data);
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});
