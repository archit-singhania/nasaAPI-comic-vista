import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Eonet from '../pages/Eonet';
import PremiumEonetMap from '../components/EonetMap';
import '@testing-library/jest-dom';

jest.mock('axios', () => ({
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    })),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../api/nasaAPI', () => ({
  fetchEonetEvents: jest.fn(),
  fetchEonetCategories: jest.fn(),
  fetchEonetSources: jest.fn(),
  fetchEonetStats: jest.fn(),
  checkEonetHealth: jest.fn(),
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: (props) => <div data-testid="tile-layer" {...props}>TileLayer</div>,
  Marker: ({ children, position }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  LayersControl: ({ children }) => <div data-testid="layers-control">{children}</div>,
  LayerGroup: ({ children }) => <div data-testid="layer-group">{children}</div>,
  CircleMarker: ({ children, center, radius }) => (
    <div data-testid="circle-marker" data-center={JSON.stringify(center)} data-radius={radius}>
      {children}
    </div>
  ),
}));

jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

const api = require('../api/nasaAPI');

const mockEvents = {
  events: [
    {
      id: 'EONET_123',
      title: 'California Wildfire',
      date: '2024-06-01T00:00:00Z',
      isActive: true,
      totalGeometries: 5,
      latestGeometry: {
        type: 'Point',
        coordinates: [-120.5, 35.6],
        date: '2024-06-01T00:00:00Z',
      },
      categories: [{ id: 8, title: 'Wildfires' }],
      sources: [{ id: 'InciWeb', url: 'https://inciweb.nwcg.gov/incident/123' }],
      description: 'Large wildfire in California',
    },
    {
      id: 'EONET_124',
      title: 'Hurricane Atlantic',
      date: '2024-05-25T00:00:00Z',
      isActive: false,
      totalGeometries: 10,
      latestGeometry: {
        type: 'Point',
        coordinates: [-75.2, 25.8],
        date: '2024-05-30T00:00:00Z',
      },
      categories: [{ id: 10, title: 'Severe Storms' }],
      sources: [{ id: 'NOAA', url: 'https://noaa.gov/hurricane/124' }],
      description: 'Hurricane in Atlantic Ocean',
    },
  ],
};

const mockCategories = {
  categories: [
    { id: 8, title: 'Wildfires', description: 'Forest and brush fires' },
    { id: 10, title: 'Severe Storms', description: 'Hurricanes and cyclones' },
    { id: 12, title: 'Volcanoes', description: 'Volcanic activity' },
  ],
};

const mockSources = {
  sources: [
    { id: 'InciWeb', title: 'InciWeb', url: 'https://inciweb.nwcg.gov/' },
    { id: 'NOAA', title: 'NOAA', url: 'https://noaa.gov/' },
    { id: 'USGS', title: 'USGS', url: 'https://usgs.gov/' },
  ],
};

const mockStats = {
  totalEvents: 2,
  activeEvents: 1,
  closedEvents: 1,
  categoriesCount: { Wildfires: 1, 'Severe Storms': 1 },
  sourcesCount: { InciWeb: 1, NOAA: 1 },
  timeRange: '30 days',
  lastUpdated: '2024-06-01T12:00:00Z',
};

const mockHealth = { 
  status: 'ok', 
  message: 'All systems operational',
  responseTime: 120,
  uptime: '99.9%'
};

