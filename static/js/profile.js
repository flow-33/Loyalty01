let userId = 'user1';

async function loadProfile() {
    const response = await fetch(`/api/user/${userId}`);
    const data = await response.json();
    
    // Update header info
    document.getElementById('navPoints').textContent = `${data.points} Points`;
    document.getElementById('navTier').textContent = data.tier;
    
    // Calculate and set game time once
    const year = Math.floor((data.gameMonth || 1) / 12) + 1;
    const month = ((data.gameMonth || 1) % 12) || 12;
    document.getElementById('gameTime').textContent = `Year ${year}, Month ${month}`;
    
    // Update profile stats
    document.getElementById('userTier').textContent = data.tier;
    document.getElementById('userPoints').textContent = `${data.points} Points`;
    document.getElementById('totalSpent').textContent = `$${data.totalSpent}`;
    document.getElementById('monthlyBudget').textContent = `$${data.monthlyBudget}`;
    document.getElementById('rewardsRedeemed').textContent = data.redeemed_rewards ? data.redeemed_rewards.length : 0;
    document.getElementById('currentMonth').textContent = `Month ${month}`; // Use calculated month

    // Update tier benefits
    const currentTierBenefits = tierBenefits[data.tier];
    const benefitsHtml = currentTierBenefits.map(benefit => `
        <div class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
            <div class="flex items-start space-x-3">
                <div class="text-2xl">${benefit.icon}</div>
                <div>
                    <h3 class="font-semibold">${benefit.title}</h3>
                    <p class="text-sm text-gray-600">${benefit.description}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('tierBenefits').innerHTML = benefitsHtml;

    // Show progress to next tier
    const nextTier = nextTierBenefits[data.tier];
    if (nextTier && nextTier.required) {
        const progress = (data.totalSpent / nextTier.required) * 100;
        document.getElementById('nextTierProgress').innerHTML = `
            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h3 class="font-semibold mb-2">Next Tier: ${nextTier.tier}</h3>
                <p class="text-sm text-gray-600 mb-2">
                    Spend $${nextTier.required - data.totalSpent} more to reach ${nextTier.tier}
                </p>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                         style="width: ${Math.min(progress, 100)}%">
                    </div>
                </div>
            </div>
        `;
    } else {
        document.getElementById('nextTierProgress').innerHTML = `
            <div class="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-100">
                <h3 class="font-semibold text-purple-800">🎉 Congratulations!</h3>
                <p class="text-sm text-purple-600">You've reached our highest tier level</p>
            </div>
        `;
    }
}

async function resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
        const response = await fetch('/api/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (response.ok) {
            window.location.href = '/';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);