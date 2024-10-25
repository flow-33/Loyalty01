const Components = {
    navigation: `
        <div class="flex justify-around items-center h-16 bg-white">
            <a class="flex flex-col items-center p-2 text-gray-600" onclick="navigateToDashboard(event)">
                <svg><!-- Dashboard icon --></svg>
                <span class="text-xs mt-1">Dashboard</span>
            </a>
            <a class="flex flex-col items-center p-2 text-gray-600" onclick="navigateToHistory(event)">
                <svg><!-- History icon --></svg>
                <span class="text-xs mt-1">History</span>
            </a>
            <a class="flex flex-col items-center p-2 text-gray-600" onclick="navigateToRewards(event)">
                <svg><!-- Rewards icon --></svg>
                <span class="text-xs mt-1">Rewards</span>
            </a>
        </div>
    `,

    header: `
        <div class="sticky-header shadow-lg">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center space-x-3">
                        <img class="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                             src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                             onclick="navigateToProfile(event)" />
                        <div class="flex flex-col">
                            <span id="navTier" class="font-semibold text-sm"></span>
                            <span id="navPoints" class="text-sm text-gray-600"></span>
                        </div>
                    </div>
                    <div>
                        <span id="gameTime" class="text-sm text-gray-600"></span>
                    </div>
                </div>
            </div>
        </div>
    `
};
