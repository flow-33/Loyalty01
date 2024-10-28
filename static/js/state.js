const GameState = {
    userId: localStorage.getItem('userId') || 'user1',
    currentState: null,
    playerName: localStorage.getItem('playerName') || '',
    
    init() {
        console.log('GameState.init() called');
        // Save userId to localStorage if not already there
        if (!localStorage.getItem('userId')) {
            console.log('Setting initial userId in localStorage:', this.userId);
            localStorage.setItem('userId', this.userId);
        }

        // Add player name initialization
        if (!localStorage.getItem('playerName')) {
            console.log('Setting initial playerName in localStorage:', this.playerName);
            localStorage.setItem('playerName', this.playerName);
        }else{
            this.playerName = localStorage.getItem('playerName');
        }
        
        
        // Try to restore state from localStorage
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                this.currentState = JSON.parse(savedState);
                console.log('Restored state from localStorage:', this.currentState);
            } catch (e) {
                console.error('Error parsing saved state:', e);
            }
        }
    },
    
    setPlayerName(name) {
        this.playerName = name;
        localStorage.setItem('playerName', name);
    },

    getCurrentState() {
        console.log('getCurrentState called, returning:', this.currentState);
        return this.currentState;
    },

    async updateDashboard(data) {
        console.log('updateDashboard called with data:', data);
        // Don't update if data is empty or undefined
        if (!data || Object.keys(data).length === 0) {
            console.warn('Attempted to update with empty data');
            return;
        }
        // Store the current state
        this.currentState = data;

        // Update player name if it exists in the data
        if (data.playerName) {
            this.playerName = data.playerName;
            localStorage.setItem('playerName', data.playerName);
        }
        
        // Save state to localStorage
        localStorage.setItem('gameState', JSON.stringify(data));
        console.log('Saved state to localStorage:', data);

        
        // Update UI elements
        const elements = {
            navPoints: data.points + ' Points',
            navTier: data.tier,
            gameTime: `Year ${Math.floor((data.gameMonth || 1) / 12) + 1}, Month ${((data.gameMonth || 1) % 12) || 12}`,
            currentTier: data.tier,
            pointsBalance: data.points,
            totalSpent: data.totalSpent,
            monthlySpent: data.monthlySpent,
            monthlyBudget: data.monthlyBudget,
            flightsLeft: 2 - data.flightsThisMonth
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`Updating element ${id} with value:`, value);
                element.textContent = value;
            }
        });

        // Update progress bar if it exists
        const progressBar = document.getElementById('monthlyProgress');
        if (progressBar) {
            const progress = (data.monthlySpent / data.monthlyBudget) * 100;
            progressBar.style.width = `${progress}%`;
        }

        // Update history if data includes it
        if (data.history) {
            updateHistory(data.history);
        }

        // Update earning rates
        const creditCardRate = document.getElementById('creditCardRate');
        const flightRate = document.getElementById('flightRate');
        if (creditCardRate && flightRate) {
            const creditCardEarning = earningRules.getEarningRate(data.tier, 'creditCard');
            const flightEarning = earningRules.getEarningRate(data.tier, 'flights');
            
            creditCardRate.textContent = `Earn ${creditCardEarning}x points`;
            flightRate.textContent = `Earn ${flightEarning}x points`;
        }

        return data;
    },

    async loadInitialState() {
        console.log('loadInitialState called');
        // If we already have state, use it
        if (this.currentState) {
            console.log('Using existing state:', this.currentState);
            await this.updateDashboard(this.currentState);
            return this.currentState;
        }
        
        // Otherwise load from server
        try {
            console.log('Fetching state from server for user:', this.userId);
            const data = await API.get(`user/${this.userId}`);
            await this.updateDashboard(data);
            return data;
        } catch (error) {
            console.error('Error loading initial state:', error);
            return null;
        }
    }
};

// Initialize GameState when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Initializing GameState');
    GameState.init();
    
    // Only load from server if we don't have state
    if (!GameState.getCurrentState()) {
        console.log('No existing state found, loading initial state');
        await GameState.loadInitialState();
    } else {
        console.log('Using existing state:', GameState.getCurrentState());
        await GameState.updateDashboard(GameState.getCurrentState());
    }
});

// Make GameState global
window.GameState = GameState;