const logDependencies = (context) => {
  console.log(`[Planes ${context}] Dependencies:`, {
    hasAPI: !!window.API,
    APIFunctions: window.API ? Object.keys(window.API) : [],
    hasGameState: !!window.GameState,
    GameStateFunctions: window.GameState ? Object.keys(window.GameState) : [],
    timestamp: new Date().toISOString()
  });
};
console.log('[Planes] Script loading...');
logDependencies('Initial Load');

// Debug logging for script load
console.log('[Planes] Script loading, initial state:', {
  API: window.API,
  GameState: window.GameState,
  timestamp: new Date().toISOString()
});

// More robust API wait function
const waitForAPI = (maxAttempts = 20, interval = 300) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const check = () => {
      console.log(`[API Check] Attempt ${attempts + 1}/${maxAttempts}:`, {
        hasAPI: !!window.API,
        hasPost: window.API && typeof window.API.post === 'function',
        hasGameState: !!window.GameState,
        timestamp: new Date().toISOString()
      });

      if (window.API && window.API.post && window.GameState) {
        console.log('[API Check] Dependencies found:', {
          API: window.API,
          GameState: window.GameState
        });
        resolve(window.API);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        console.error('[API Check] Dependencies missing after all attempts:', {
          hasAPI: !!window.API,
          hasPost: window.API && typeof window.API.post === 'function',
          hasGameState: !!window.GameState
        });
        reject(new Error('Required dependencies not initialized after maximum attempts'));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
};

// Initialize application with retries
const initializeApp = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[Init] Attempt ${i + 1}/${retries} to initialize app`);
      await waitForAPI();
      
      const root = document.getElementById('planesRoot');
      if (!root) {
        throw new Error('Root element not found');
      }

      console.log('[Init] Creating React root');
      const planesElement = React.createElement(Planes);
      ReactDOM.createRoot(root).render(planesElement);
      console.log('[Init] App successfully initialized');
      return;
    } catch (error) {
      console.error(`[Init] Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        const root = document.getElementById('planesRoot');
        if (root) {
          root.innerHTML = `
            <div class="p-4 bg-red-100 text-red-700 rounded">
              <p class="font-bold mb-2">Failed to initialize planes component</p>
              <p class="text-sm">Error: ${error.message}</p>
              <button 
                onclick="window.location.reload()"
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          `;
        }
      } else {
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Planes] DOMContentLoaded triggered');
    initializeApp();
  });
} else {
  console.log('[Planes] Document already loaded, initializing immediately');
  initializeApp();
}

// Constants
const DESTINATIONS = [
  { id: 'DXB', name: 'Dubai', duration: '2h 15m', points: 250 },
  { id: 'IST', name: 'Istanbul', duration: '1h 45m', points: 200 },
  { id: 'RUH', name: 'Riyadh', duration: '1h 30m', points: 150 },
  { id: 'CAI', name: 'Cairo', duration: '2h', points: 225 }
];

const REWARDS = [
  {
    id: 'new_plane',
    name: 'New Paper Plane',
    description: 'Add a new plane to your fleet',
    cost: 1000,
    icon: '✈️'
  },
  {
    id: 'speed_boost',
    name: 'Speed Boost',
    description: '20% faster flights for all planes',
    cost: 500,
    icon: '⚡'
  },
  {
    id: 'double_points',
    name: 'Double Points (24h)',
    description: 'Earn double points from all flights',
    cost: 750,
    icon: '✨'
  }
];

// Component Factories
const createTableHeader = () => {
  return React.createElement('thead', { className: 'bg-gray-50' },
    React.createElement('tr', null,
      ['Name', 'Status', 'Destination', 'Time Remaining', 'Stats', 'Actions'].map(text =>
        React.createElement('th', {
          key: text,
          className: 'px-6 py-3 text-left text-sm font-medium text-gray-500'
        }, text)
      )
    )
  );
};