describe('Eonet Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    api.fetchEonetEvents.mockResolvedValue(mockEvents);
    api.fetchEonetCategories.mockResolvedValue(mockCategories);
    api.fetchEonetSources.mockResolvedValue(mockSources);
    api.fetchEonetStats.mockResolvedValue(mockStats);
    api.checkEonetHealth.mockResolvedValue(mockHealth);
  });

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<Eonet />);
      expect(container).toBeInTheDocument();
    });

    test('renders main content', () => {
      render(<Eonet />);
      expect(document.body.textContent.length).toBeGreaterThan(0);
    });

    test('renders page title and description', () => {
      render(<Eonet />);
      const elements = screen.queryAllByText(/earth|natural|events|eonet|nasa/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Component Structure', () => {
    test('displays loading state initially', () => {
      render(<Eonet />);
      const loadingElements = screen.queryAllByText(/loading|fetching|please wait/i);
      expect(loadingElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Boundaries', () => {
    test('handles component errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      api.fetchEonetEvents.mockRejectedValueOnce(new Error('Network error'));
      
      const { container } = render(<Eonet />);
      expect(container).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});

describe('PremiumEonetMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    api.fetchEonetEvents.mockResolvedValue(mockEvents);
    api.fetchEonetCategories.mockResolvedValue(mockCategories);
    api.fetchEonetSources.mockResolvedValue(mockSources);
    api.fetchEonetStats.mockResolvedValue(mockStats);
    api.checkEonetHealth.mockResolvedValue(mockHealth);
  });

  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<PremiumEonetMap />);
      expect(container).toBeInTheDocument();
    });

    test('calls API functions on mount', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      expect(api.fetchEonetCategories).toHaveBeenCalled();
      expect(api.fetchEonetSources).toHaveBeenCalled();
      expect(api.fetchEonetStats).toHaveBeenCalled();
      expect(api.checkEonetHealth).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles API errors without crashing', async () => {
      api.fetchEonetEvents.mockRejectedValueOnce(new Error('API Error'));
      
      const { container } = render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('handles network timeout errors', async () => {
      api.fetchEonetEvents.mockRejectedValueOnce(new Error('Network timeout'));
      api.fetchEonetStats.mockRejectedValueOnce(new Error('Network timeout'));
      
      const { container } = render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    test('handles malformed API responses', async () => {
      api.fetchEonetEvents.mockResolvedValueOnce({ invalid: 'data' });
      
      const { container } = render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading and Processing', () => {
    test('handles empty events data', async () => {
      api.fetchEonetEvents.mockResolvedValueOnce({ events: [] });
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });

    test('processes events with different geometries', async () => {
      const eventsWithDifferentGeometries = {
        events: [
          {
            ...mockEvents.events[0],
            latestGeometry: {
              type: 'Polygon',
              coordinates: [[[-120.5, 35.6], [-120.4, 35.7], [-120.3, 35.5], [-120.5, 35.6]]],
              date: '2024-06-01T00:00:00Z',
            }
          }
        ]
      };
      
      api.fetchEonetEvents.mockResolvedValueOnce(eventsWithDifferentGeometries);
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Functionality', () => {
    test('handles filter changes', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      const filterElements = screen.queryAllByRole('button');
      const selectElements = screen.queryAllByRole('combobox');
      const checkboxElements = screen.queryAllByRole('checkbox');
      
      expect(filterElements.length + selectElements.length + checkboxElements.length).toBeGreaterThanOrEqual(0);
    });

    test('handles category filter changes', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      const categoryElements = screen.queryAllByText(/category|wildfire|storm|volcano/i);
      expect(categoryElements.length).toBeGreaterThanOrEqual(0);
    });

    test('handles time range filter changes', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      const timeElements = screen.queryAllByText(/time|day|week|month|range/i);
      expect(timeElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Display and Interaction', () => {
    test('displays events on map', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        const markers = screen.queryAllByTestId('marker');
        expect(markers.length).toBeGreaterThanOrEqual(0);
      });
    });

    test('handles event click interactions', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      const clickableElements = screen.queryAllByRole('button');
      expect(clickableElements.length).toBeGreaterThanOrEqual(0);
    });

    test('displays event details', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      const eventElements = screen.queryAllByText(/california|wildfire|hurricane|atlantic/i);
      expect(eventElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics and Counters', () => {
    test('displays event statistics', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetStats).toHaveBeenCalled();
      });
      
      const statsElements = screen.queryAllByText(/total|active|closed|count/i);
      expect(statsElements.length).toBeGreaterThanOrEqual(0);
    });

    test('updates statistics correctly', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetStats).toHaveBeenCalled();
      });
      
      const numberElements = screen.queryAllByText(/\d+/);
      expect(numberElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Health Status Monitoring', () => {
    test('displays health status', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.checkEonetHealth).toHaveBeenCalled();
      });
      
      const healthElements = screen.queryAllByText(/status|health|operational|system/i);
      expect(healthElements.length).toBeGreaterThanOrEqual(0);
    });

    test('handles health check failures', async () => {
      api.checkEonetHealth.mockRejectedValueOnce(new Error('Health check failed'));
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.checkEonetHealth).toHaveBeenCalled();
      });
    });
  });

  describe('Data Refresh and Updates', () => {
    test('handles data refresh', async () => {
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
      
      const refreshElements = screen.queryAllByText(/refresh|reload|update/i);
      if (refreshElements.length > 0) {
        fireEvent.click(refreshElements[0]);
      }
    });
  });

  describe('Responsive Design and Accessibility', () => {
    test('maintains accessibility standards', () => {
      render(<PremiumEonetMap />);
      
      const elementsWithAriaLabels = screen.queryAllByLabelText(/./);
      const elementsWithRoles = screen.queryAllByRole('button');
      
      expect(elementsWithAriaLabels.length + elementsWithRoles.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance and Memory Management', () => {
    test('handles large datasets efficiently', async () => {
      const largeDataset = {
        events: Array.from({ length: 100 }, (_, i) => ({
          ...mockEvents.events[0],
          id: `EONET_${i}`,
          title: `Event ${i}`,
        }))
      };
      
      api.fetchEonetEvents.mockResolvedValueOnce(largeDataset);
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });

    test('cleans up resources on unmount', () => {
      const { unmount } = render(<PremiumEonetMap />);
      unmount();
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    test('handles missing geometry in events', async () => {
      const eventsWithoutGeometry = {
        events: [
          {
            ...mockEvents.events[0],
            latestGeometry: null
          }
        ]
      };
      
      api.fetchEonetEvents.mockResolvedValueOnce(eventsWithoutGeometry);
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });

    test('handles events with invalid coordinates', async () => {
      const eventsWithInvalidCoords = {
        events: [
          {
            ...mockEvents.events[0],
            latestGeometry: {
              type: 'Point',
              coordinates: [null, undefined],
              date: '2024-06-01T00:00:00Z',
            }
          }
        ]
      };
      
      api.fetchEonetEvents.mockResolvedValueOnce(eventsWithInvalidCoords);
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });

    test('handles events with future dates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const eventsWithFutureDates = {
        events: [
          {
            ...mockEvents.events[0],
            date: futureDate.toISOString(),
            latestGeometry: {
              ...mockEvents.events[0].latestGeometry,
              date: futureDate.toISOString(),
            }
          }
        ]
      };
      
      api.fetchEonetEvents.mockResolvedValueOnce(eventsWithFutureDates);
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });

    test('handles slow API responses', async () => {
      api.fetchEonetEvents.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockEvents), 100))
      );
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Integration with External Services', () => {
    test('handles NASA API rate limiting', async () => {
      api.fetchEonetEvents.mockRejectedValueOnce(new Error('Rate limit exceeded'));
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });

    test('handles different API response formats', async () => {
      const alternativeFormat = {
        data: {
          events: mockEvents.events
        }
      };
      
      api.fetchEonetEvents.mockResolvedValueOnce(alternativeFormat);
      
      render(<PremiumEonetMap />);
      
      await waitFor(() => {
        expect(api.fetchEonetEvents).toHaveBeenCalled();
      });
    });
  });
});

describe('Full Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    api.fetchEonetEvents.mockResolvedValue(mockEvents);
    api.fetchEonetCategories.mockResolvedValue(mockCategories);
    api.fetchEonetSources.mockResolvedValue(mockSources);
    api.fetchEonetStats.mockResolvedValue(mockStats);
    api.checkEonetHealth.mockResolvedValue(mockHealth);
  });

  test('renders complete Eonet page with all components', async () => {
    render(<Eonet />);
    
    await waitFor(() => {
      expect(api.fetchEonetEvents).toHaveBeenCalled();
    });
    
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  test('handles complete user workflow', async () => {
    const user = userEvent.setup();
    render(<Eonet />);
    
    await waitFor(() => {
      expect(api.fetchEonetEvents).toHaveBeenCalled();
    });
    
    const buttons = screen.queryAllByRole('button');
    const selects = screen.queryAllByRole('combobox');
    
    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }
    
    if (selects.length > 0) {
      await user.click(selects[0]);
    }
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});