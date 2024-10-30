const CATEGORY_STYLES = {
    FLIGHTS: {
        activeBorder: 'border-blue-500',
        activeBg: 'bg-blue-50',
        progressBar: 'bg-blue-500',
        dot: 'bg-blue-500'
    },
    SPENDING: {
        activeBorder: 'border-green-500',
        activeBg: 'bg-green-50',
        progressBar: 'bg-green-500',
        dot: 'bg-green-500'
    },
    REWARDS: {
        activeBorder: 'border-orange-400',
        activeBg: 'bg-orange-50',
        progressBar: 'bg-orange-400',
        dot: 'bg-orange-400'
    },
    ACHIEVEMENTS: {
        activeBorder: 'border-purple-500',
        activeBg: 'bg-purple-50',
        progressBar: 'bg-purple-500',
        dot: 'bg-purple-500'
    },
    inactive: {
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        dot: 'bg-gray-300'
    }
};

const BadgeSystem = {
    BADGE_CATEGORIES: {
        FLIGHTS: '✈️',
        SPENDING: '💳',
        REWARDS: '🎁',
        ACHIEVEMENTS: '🏆'
    },

    BADGES: {
        FIRST_FLIGHT: {
            id: 'first_flight',
            name: 'First Flight',
            description: 'Book your first flight',
            category: 'FLIGHTS',
            icon: '✈️',
            condition: (stats) => stats.totalFlights >= 1,
            progress: (stats) => Math.min(stats.totalFlights, 1),
            requirement: 1
        },
        FREQUENT_FLYER: {
            id: 'frequent_flyer',
            name: 'Frequent Flyer',
            description: 'Book 5 flights',
            category: 'FLIGHTS',
            icon: '✈️✈️',
            condition: (stats) => stats.totalFlights >= 5,
            progress: (stats) => Math.min(stats.totalFlights, 5),
            requirement: 5
        },
        GLOBE_TROTTER: {
            id: 'globe_trotter',
            name: 'Globe Trotter',
            description: 'Visit 5 different cities',
            category: 'FLIGHTS',
            icon: '🌎',
            condition: (stats) => stats.uniqueDestinations >= 5,
            progress: (stats) => Math.min(stats.uniqueDestinations, 5),
            requirement: 5
        },
        BIG_SPENDER: {
            id: 'big_spender',
            name: 'Big Spender',
            description: 'Spend $10,000 on credit card',
            category: 'SPENDING',
            icon: '💳',
            condition: (stats) => stats.creditCardSpent >= 10000,
            progress: (stats) => Math.min(stats.creditCardSpent, 10000),
            requirement: 10000
        },
        REWARD_HUNTER: {
            id: 'reward_hunter',
            name: 'Reward Hunter',
            description: 'Redeem 3 rewards',
            category: 'REWARDS',
            icon: '🎁',
            condition: (stats) => stats.redeemedRewards >= 3,
            progress: (stats) => Math.min(stats.redeemedRewards, 3),
            requirement: 3
        },
        SILVER_STATUS: {
            id: 'silver_status',
            name: 'Silver Achievement',
            description: 'Reach Silver Tier',
            category: 'ACHIEVEMENTS',
            icon: '🥈',
            condition: (stats) => ['Silver', 'Gold', 'Platinum'].includes(stats.tier),
            progress: (stats) => ['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(stats.tier),
            requirement: 1
        },
        GOLD_STATUS: {
            id: 'gold_status',
            name: 'Gold Achievement',
            description: 'Reach Gold Tier',
            category: 'ACHIEVEMENTS',
            icon: '🥇',
            condition: (stats) => ['Gold', 'Platinum'].includes(stats.tier),
            progress: (stats) => ['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(stats.tier) >= 2 ? 1 : 0,
            requirement: 1
        },
        PLATINUM_STATUS: {
            id: 'platinum_status',
            name: 'Platinum Achievement',
            description: 'Reach Platinum Tier',
            category: 'ACHIEVEMENTS',
            icon: '👑',
            condition: (stats) => stats.tier === 'Platinum',
            progress: (stats) => stats.tier === 'Platinum' ? 1 : 0,
            requirement: 1
        }
    },

    calculateBadgeStats(userData) {
        const flightCities = new Set(userData.history
            .filter(transaction => transaction.category === 'flights')
            .map(flight => flight.city));

        const creditCardSpent = userData.history
            .filter(t => t.category === 'creditCard')
            .reduce((total, t) => total + t.amount, 0);

        return {
            totalFlights: userData.history.filter(t => t.category === 'flights').length,
            uniqueDestinations: flightCities.size,
            creditCardSpent,
            redeemedRewards: userData.redeemed_rewards?.length || 0,
            tier: userData.tier
        };
    },

    getBadgeStatuses(userData) {
        const stats = this.calculateBadgeStats(userData);
        return Object.values(this.BADGES).map(badge => ({
            ...badge,
            unlocked: badge.condition(stats),
            progress: badge.progress(stats),
        }));
    },

    renderBadges(container, userData) {
        const badges = this.getBadgeStatuses(userData);
        const html = badges.map(badge => {
            const styles = CATEGORY_STYLES[badge.category];
            return `
                <div class="relative p-4 rounded-lg border-2 ${
                    badge.unlocked 
                        ? styles.activeBorder + ' ' + styles.activeBg
                        : styles.inactiveBorder + ' ' + styles.inactiveBg
                }">
                    <div class="flex flex-col items-center text-center space-y-2">
                        <div class="text-3xl mb-2">${badge.icon}</div>
                        <div class="font-bold">${badge.name}</div>
                        <div class="text-sm text-gray-600">${badge.description}</div>
                        ${!badge.unlocked && badge.requirement > 1 ? `
                            <div class="w-full mt-2">
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="${styles.progressBar} h-2 rounded-full transition-all duration-500"
                                         style="width: ${(badge.progress / badge.requirement) * 100}%"></div>
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                    ${badge.progress} / ${badge.requirement}
                                </div>
                            </div>
                        ` : ''}
                        <div class="absolute top-2 right-2 w-3 h-3 rounded-full ${
                            badge.unlocked ? styles.progressBar : 'bg-gray-300'
                        }"></div>
                    </div>
                </div>
            `;
        }).join('');
    
        container.innerHTML = html;
    }
};

window.BadgeSystem = BadgeSystem;