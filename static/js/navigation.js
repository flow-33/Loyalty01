// navigation.js
let navigationInitialized = false;


function createNavigationHandler(path) {
    return async (event) => {
        event.preventDefault();
        console.log('Navigation triggered to:', path);
        await loadContent(path);
    };
}

async function loadContent(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Failed to load page');
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get the main content
        const newContent = doc.querySelector('[role="main"]');
        if (!newContent) {
            console.error('Main content not found in response:', html);
            throw new Error('Could not find main content');
        }    
                
        // Update the main content area
        const mainContent = document.querySelector('[role="main"]');
        if (mainContent) {
            console.log('Updating main content');
            mainContent.innerHTML = newContent.innerHTML;
            
            // Update URL without page reload
            history.pushState({}, '', path);

            // Special handling for dashboard
            if (path === '/' || path === '') {
                const savedState = localStorage.getItem('gameState');
                if (savedState) {
                    const data = JSON.parse(savedState);
                    showMainScreen(data);
                    await GameState.updateDashboard(data);
                }
            }
            
            // Initialize page content
            console.log('Calling initializePage for path:', path);
            await initializePage(path);
        }
    } catch (error) {
        console.error('Navigation error:', error);
    }
}

async function initializePage(path) {
    console.log('Initializing page for path:', path);
    try {
        // Get latest state only if we don't have one
        if (!GameState.getCurrentState()) {
            console.log('No current state, loading initial state');
            const data = await API.get(`user/${GameState.userId}`);
            await GameState.updateDashboard(data);
        } else {
            console.log('Using existing state:', GameState.getCurrentState());
            await GameState.updateDashboard(GameState.getCurrentState());
        }

        // Dashboard-specific initialization
        if (path === '/' || path === '') {
            console.log('Initializing dashboard elements');
            initializeDashboard();
        }
        
        // History-specific initialization
        if (path === '/history') {
            console.log('Initializing history page');
            const currentState = GameState.getCurrentState();
            if (currentState?.history) {
                updateHistory(currentState.history);
            }
        }
        
        // Profile-specific initialization
        if (path === '/profile') {
            console.log('Initializing profile page');
            const currentState = GameState.getCurrentState();
            if (currentState && window.updateProfileStats) {
                window.updateProfileStats(currentState);
                window.updateTierBenefits?.(currentState.tier);
                window.updateNextTierProgress?.(currentState);
            }
        }

        // Reattach navigation handlers
        setupNavigation();

    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

function initializeDashboard() {
    const slider = document.getElementById('budgetSlider');
    if (slider && !slider.hasListener) {
        initializeSlider();
        slider.hasListener = true;
    }

    const startButton = document.querySelector('#setupScreen button');
    if (startButton && !startButton.hasListener) {
        startButton.onclick = startGame;
        startButton.hasListener = true;
    }

    if (!document.getElementById('setupScreen')?.classList.contains('hidden')) {
        initializeTransactionButtons();
    }
}

// Setup navigation functions
function setupNavigation() {
    if (navigationInitialized) return;
    console.log('Setting up navigation handlers');
    
    // Remove existing onclick attributes
    document.querySelectorAll('a[onclick]').forEach(link => {
        link.removeAttribute('onclick');
        
        // Add new event listeners
        const path = link.getAttribute('href');
        if (path) {
            link.addEventListener('click', createNavigationHandler(path));
        }
    });
    
    navigationInitialized = true;
}

// Handle browser back/forward buttons
window.addEventListener('popstate', async () => {
    console.log('Popstate triggered, loading:', window.location.pathname);
    await loadContent(window.location.pathname);
});

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing navigation');
    setupNavigation();
    if (!GameState.getCurrentState()) {
        console.log('Initializing GameState');
        GameState.init();
    }
});

// Make navigation handlers available globally
window.navigateToDashboard = createNavigationHandler('/');
window.navigateToHistory = createNavigationHandler('/history');
window.navigateToRewards = createNavigationHandler('/rewards');
window.navigateToProfile = createNavigationHandler('/profile');
window.navigateToPlanes = createNavigationHandler('/planes');