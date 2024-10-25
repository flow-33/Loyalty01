// Define available rewards
const availableRewards = {
    flightUpgrade: {
        id: 'flightUpgrade',
        name: 'Flight Upgrade',
        description: 'Upgrade your next flight to business class',
        icon: '✈️',
        points: 20000,
    },
    loungeAccess: {
        id: 'loungeAccess',
        name: 'Lounge Access Pass',
        description: 'One-time access to airport lounges',
        icon: '🎫',
        points: 3000,
    },
    extraBaggage: {
        id: 'extraBaggage',
        name: 'Extra Baggage Allowance',
        description: '+23kg baggage allowance for one flight',
        icon: '🧳',
        points: 1500,
    },
    priorityBoarding: {
        id: 'priorityBoarding',
        name: 'Priority Boarding',
        description: 'Priority boarding for one flight',
        icon: '⭐',
        points: 800,
    },
    seatSelection: {
        id: 'seatSelection',
        name: 'Premium Seat Selection',
        description: 'Choose any available seat for free',
        icon: '💺',
        points: 500,
    }
};

async function loadRewards() {
    try {
        const data = await API.get(`user/${GameState.userId}`);
        await GameState.updateDashboard(data);
        displayAvailableRewards(data.points, data.tier);
    } catch (error) {
        console.error('Error loading rewards:', error);
    }
}

function displayAvailableRewards(userPoints, userTier) {
    const container = document.getElementById('rewardsContainer');
    if (!container) return;

    // Convert rewards object to array and sort by points
    const sortedRewards = Object.values(availableRewards)
        .sort((a, b) => a.points - b.points);

    const rewardsHTML =sortedRewards
        .map(reward => `
            <div class="bg-white rounded-lg shadow p-6 flex flex-col">
                <div class="text-3xl mb-2">${reward.icon}</div>
                <h3 class="text-xl font-bold mb-2">${reward.name}</h3>
                <p class="text-gray-600 mb-4 flex-grow">${reward.description}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-blue-600">${reward.points} points</span>
                    <button 
                        onclick="redeemReward('${reward.id}', ${reward.points})"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${userPoints >= reward.points ? '' : 'opacity-50 cursor-not-allowed'}"
                        ${userPoints >= reward.points ? '' : 'disabled'}
                    >
                        Redeem
                    </button>
                </div>
            </div>
        `)
        .join('');

    container.innerHTML = rewardsHTML;
}

async function redeemReward(rewardId, points) {
    try {
        const reward = Object.values(availableRewards).find(r => r.id === rewardId);
        if (!reward) {
            console.error('Invalid reward ID:', rewardId);
            throw new Error('Invalid reward');
        }
        const data = await API.post('redeem', {
            points: points,
            rewardName: reward.name
        });

        // Update the UI with new points balance
        await GameState.updateDashboard(data);
        
        // Show success message
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg';
        message.textContent = `Successfully redeemed ${reward.name}!`;
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => message.remove(), 2000);

        // Refresh rewards display
        displayAvailableRewards(data.points, data.tier);
    } catch (error) {
        alert(error.message);
        console.error('Error redeeming reward:', error);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadRewards);