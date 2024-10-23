const tierBenefits = {
    Bronze: [
        { icon: "✈️", title: "Base Earning Rate", description: "1x points on regular purchases, 2x on flights" },
        { icon: "🎫", title: "Lounge Access", description: "Available for purchase at $50 per visit" },
        { icon: "💺", title: "Seat Selection", description: "Standard seat selection 24h before flight" },
        { icon: "🎁", title: "Birthday Bonus", description: "Double points on your birthday" },
        { icon: "📅", title: "Points Validity", description: "Points valid for 12 months" }
    ],
    Silver: [
        { icon: "✈️", title: "Enhanced Earning Rate", description: "1.5x points on regular purchases, 3x on flights" },
        { icon: "🎫", title: "Lounge Access", description: "50% off lounge access" },
        { icon: "💺", title: "Seat Selection", description: "Standard seat selection 48h before flight" },
        { icon: "🎁", title: "Flight Discount", description: "$50 off your 5th flight per year" },
        { icon: "📅", title: "Points Validity", description: "Points valid for 18 months" }
    ],
    Gold: [
        { icon: "✈️", title: "Premium Earning Rate", description: "2x points on regular purchases, 4x on flights" },
        { icon: "🎫", title: "Lounge Access", description: "4 complimentary visits per year" },
        { icon: "💺", title: "Seat Selection", description: "Premium seat selection 72h before flight" },
        { icon: "🎁", title: "Annual Bonus", description: "5,000 bonus points annually" },
        { icon: "📅", title: "Points Validity", description: "Points valid for 24 months" }
    ],
    Platinum: [
        { icon: "✈️", title: "Elite Earning Rate", description: "3x points on regular purchases, 6x on flights" },
        { icon: "🎫", title: "Lounge Access", description: "Unlimited complimentary access" },
        { icon: "💺", title: "Seat Selection", description: "Premium seat selection anytime" },
        { icon: "🎁", title: "Elite Benefits", description: "1 free upgrade per year + 10,000 bonus points" },
        { icon: "📅", title: "Points Validity", description: "Points never expire" }
    ]
};

const nextTierBenefits = {
    Bronze: { required: 1000, tier: 'Silver' },
    Silver: { required: 5000, tier: 'Gold' },
    Gold: { required: 10000, tier: 'Platinum' },
    Platinum: { required: null, tier: null }
};