const createPlaneRow = (plane, onDispatch, onRecall) => {
  return React.createElement('tr', { key: plane.id }, [
    React.createElement('td', {
      key: 'name',
      className: 'px-6 py-4 text-sm font-medium text-gray-900'
    }, plane.name),
    React.createElement('td', {
      key: 'status',
      className: 'px-6 py-4 text-sm text-gray-500'
    }, React.createElement('span', {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        plane.status === 'In Flight' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`
    }, plane.status)),
    React.createElement('td', {
      key: 'destination',
      className: 'px-6 py-4 text-sm text-gray-500'
    }, plane.destination),
    React.createElement('td', {
      key: 'time',
      className: 'px-6 py-4 text-sm text-gray-500'
    }, plane.timeRemaining),
    React.createElement('td', {
      key: 'stats',
      className: 'px-6 py-4 text-sm text-gray-500'
    }, [
      React.createElement('div', { key: 'flights' }, `Flights: ${plane.totalFlights}`),
      React.createElement('div', { key: 'points' }, `Points: ${plane.pointsEarned}`)
    ]),
    React.createElement('td', {
      key: 'actions',
      className: 'px-6 py-4 text-sm text-gray-500'
    }, plane.status === 'Ready' ?
      React.createElement('button', {
        className: 'text-blue-600 hover:text-blue-800',
        onClick: () => onDispatch(plane.id)
      }, 'Dispatch') :
      React.createElement('button', {
        className: 'text-orange-600 hover:text-orange-800',
        onClick: () => onRecall(plane.id)
      }, 'Recall')
    )
  ]);
};

const DispatchModal = ({ onClose, onDispatch, selectedPlane }) => {
  const [selectedDestination, setSelectedDestination] = React.useState('');
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'
  }, React.createElement('div', {
    className: 'bg-white p-6 rounded-lg max-w-md w-full'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: 'text-xl font-bold mb-4'
    }, 'Dispatch Plane'),
    React.createElement('select', {
      key: 'select',
      className: 'w-full p-2 border rounded mb-4',
      value: selectedDestination,
      onChange: (e) => setSelectedDestination(e.target.value)
    }, [
      React.createElement('option', {key:'default', value: '' }, 'Select Destination'),
      ...DESTINATIONS.map(dest =>
        React.createElement('option', {
          key: dest.id,
          value: dest.id
        }, `${dest.name} (${dest.duration}) - ${dest.points} points`)
      )
    ]),
    React.createElement('div', {
      key: 'buttons',
      className: 'flex justify-end space-x-2'
    }, [
      React.createElement('button', {
        key: 'cancel',
        onClick: onClose,
        className: 'px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
      }, 'Cancel'),
      React.createElement('button', {
        key: 'dispatch',
        disabled: !selectedDestination,
        className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50',
        onClick: () => selectedDestination && onDispatch(selectedPlane, selectedDestination)
      }, 'Dispatch')
    ])
  ]));
};

const RewardsModal = ({onClose, points, onPurchase, error}) => {
  const displayPoints = points || 0;  // Fallback handled in component

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'
  }, React.createElement('div', {
    className: 'bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex justify-between items-center mb-4'
    }, [
      React.createElement('h2', { className: 'text-xl font-bold' }, 'Paper Planes Shop'),
      React.createElement('div', { className: 'text-lg font-semibold text-blue-600' }, `${displayPoints} Points`)
    ]),
    React.createElement('div', {
      key: 'rewards',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'
    }, REWARDS.map(reward => 
      React.createElement('div', {
        key: reward.id,
        className: 'border rounded-lg p-4'
      }, [
        React.createElement('span', { className: 'text-2xl' }, reward.icon),
        React.createElement('h3', { className: 'text-lg font-semibold' }, reward.name),
        React.createElement('p', { className: 'text-sm text-gray-600 mb-2' }, reward.description),
        React.createElement('div', { className: 'flex justify-between items-center' }, [
          React.createElement('span', { className: 'text-sm text-gray-500' }, `${reward.cost} points`),
          React.createElement('button', {
            className: `px-3 py-1 rounded text-sm ${points >= reward.cost ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
            disabled: points < reward.cost,
            onClick: () => onPurchase(reward)
          }, 'Purchase')
        ])
      ])
    )),
    error && React.createElement('div', {
      key: 'error',
      className: 'mb-4 p-4 bg-red-100 text-red-600 rounded'
    }, error),
    React.createElement('button', {
      key: 'close',
      className: 'px-4 py-2 bg-gray-200 rounded hover:bg-gray-300',
      onClick: onClose
    }, 'Close')
  ]));
};

