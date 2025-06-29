const request = require('supertest');
const express = require('express');
const nock = require('nock');

const mockNasaService = {
  getEonetEvents: jest.fn(),
  getEonetCategories: jest.fn(),
  getEonetSources: jest.fn(),
  getEonetEvent: jest.fn()
};

jest.mock('../services/nasaService', () => ({
  nasaService: mockNasaService
}));

const router = require('../routes/eonet'); 

const app = express();
app.use(express.json());
app.use('/api/nasa', router);

describe('NASA EONET API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('GET /api/nasa/events', () => {
    const mockEventsResponse = {
      title: 'EONET Events',
      description: 'Natural events from EONET',
      link: 'https://eonet.gsfc.nasa.gov/api/v3/events',
      events: [
        {
          id: 'EONET_1234',
          title: 'Test Wildfire',
          description: 'A test wildfire event',
          link: 'https://example.com/event/1234',
          categories: [
            {
              id: 8,
              title: 'Wildfires'
            }
          ],
          sources: [
            {
              id: 'InciWeb',
              url: 'https://example.com/source'
            }
          ],
          geometry: [
            {
              magnitudeValue: null,
              magnitudeUnit: null,
              date: '2024-01-15T12:00:00Z',
              type: 'Point',
              coordinates: [-120.5, 35.6]
            }
          ],
          date: '2024-01-15T12:00:00Z',
          closed: null
        }
      ]
    };

    it('should return processed events with default parameters', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockEventsResponse);

      const response = await request(app)
        .get('/api/nasa/events')
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0]).toHaveProperty('latestGeometry');
      expect(response.body.events[0]).toHaveProperty('isActive', true);
      expect(response.body.events[0]).toHaveProperty('formattedDate');
      expect(response.body.events[0]).toHaveProperty('coordinates');
      expect(mockNasaService.getEonetEvents).toHaveBeenCalledWith(expect.any(URLSearchParams));
    });

    it('should handle query parameters correctly', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockEventsResponse);

      await request(app)
        .get('/api/nasa/events?status=open&limit=50&days=10&source=InciWeb&category=wildfires')
        .expect(200);

      const callArgs = mockNasaService.getEonetEvents.mock.calls[0][0];
      expect(callArgs.get('status')).toBe('open');
      expect(callArgs.get('limit')).toBe('50');
      expect(callArgs.get('days')).toBe('10');
      expect(callArgs.get('source')).toBe('InciWeb');
      expect(callArgs.get('category')).toBe('wildfires');
    });

    it('should limit parameters to maximum values', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockEventsResponse);

      await request(app)
        .get('/api/nasa/events?limit=1000&days=500')
        .expect(200);

      const callArgs = mockNasaService.getEonetEvents.mock.calls[0][0];
      expect(callArgs.get('limit')).toBe('500');
      expect(callArgs.get('days')).toBe('365');
    });

    it('should filter out invalid category values', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockEventsResponse);

      await request(app)
        .get('/api/nasa/events?category=all')
        .expect(200);

      const callArgs = mockNasaService.getEonetEvents.mock.calls[0][0];
      expect(callArgs.has('category')).toBe(false);

      await request(app)
        .get('/api/nasa/events?category=undefined')
        .expect(200);

      const callArgs2 = mockNasaService.getEonetEvents.mock.calls[1][0];
      expect(callArgs2.has('category')).toBe(false);
    });

    it('should handle API errors with proper status codes', async () => {
      const apiError = new Error('API Error');
      apiError.response = {
        status: 503,
        data: { message: 'Service Unavailable' }
      };
      mockNasaService.getEonetEvents.mockRejectedValue(apiError);

      const response = await request(app)
        .get('/api/nasa/events')
        .expect(503);

      expect(response.body).toHaveProperty('error', 'NASA EONET API error');
      expect(response.body).toHaveProperty('details');
    });

    it('should handle generic errors', async () => {
      mockNasaService.getEonetEvents.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/api/nasa/events')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch natural events');
      expect(response.body).toHaveProperty('details', 'Network error');
    });
  });

  describe('GET /api/nasa/categories', () => {
    const mockCategoriesResponse = {
      title: 'EONET Categories',
      description: 'List of event categories',
      categories: [
        {
          id: 6,
          title: 'Drought',
          link: 'https://eonet.gsfc.nasa.gov/api/v3/categories/6',
          description: 'Drought events'
        },
        {
          id: 8,
          title: 'Wildfires',
          link: 'https://eonet.gsfc.nasa.gov/api/v3/categories/8',
          description: 'Wildfire events'
        }
      ]
    };

    it('should return categories successfully', async () => {
      mockNasaService.getEonetCategories.mockResolvedValue(mockCategoriesResponse);

      const response = await request(app)
        .get('/api/nasa/categories')
        .expect(200);

      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body.categories).toHaveLength(2);
      expect(mockNasaService.getEonetCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      apiError.response = { status: 404, data: 'Not Found' };
      mockNasaService.getEonetCategories.mockRejectedValue(apiError);

      const response = await request(app)
        .get('/api/nasa/categories')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'NASA EONET API error');
    });
  });

  describe('GET /api/nasa/sources', () => {
    const mockSourcesResponse = {
      title: 'EONET Sources',
      description: 'List of data sources',
      sources: [
        {
          id: 'InciWeb',
          title: 'InciWeb',
          source: 'https://inciweb.nwcg.gov/',
          link: 'https://eonet.gsfc.nasa.gov/api/v3/sources/InciWeb'
        }
      ]
    };

    it('should return sources successfully', async () => {
      mockNasaService.getEonetSources.mockResolvedValue(mockSourcesResponse);

      const response = await request(app)
        .get('/api/nasa/sources')
        .expect(200);

      expect(response.body).toHaveProperty('sources');
      expect(response.body.sources).toHaveLength(1);
      expect(mockNasaService.getEonetSources).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/nasa/events/:id', () => {
    const mockEventResponse = {
      id: 'EONET_1234',
      title: 'Test Event',
      description: 'A test event',
      link: 'https://example.com/event/1234',
      categories: [{ id: 8, title: 'Wildfires' }],
      sources: [{ id: 'InciWeb', url: 'https://example.com' }],
      geometry: [
        {
          magnitudeValue: null,
          magnitudeUnit: null,
          date: '2024-01-15T12:00:00Z',
          type: 'Point',
          coordinates: [-120.5, 35.6]
        }
      ],
      date: '2024-01-15T12:00:00Z',
      closed: '2024-01-20T12:00:00Z'
    };

    it('should return processed event details', async () => {
      mockNasaService.getEonetEvent.mockResolvedValue(mockEventResponse);

      const response = await request(app)
        .get('/api/nasa/events/EONET_1234')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'EONET_1234');
      expect(response.body).toHaveProperty('latestGeometry');
      expect(response.body).toHaveProperty('totalGeometries', 1);
      expect(response.body).toHaveProperty('isActive', false);
      expect(response.body).toHaveProperty('geometryTimeline');
      expect(response.body).toHaveProperty('formattedDate');
      expect(response.body).toHaveProperty('formattedClosed');
      expect(mockNasaService.getEonetEvent).toHaveBeenCalledWith('EONET_1234');
    });

    it('should handle 404 event not found', async () => {
      const notFoundError = new Error('Not Found');
      notFoundError.response = { status: 404 };
      mockNasaService.getEonetEvent.mockRejectedValue(notFoundError);

      const response = await request(app)
        .get('/api/nasa/events/NONEXISTENT')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
      expect(response.body.details).toContain('NONEXISTENT');
    });
  });

  describe('GET /api/nasa/categories/:categoryId/events', () => {
    const mockCategoryEventsResponse = {
      events: [
        {
          id: 'EONET_5678',
          title: 'Category Event',
          categories: [{ id: 8, title: 'Wildfires' }],
          geometry: [
            {
              date: '2024-01-16T12:00:00Z',
              type: 'Point',
              coordinates: [-121.0, 36.0]
            }
          ],
          date: '2024-01-16T12:00:00Z',
          closed: null
        }
      ]
    };

    it('should return events for a specific category', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockCategoryEventsResponse);

      const response = await request(app)
        .get('/api/nasa/categories/8/events')
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(response.body.events).toHaveLength(1);
      
      const callArgs = mockNasaService.getEonetEvents.mock.calls[0][0];
      expect(callArgs.get('category')).toBe('8');
    });

    it('should handle string category IDs', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockCategoryEventsResponse);

      await request(app)
        .get('/api/nasa/categories/wildfires/events')
        .expect(200);

      const callArgs = mockNasaService.getEonetEvents.mock.calls[0][0];
      expect(callArgs.get('category')).toBe('wildfires');
    });

    it('should handle query parameters', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockCategoryEventsResponse);

      await request(app)
        .get('/api/nasa/categories/8/events?status=open&limit=25&days=15')
        .expect(200);

      const callArgs = mockNasaService.getEonetEvents.mock.calls[0][0];
      expect(callArgs.get('category')).toBe('8');
      expect(callArgs.get('status')).toBe('open');
      expect(callArgs.get('limit')).toBe('25');
      expect(callArgs.get('days')).toBe('15');
    });
  });

  describe('GET /api/nasa/stats', () => {
    const mockStatsEventsResponse = {
      events: [
        {
          id: 'EONET_1',
          categories: [{ id: 8, title: 'Wildfires' }],
          sources: [{ id: 'InciWeb' }],
          closed: null
        },
        {
          id: 'EONET_2',
          categories: [{ id: 6, title: 'Drought' }],
          sources: [{ id: 'USGS' }],
          closed: '2024-01-20T12:00:00Z'
        },
        {
          id: 'EONET_3',
          categories: [{ id: 8, title: 'Wildfires' }],
          sources: [{ id: 'InciWeb' }],
          closed: null
        }
      ]
    };

    it('should return statistics with default parameters', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockStatsEventsResponse);

      const response = await request(app)
        .get('/api/nasa/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalEvents', 3);
      expect(response.body).toHaveProperty('activeEvents', 2);
      expect(response.body).toHaveProperty('closedEvents', 1);
      expect(response.body).toHaveProperty('categoriesCount');
      expect(response.body).toHaveProperty('sourcesCount');
      expect(response.body).toHaveProperty('timeRange');
      expect(response.body).toHaveProperty('lastUpdated');

      expect(response.body.categoriesCount).toEqual({
        'Wildfires': 2,
        'Drought': 1
      });

      expect(response.body.sourcesCount).toEqual({
        'InciWeb': 2,
        'USGS': 1
      });
    });

    it('should handle custom parameters', async () => {
      mockNasaService.getEonetEvents.mockResolvedValue(mockStatsEventsResponse);

      await request(app)
        .get('/api/nasa/stats?days=60&category=8&status=open')
        .expect(200);

      const callArgs = mockNasaService.getEonetEvents.mock.calls[0][0];
      expect(callArgs.get('days')).toBe('60');
      expect(callArgs.get('category')).toBe('8');
      expect(callArgs.get('status')).toBe('open');
      expect(callArgs.get('limit')).toBe('500');
    });

    it('should handle errors in statistics generation', async () => {
      mockNasaService.getEonetEvents.mockRejectedValue(new Error('Stats error'));

      const response = await request(app)
        .get('/api/nasa/stats')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to generate statistics');
      expect(response.body).toHaveProperty('details', 'Stats error');
    });
  });

  describe('GET /api/nasa/health', () => {
    it('should return health check information', async () => {
      const response = await request(app)
        .get('/api/nasa/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('service', 'NASA EONET Natural Events API');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
      expect(response.body.endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle events with no geometry', async () => {
      const eventsWithNoGeometry = {
        events: [
          {
            id: 'EONET_NO_GEO',
            title: 'No Geometry Event',
            date: '2024-01-15T12:00:00Z',
            closed: null,
            geometry: []
          }
        ]
      };

      mockNasaService.getEonetEvents.mockResolvedValue(eventsWithNoGeometry);

      const response = await request(app)
        .get('/api/nasa/events')
        .expect(200);

      expect(response.body.events[0]).toHaveProperty('latestGeometry', null);
      expect(response.body.events[0]).toHaveProperty('totalGeometries', 0);
      expect(response.body.events[0]).toHaveProperty('coordinates', []);
    });

    it('should handle events with missing categories or sources', async () => {
      const eventsWithMissingData = {
        events: [
          {
            id: 'EONET_MISSING',
            title: 'Missing Data Event',
            date: '2024-01-15T12:00:00Z',
            closed: null
          }
        ]
      };

      mockNasaService.getEonetEvents.mockResolvedValue(eventsWithMissingData);

      const response = await request(app)
        .get('/api/nasa/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalEvents', 1);
      expect(response.body).toHaveProperty('categoriesCount', {});
      expect(response.body).toHaveProperty('sourcesCount', {});
    });
  });
});