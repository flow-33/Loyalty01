// static/js/earn.js
const earningRules = {
    tiers: {
        Bronze: {
            multiplier: 1,
            description: "1x points on regular purchases, 2x on flights"
        },
        Silver: {
            multiplier: 1.5,
            description: "1.5x points on regular purchases, 3x on flights"
        },
        Gold: {
            multiplier: 2,
            description: "2x points on regular purchases, 4x on flights"
        },
        Platinum: {
            multiplier: 3,
            description: "3x points on regular purchases, 6x on flights"
        }
    },
    categories: {
        creditCard: {
            multiplier: 1,
            description: "Base earning on regular purchases"
        },
        flights: {
            multiplier: 2,
            description: "Double points on flight purchases"
        }
    },
    calculatePoints: function(amount, category, tier) {
        const tierMultiplier = this.tiers[tier].multiplier;
        const categoryMultiplier = this.categories[category].multiplier;
        return Math.floor(amount * tierMultiplier * categoryMultiplier);
    },
    getEarningRate: function(tier, category) {
        const tierMultiplier = this.tiers[tier].multiplier;
        const categoryMultiplier = this.categories[category].multiplier;
        return tierMultiplier * categoryMultiplier;
    }
};