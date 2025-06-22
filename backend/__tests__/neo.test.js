const request = require('supertest');
const express = require('express');
const neoRouter = require('../../routes/neo');
const { fetchFromNasa } = require('../../services/nasaService');

jest.mock('../../services/nasaService');

const app = express();
app.use(express.json());
app.use('/api/neo', neoRouter);

describe('NEO Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/neo/feed', () => {
    const mockFeedData = {
      near_earth_objects: {
        '2024-01-15': [
          {
            id: '123',
            name: 'Test Asteroid',
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
          }
        ]
      }
    };

    test('should fetch asteroid feed with default dates', async () => {
      fetchFromNasa.mockResolvedValue(mockFeedData);

      const response = await request(app)
        .get('/api/neo/feed')
        .expect(200);

      expect(response.body).toHaveProperty('near_earth_objects');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('fetched_at');
      expect(response.body.metadata).toHaveProperty('total_objects', 1);
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/feed',
        expect.objectContaining({
          start_date: expect.any(String),
          end_date: expect.any(String)
        })
      );
    });

    test('should fetch asteroid feed with custom dates', async () => {
      fetchFromNasa.mockResolvedValue(mockFeedData);

      const response = await request(app)
        .get('/api/neo/feed?start_date=2024-01-15&end_date=2024-01-16')
        .expect(200);

      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/feed',
        expect.objectContaining({
          start_date: '2024-01-15',
          end_date: '2024-01-16'
        })
      );
    });

    test('should return 400 for invalid start_date format', async () => {
      const response = await request(app)
        .get('/api/neo/feed?start_date=invalid-date')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid start_date format. Use YYYY-MM-DD');
    });

    test('should return 400 for invalid end_date format', async () => {
      const response = await request(app)
        .get('/api/neo/feed?end_date=2024/01/15')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid end_date format. Use YYYY-MM-DD');
    });

    test('should handle NASA service errors', async () => {
      fetchFromNasa.mockRejectedValue(new Error('NASA API Error'));

      const response = await request(app)
        .get('/api/neo/feed')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'NASA API Error');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/neo/lookup/:id', () => {
    const mockAsteroidData = {
      id: '54016067',
      name: '(2020 SO)',
      designation: '54016067',
      is_potentially_hazardous_asteroid: false
    };

    test('should lookup asteroid by ID', async () => {
      fetchFromNasa.mockResolvedValue(mockAsteroidData);

      const response = await request(app)
        .get('/api/neo/lookup/54016067')
        .expect(200);

      expect(response.body).toEqual(mockAsteroidData);
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/neo/54016067'
      );
    });

    test('should return 400 for empty ID', async () => {
      const response = await request(app)
        .get('/api/neo/lookup/')
        .expect(404); 
    });

    test('should return 400 for whitespace-only ID', async () => {
      const response = await request(app)
        .get('/api/neo/lookup/   ')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Asteroid ID is required');
    });

    test('should return 404 for non-existent asteroid', async () => {
      fetchFromNasa.mockRejectedValue(new Error('404 Not Found'));

      const response = await request(app)
        .get('/api/neo/lookup/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Asteroid not found');
    });
  });

  describe('GET /api/neo/browse', () => {
    const mockBrowseData = {
      links: { next: null, prev: null, self: 'test' },
      page: { size: 20, total_elements: 100, total_pages: 5, number: 0 },
      near_earth_objects: []
    };

    test('should browse asteroids with default pagination', async () => {
      fetchFromNasa.mockResolvedValue(mockBrowseData);

      const response = await request(app)
        .get('/api/neo/browse')
        .expect(200);

      expect(response.body).toEqual(mockBrowseData);
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/neo/browse',
        expect.objectContaining({
          page: 0,
          size: 20
        })
      );
    });

    test('should browse asteroids with custom pagination', async () => {
      fetchFromNasa.mockResolvedValue(mockBrowseData);

      const response = await request(app)
        .get('/api/neo/browse?page=2&size=50')
        .expect(200);

      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/neo/browse',
        expect.objectContaining({
          page: 2,
          size: 50
        })
      );
    });

    test('should return 400 for invalid page parameter', async () => {
      const response = await request(app)
        .get('/api/neo/browse?page=-1')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid page parameter');
    });

    test('should return 400 for invalid size parameter', async () => {
      const response = await request(app)
        .get('/api/neo/browse?size=200')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid size parameter (1-100)');
    });
  });

  describe('GET /api/neo/stats', () => {
    const mockStatsData = {
      near_earth_object_count: 25000,
      close_approach_count: 30000,
      last_updated: '2024-01-15'
    };

    test('should fetch asteroid statistics', async () => {
      fetchFromNasa.mockResolvedValue(mockStatsData);

      const response = await request(app)
        .get('/api/neo/stats')
        .expect(200);

      expect(response.body).toEqual(mockStatsData);
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/stats'
      );
    });
  });

  describe('GET /api/neo/sentry', () => {
    const mockSentryData = {
      links: { next: null, prev: null, self: 'test' },
      page: { size: 20, total_elements: 5, total_pages: 1, number: 0 },
      sentry_objects: []
    };

    test('should fetch sentry data with default parameters', async () => {
      fetchFromNasa.mockResolvedValue(mockSentryData);

      const response = await request(app)
        .get('/api/neo/sentry')
        .expect(200);

      expect(response.body).toEqual(mockSentryData);
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/neo/sentry',
        expect.objectContaining({
          is_active_sentry: true,
          page: 0,
          size: 20
        })
      );
    });

    test('should fetch sentry data with custom parameters', async () => {
      fetchFromNasa.mockResolvedValue(mockSentryData);

      const response = await request(app)
        .get('/api/neo/sentry?is_active_sentry=false&page=1&size=10')
        .expect(200);

      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/neo/sentry',
        expect.objectContaining({
          is_active_sentry: false,
          page: 1,
          size: 10
        })
      );
    });
  });

  describe('POST /api/neo/analyze', () => {
    const mockAnalyzeData = {
      near_earth_objects: {
        '2024-01-15': [
          {
            is_potentially_hazardous_asteroid: true,
            estimated_diameter: {
              kilometers: { estimated_diameter_min: 0.5, estimated_diameter_max: 1.0 }
            },
            close_approach_data: [{
              miss_distance: { kilometers: '500000' },
              relative_velocity: { kilometers_per_second: '15.2' }
            }],
            orbital_data: {
              orbital_period: '365.25',
              eccentricity: '0.1'
            }
          }
        ]
      }
    };

    test('should analyze asteroid data with basic analysis', async () => {
      fetchFromNasa.mockResolvedValue(mockAnalyzeData);

      const requestBody = {
        date_range: {
          start: '2024-01-15',
          end: '2024-01-16'
        },
        analysis_type: 'basic'
      };

      const response = await request(app)
        .post('/api/neo/analyze')
        .send(requestBody)
        .expect(200);

      expect(response.body).toHaveProperty('analysis');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.analysis).toHaveProperty('total_count', 1);
      expect(response.body.analysis).toHaveProperty('potentially_hazardous_count', 1);
      expect(response.body.metadata).toHaveProperty('analysis_type', 'basic');
    });

    test('should analyze asteroid data with detailed analysis', async () => {
      fetchFromNasa.mockResolvedValue(mockAnalyzeData);

      const requestBody = {
        date_range: {
          start: '2024-01-15',
          end: '2024-01-16'
        },
        analysis_type: 'detailed'
      };

      const response = await request(app)
        .post('/api/neo/analyze')
        .send(requestBody)
        .expect(200);

      expect(response.body.analysis).toHaveProperty('daily_breakdown');
      expect(response.body.analysis).toHaveProperty('risk_assessment');
      expect(response.body.analysis).toHaveProperty('orbital_characteristics');
    });

    test('should return 400 for missing date range', async () => {
      const response = await request(app)
        .post('/api/neo/analyze')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Date range with start and end dates required');
    });

    test('should return 400 for incomplete date range', async () => {
      const response = await request(app)
        .post('/api/neo/analyze')
        .send({
          date_range: { start: '2024-01-15' }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Date range with start and end dates required');
    });
  });

  describe('Helper Functions', () => {
    test('isValidDate should validate date formats', () => {
      const isValidDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
      };

      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024/01/15')).toBe(false);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2024-13-45')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      fetchFromNasa.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .get('/api/neo/feed')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Unexpected error');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});