const Planes = () => {
  const [planes, setPlanes] = React.useState([{
    id: 1,
    name: 'Sky Dart',
    status: 'Ready',
    destination: '-',
    timeRemaining: '-',
    totalFlights: 0,
    pointsEarned: 0
  }]);
  const [selectedPlane, setSelectedPlane] = React.useState(null);
  const [isDispatchModalOpen, setDispatchModalOpen] = React.useState(false);
  const [isRewardsModalOpen, setRewardsModalOpen] = React.useState(false);
  const [gameState, setGameState] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Initialize component
  React.useEffect(() => {
    let mounted = true;
  
    const initialize = async () => {
      try {
        await waitForAPI();
        if (!mounted) return;
  
        // First try to initialize the user
        try {
          await window.API.post('init', {
            monthlyBudget: 5000,  // Default budget
            playerName: 'Player'   // Default name
          });
        } catch (initError) {
          console.log('User already initialized:', initError);
          // Ignore error as user might already be initialized
        }
  
        const currentState = window.GameState && window.GameState.getCurrentState && window.GameState.getCurrentState();
        if (currentState) {
          setGameState(currentState);
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
        if (mounted) {
          setError('Failed to initialize. Please refresh the page.');
        }
      }
    };
  
    initialize();
    return () => { mounted = false; };
  }, []);

  // Handle points and API interactions
  const updatePoints = async (pointsDelta, description) => {
    try {
      const api = window.API;
      if (!api || typeof api.post !== 'function') {
        throw new Error('API not properly initialized');
      }

      const response = await api.post('simulate', {
        amount: Math.abs(pointsDelta),
        category: 'planes',
        description
      });

      setGameState(response);
      if (window.GameState && typeof window.GameState.updateDashboard === 'function') {
        await window.GameState.updateDashboard(response);
      }
      return true;
    } catch (err) {
      console.error('Error updating points:', err);
      setError(err.message);
      return false;
    }
  };

  // Plane management functions
  const handleDispatch = async (planeId, destination) => {
    const destinationInfo = DESTINATIONS.find(d => d.id === destination);
    if (!destinationInfo) return;

    const success = await updatePoints(destinationInfo.points, `Flight to ${destinationInfo.name}`);
    
    if (success) {
      setPlanes(planes.map(plane => 
        plane.id === planeId ? {
          ...plane,
          status: 'In Flight',
          destination: destinationInfo.name,
          timeRemaining: destinationInfo.duration,
          totalFlights: plane.totalFlights + 1,
          pointsEarned: plane.pointsEarned + destinationInfo.points
        } : plane
      ));
      setDispatchModalOpen(false);
    }
  };

  const handleRecall = (planeId) => {
    setPlanes(planes.map(plane =>
      plane.id === planeId ? {
        ...plane,
        status: 'Ready',
        destination: '-',
        timeRemaining: '-'
      } : plane
    ));
  };

  // Reward management
  const handlePurchaseReward = async (reward) => {
    const currentPoints = gameState?.points || 0;
    
    if (currentPoints >= reward.cost) {
      const success = await updatePoints(-reward.cost, `Purchased ${reward.name}`);
      
      if (success && reward.id === 'new_plane') {
        const newPlane = {
          id: planes.length + 1,
          name: `Paper Jet ${planes.length + 1}`,
          status: 'Ready',
          destination: '-',
          timeRemaining: '-',
          totalFlights: 0,
          pointsEarned: 0
        };
        setPlanes([...planes, newPlane]);
      }
    }
  };

  // Main render
  return React.createElement('div', { className: 'p-6' }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'flex justify-between items-center mb-6'
    }, [
      React.createElement('h1', {
        key: 'title',
        className: 'text-2xl font-bold'
      }, 'Your Paper Planes'),
      React.createElement('button', {
        onClick: () => setRewardsModalOpen(true),
        className: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center'
      }, [
        React.createElement('span', { key: 'icon', className: 'mr-2' }, '🛒'),
        `Paper Plane Shop (${gameState?.points || 0} points)`
      ])
    ]),

    // Planes table
    React.createElement('div', {
      key: 'table',
      className: 'bg-white shadow-lg rounded-lg overflow-hidden'
    }, React.createElement('table', { className: 'w-full' }, [
      createTableHeader(),
      React.createElement('tbody', { className: 'divide-y divide-gray-200' },
        planes.map(plane => createPlaneRow(
          plane,
          (id) => {
            setSelectedPlane(id);
            setDispatchModalOpen(true);
          },
          handleRecall
        ))
      )
    ])),

    // Modals
    isDispatchModalOpen && React.createElement(DispatchModal, {
      key: 'dispatch-modal',	
      onClose: () => setDispatchModalOpen(false),
      onDispatch: handleDispatch,
      selectedPlane
    }),
    
    isRewardsModalOpen && React.createElement(RewardsModal,{
      key: 'rewards-modal',
      onClose: () => setRewardsModalOpen(false),
      points: gameState && gameState.points,
      onPurchase: handlePurchaseReward,
      error
    })
  ]);
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await waitForAPI();
    const root = document.getElementById('planesRoot');
    if (root) {
      const planesElement = React.createElement(Planes);
      ReactDOM.createRoot(root).render(planesElement);
    }
  } catch (error) {
    console.error('Failed to initialize Planes app:', error);
    const root = document.getElementById('planesRoot');
    if (root) {
      root.innerHTML = `
        <div class="p-4 bg-red-100 text-red-700 rounded">
          Failed to initialize planes component. Please refresh the page.
          Error: ${error.message}
        </div>
      `;
    }
  }
});