let userId = 'user1';

function updateProfileStats(data) {
    // Update user name and tier display
    const userTier = document.getElementById('userTier');
    if (userTier) {
        const playerName = data.playerName || GameState.playerName || 'Player';
        userTier.innerHTML = `
        <div class="text-2xl font-bold mb-1">${playerName}</div>
        <div class="text-xl">${data.tier} Tier Member</div>
    `;
    }

    // Update stats in the grid
    const stats = {
        'Total Spent': `$${data.totalSpent || 0}`,
        'Monthly Budget': `$${data.monthlyBudget || 0}`,
        'Current Month': `Year ${Math.floor((data.gameMonth || 1) / 12) + 1}, Month ${((data.gameMonth || 1) % 12) || 12}`,
        'Rewards Redeemed': data.redeemed_rewards?.length || 0
    };

    Object.entries(stats).forEach(([label, value]) => {
        const element = document.querySelector(`[data-stat="${label}"]`);
        if (element) {
            element.textContent = value;
        }
    });
}

function updateTierBenefits(tier) {
    const benefitsContainer = document.getElementById('tierBenefits');
    if (!benefitsContainer || !tierBenefits[tier]) return;

    const benefitsHTML = tierBenefits[tier].map(benefit => `
        <div class="bg-gray-50 p-4 rounded">
            <div class="flex items-center gap-2">
                <span class="text-2xl">${benefit.icon}</span>
                <h4 class="font-bold">${benefit.title}</h4>
            </div>
            <p class="text-gray-600 mt-2">${benefit.description}</p>
        </div>
    `).join('');

    benefitsContainer.innerHTML = benefitsHTML;
}

function updateNextTierProgress(data) {
    const nextTierContainer = document.getElementById('nextTierProgress');
    if (!nextTierContainer) return;

    const currentTier = data.tier;
    const nextTierInfo = nextTierBenefits[currentTier];

    if (!nextTierInfo || !nextTierInfo.required) {
        nextTierContainer.innerHTML = `
            <div class="bg-blue-50 p-4 rounded">
                <p class="text-blue-800">🎉 Congratulations! You've reached the highest tier!</p>
            </div>
        `;
        return;
    }

    const progress = (data.totalSpent / nextTierInfo.required) * 100;
    const remaining = nextTierInfo.required - data.totalSpent;

    nextTierContainer.innerHTML = `
        <div class="bg-gray-50 p-4 rounded">
            <h4 class="font-bold mb-2">Next Tier: ${nextTierInfo.tier}</h4>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            <p class="text-sm text-gray-600">
                Spend $${remaining} more to reach ${nextTierInfo.tier}
            </p>
        </div>
    `;
}

async function loadProfile() {
    try {
        const data = await API.get(`user/${GameState.userId}`);
        await GameState.updateDashboard(data);
        
        // Additional profile-specific updates
        updateProfileStats(data);
        updateTierBenefits(data.tier);
        updateNextTierProgress(data);
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
        try {
            await API.post('reset', {});
            window.location.href = '/';
        } catch (error) {
            alert('Failed to reset game');
            console.error('Error resetting game:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);