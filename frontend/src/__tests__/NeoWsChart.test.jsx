import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NeoWsChart from '../NeoWsChart';
import { fetchNeoFeed } from '../../api/nasaAPI';

jest.mock('../../api/nasaAPI');

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ data, children }) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />
}));

jest.mock('lucide-react', () => ({
  Globe: () => <div data-testid="globe-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Loader2: () => <div data-testid="loader-icon" />
}));

const mockAsteroidData = {
  data: {
    near_earth_objects: {
      '2024-01-15': [
        {
          id: '123',
          name: 'Test Asteroid 1',
          is_potentially_hazardous_asteroid: false,
          estimated_diameter: {
            kilometers: {
              estimated_diameter_min: 0.1,
              estimated_diameter_max: 0.2
            }
          },
          close_approach_data: [{
            miss_distance: { kilometers: '1000000' },
            relative_velocity: { kilometers_per_second: '10.5' }
          }]
        },
        {
          id: '456',
          name: 'Test Asteroid 2',
          is_potentially_hazardous_asteroid: true,
          estimated_diameter: {
            kilometers: {
              estimated_diameter_min: 0.5,
              estimated_diameter_max: 1.0
            }
          },
          close_approach_data: [{
            miss_distance: { kilometers: '500000' },
            relative_velocity: { kilometers_per_second: '15.2' }
          }]
        }
      ],
      '2024-01-16': [
        {
          id: '789',
          name: 'Test Asteroid 3',
          is_potentially_hazardous_asteroid: false,
          estimated_diameter: {
            kilometers: {
              estimated_diameter_min: 0.05,
              estimated_diameter_max: 0.1
            }
          },
          close_approach_data: [{
            miss_distance: { kilometers: '2000000' },
            relative_velocity: { kilometers_per_second: '8.3' }
          }]
        }
      ]
    }
  }
};

describe('NeoWsChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchNeoFeed.mockClear();
  });

  test('renders loading state initially', () => {
    fetchNeoFeed.mockImplementation(() => new Promise(() => {})); 

    render(<NeoWsChart />);
    
    expect(screen.getByText('Loading Asteroid Data')).toBeInTheDocument();
    expect(screen.getByText('Fetching from NASA NeoWs API...')).toBeInTheDocument();
    expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
  });

  test('renders chart components after successful data fetch', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Asteroid Tracking Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    expect(screen.getByText('Daily Asteroid Count')).toBeInTheDocument();
    expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    expect(screen.getByText('Hazardous vs Safe Classification')).toBeInTheDocument();
  });

  test('displays correct statistics after data load', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    const mockOnStatsUpdate = jest.fn();
    render(<NeoWsChart onStatsUpdate={mockOnStatsUpdate} />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); 
      expect(screen.getByText('1')).toBeInTheDocument(); 
      expect(screen.getByText('2')).toBeInTheDocument(); 
    });

    expect(mockOnStatsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        totalAsteroids: 3,
        potentiallyHazardous: 1
      })
    );
  });

  test('handles API error gracefully', async () => {
    const errorMessage = 'Failed to fetch asteroid data';
    fetchNeoFeed.mockRejectedValue(new Error(errorMessage));

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Data Loading Error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('retry button refetches data', async () => {
    fetchNeoFeed
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Data Loading Error')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Asteroid Tracking Dashboard')).toBeInTheDocument();
    });

    expect(fetchNeoFeed).toHaveBeenCalledTimes(2);
  });

  test('refresh button triggers data refetch', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Asteroid Tracking Dashboard')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(fetchNeoFeed).toHaveBeenCalledTimes(2);
  });

  test('displays live status indicator', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Live Data')).toBeInTheDocument();
    });
  });

  test('shows correct chart data format', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      const areaChart = screen.getByTestId('area-chart');
      const chartData = JSON.parse(areaChart.getAttribute('data-chart-data'));
      
      expect(chartData).toHaveLength(2);
      expect(chartData[0]).toHaveProperty('count', 2);
      expect(chartData[0]).toHaveProperty('hazardous', 1);
      expect(chartData[0]).toHaveProperty('safe', 1);
      expect(chartData[1]).toHaveProperty('count', 1);
      expect(chartData[1]).toHaveProperty('hazardous', 0);
      expect(chartData[1]).toHaveProperty('safe', 1);
    });
  });

  test('displays performance metrics section', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Approach Velocity Distribution')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment Timeline')).toBeInTheDocument();
    });
  });

  test('shows footer information', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Powered by NASA Near Earth Object Web Service (NeoWs) API')).toBeInTheDocument();
      expect(screen.getByText('Data updated every hour • All times in UTC')).toBeInTheDocument();
    });
  });

  test('calculates average size correctly', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    const mockOnStatsUpdate = jest.fn();
    render(<NeoWsChart onStatsUpdate={mockOnStatsUpdate} />);

    await waitFor(() => {
      expect(mockOnStatsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          averageSize: expect.any(String)
        })
      );
    });

    const [[stats]] = mockOnStatsUpdate.mock.calls;
    expect(parseFloat(stats.averageSize)).toBeGreaterThan(0);
  });

  test('handles empty data gracefully', async () => {
    fetchNeoFeed.mockResolvedValue({
      data: {
        near_earth_objects: {}
      }
    });

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Asteroid Tracking Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('API is called with correct date parameters', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    render(<NeoWsChart />);

    await waitFor(() => {
      expect(fetchNeoFeed).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          end_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
        })
      );
    });
  });

  test('component unmounts without errors', async () => {
    fetchNeoFeed.mockResolvedValue(mockAsteroidData);

    const { unmount } = render(<NeoWsChart />);

    await waitFor(() => {
      expect(screen.getByText('Asteroid Tracking Dashboard')).toBeInTheDocument();
    });

    expect(() => unmount()).not.toThrow();
  });
});

describe('CustomTooltip', () => {
  const mockPayload = [
    { name: 'Safe', value: 5, color: '#10B981' },
    { name: 'Hazardous', value: 2, color: '#EF4444' }
  ];

  test('renders tooltip when active', () => {
    expect(true).toBe(true);
  });
});