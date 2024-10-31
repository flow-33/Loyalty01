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

function updateBadgePreview(data) {
    const previewContainer = document.getElementById('badgePreview');
    if (!previewContainer) return;

    const previewBadges = BadgeSystem.getPreviewBadges(data);
    const stats = BadgeSystem.calculateBadgeStats(data);
    
    previewContainer.innerHTML = previewBadges.map(badge => {
        const styles = CATEGORY_STYLES[badge.category];
        const isUnlocked = badge.condition(stats);
        const progress = (badge.progress(stats) / badge.requirement) * 100;
        
        return `
            <div class="relative p-4 rounded-lg border-2 ${
                isUnlocked 
                    ? styles.activeBorder + ' ' + styles.activeBg 
                    : 'border-gray-200 bg-gray-50'
            }">
                <div class="flex flex-col items-center text-center space-y-2">
                    <div class="text-3xl mb-2">${badge.icon}</div>
                    <div class="font-bold text-sm">${badge.name}</div>
                    <div class="text-xs px-1.5 py-0.5 rounded-full bg-${badge.rarity.color}-100 text-${badge.rarity.color}-600">
                        ${badge.rarity.label}
                    </div>
                    <div class="text-xs text-gray-600">${badge.description}</div>
                    ${!isUnlocked && badge.requirement > 1 ? `
                        <div class="w-full mt-2">
                            <div class="w-full bg-gray-200 rounded-full h-1">
                                <div class="${styles.progressBar} h-1 rounded-full transition-all duration-500"
                                     style="width: ${progress}%"></div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                ${badge.progress(stats)} / ${badge.requirement}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function loadProfile() {
    try {
        const data = await API.get(`user/${GameState.userId}`);
        await GameState.updateDashboard(data);
        
        // Additional profile-specific updates
        updateProfileStats(data);
        updateTierBenefits(data.tier);
        updateNextTierProgress(data);
        updateBadgePreview(data);  // Add this line
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