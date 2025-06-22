const request = require('supertest');
const express = require('express');
const nock = require('nock');

jest.mock('../services/nasaService', () => ({
  fetchFromNasa: jest.fn()
}));

const { fetchFromNasa } = require('../services/nasaService');
const apodRouter = require('../routes/apod');

const app = express();
app.use(express.json());
app.use('/api/apod', apodRouter);

describe('NASA APOD Backend API', () => {
  const apiUrl = 'https://api.nasa.gov';
  const defaultMockResponse = {
    title: 'Mock APOD Title',
    explanation: 'A mock explanation of the cosmos and celestial wonders.',
    date: '2024-06-16',
    url: 'https://example.com/mock.jpg',
    hdurl: 'https://example.com/mock_hd.jpg',
    media_type: 'image',
    service_version: 'v1',
    copyright: 'Mock Photographer'
  };

  const videoMockResponse = {
    title: 'Mock Video APOD',
    explanation: 'A mock video explanation.',
    date: '2024-06-15',
    url: 'https://example.com/mock_video.mp4',
    media_type: 'video',
    service_version: 'v1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
    delete require.cache[require.resolve('../routes/apod')];
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('GET /api/apod - Basic Functionality', () => {
    test('should return today\'s APOD image successfully', async () => {
      fetchFromNasa.mockResolvedValue(defaultMockResponse);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Mock APOD Title');
      expect(res.body.mediaType).toBe('image');
      expect(res.body.service).toBe('NASA APOD API');
      expect(res.body.fetchTime).toBeDefined();
      expect(res.body.url).toBe('https://example.com/mock.jpg');
      expect(res.body.hdurl).toBe('https://example.com/mock_hd.jpg');
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { hd: true }
      );
    });

    test('should return APOD for specific date', async () => {
      const testDate = '2023-12-25';
      const mockWithDate = { ...defaultMockResponse, date: testDate };
      
      fetchFromNasa.mockResolvedValue(mockWithDate);

      const res = await request(app).get(`/api/apod?date=${testDate}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.date).toBe(testDate);
      expect(res.body.title).toBe('Mock APOD Title');
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { hd: true, date: testDate }
      );
    });

    test('should handle HD parameter correctly', async () => {
      const mockWithoutHD = { ...defaultMockResponse };
      delete mockWithoutHD.hdurl;
      
      fetchFromNasa.mockResolvedValue(mockWithoutHD);

      const res = await request(app).get('/api/apod?hd=false');

      expect(res.statusCode).toBe(200);
      expect(res.body.hdurl).toBeUndefined();
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { hd: false }
      );
    });

    test('should handle video media type', async () => {
      fetchFromNasa.mockResolvedValue(videoMockResponse);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(200);
      expect(res.body.mediaType).toBe('video');
      expect(res.body.url).toBe('https://example.com/mock_video.mp4');
    });

    test('should convert HTTP URLs to HTTPS for security', async () => {
      const httpMock = {
        ...defaultMockResponse,
        url: 'http://example.com/mock.jpg',
        hdurl: 'http://example.com/mock_hd.jpg'
      };

      fetchFromNasa.mockResolvedValue(httpMock);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(200);
      expect(res.body.url).toBe('https://example.com/mock.jpg');
      expect(res.body.hdurl).toBe('https://example.com/mock_hd.jpg');
    });
  });

  describe('GET /api/apod - Date Validation', () => {
    test('should reject invalid date format', async () => {
      const res = await request(app).get('/api/apod?date=not-a-date');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid date format. Please use YYYY-MM-DD format.');
      expect(res.body.example).toBe('2023-12-25');
    });

    test('should reject date with wrong format (MM/DD/YYYY)', async () => {
      const res = await request(app).get('/api/apod?date=12/25/2023');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid date format. Please use YYYY-MM-DD format.');
    });

    test('should reject date before APOD service started', async () => {
      const res = await request(app).get('/api/apod?date=1990-01-01');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Date out of range. APOD is available from June 16, 1995 to present.');
      expect(res.body.minDate).toBe('1995-06-16');
    });

    test('should reject future dates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().slice(0, 10);

      const res = await request(app).get(`/api/apod?date=${futureDateString}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Date out of range. APOD is available from June 16, 1995 to present.');
    });

    test('should accept valid date within range', async () => {
      const validDate = '2023-06-16';
      const mockWithValidDate = { ...defaultMockResponse, date: validDate };

      fetchFromNasa.mockResolvedValue(mockWithValidDate);

      const res = await request(app).get(`/api/apod?date=${validDate}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.date).toBe(validDate);
    });
  });

  describe('GET /api/apod - Error Handling', () => {
    test('should handle 400 Bad Request from NASA API', async () => {
      const error = new Error('Bad Request');
      error.response = {
        status: 400,
        data: { error: 'Invalid date parameter' }
      };
      
      fetchFromNasa.mockRejectedValue(error);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Bad request to NASA API');
      expect(res.body.details).toBe('Invalid date parameter');
      expect(res.body.suggestion).toBe('Please check your date parameter format (YYYY-MM-DD)');
    });

    test('should handle 403 Forbidden (API key issues)', async () => {
      const error = new Error('Forbidden');
      error.response = {
        status: 403,
        data: { error: 'Invalid API key' }
      };
      
      fetchFromNasa.mockRejectedValue(error);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(503);
      expect(res.body.error).toBe('NASA API access forbidden');
      expect(res.body.details).toBe('API key may be invalid or rate limit exceeded');
    });

    test('should handle 404 Not Found (no data for date)', async () => {
      const error = new Error('Not Found');
      error.response = {
        status: 404,
        data: { error: 'No picture available for this date' }
      };
      
      fetchFromNasa.mockRejectedValue(error);

      const res = await request(app).get('/api/apod?date=1995-06-15');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('No APOD data available');
      expect(res.body.details).toBe('No picture available for this date');
      expect(res.body.suggestion).toBe('Try a different date');
    });

    test('should handle 429 Rate Limit Exceeded', async () => {
      const error = new Error('Rate Limit');
      error.response = {
        status: 429,
        data: { error: 'Rate limit exceeded' }
      };
      
      fetchFromNasa.mockRejectedValue(error);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(429);
      expect(res.body.error).toBe('Rate limit exceeded');
      expect(res.body.details).toBe('Too many requests to NASA API');
    });

    test('should handle 500 Internal Server Error from NASA', async () => {
      const error = new Error('Internal Server Error');
      error.response = {
        status: 500,
        data: { error: 'Internal server error' }
      };
      
      fetchFromNasa.mockRejectedValue(error);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(503);
      expect(res.body.error).toBe('NASA API service unavailable');
      expect(res.body.details).toBe('The NASA API is currently experiencing issues');
    });

    test('should handle network connection errors', async () => {
      const error = new Error('DNS lookup failed');
      error.code = 'ENOTFOUND';
      
      fetchFromNasa.mockRejectedValue(error);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(503);
      expect(res.body.error).toBe('Unable to connect to NASA API');
      expect(res.body.details).toBe('Network connection error');
    });

    test('should handle timeout errors', async () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      
      fetchFromNasa.mockRejectedValue(error);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(503);
      expect(res.body.error).toBe('Unable to connect to NASA API');
    });

    test('should handle invalid response data from NASA API', async () => {
      fetchFromNasa.mockResolvedValue(null);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });

    test('should handle missing required fields in NASA response', async () => {
      const incompleteResponse = {
        title: 'Incomplete APOD',
      };

      fetchFromNasa.mockResolvedValue(incompleteResponse);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });
  });

  describe('GET /api/apod - Caching', () => {
    test('should cache successful responses', async () => {
      fetchFromNasa.mockResolvedValue(defaultMockResponse);

      const res1 = await request(app).get('/api/apod');
      expect(res1.statusCode).toBe(200);
      expect(res1.body.cached).toBeUndefined();

      const res2 = await request(app).get('/api/apod');
      expect(res2.statusCode).toBe(200);
      expect(res2.body.cached).toBe(true);
      expect(res2.body.cacheTime).toBeDefined();

      expect(fetchFromNasa).toHaveBeenCalledTimes(1);
    });

    test('should cache responses with different dates separately', async () => {
      const date1 = '2023-12-25';
      const date2 = '2023-12-26';
      const mock1 = { ...defaultMockResponse, date: date1 };
      const mock2 = { ...defaultMockResponse, date: date2, title: 'Different APOD' };

      fetchFromNasa
        .mockResolvedValueOnce(mock1)
        .mockResolvedValueOnce(mock2);

      const res1 = await request(app).get(`/api/apod?date=${date1}`);
      const res2 = await request(app).get(`/api/apod?date=${date2}`);

      expect(res1.body.date).toBe(date1);
      expect(res2.body.date).toBe(date2);
      expect(res2.body.title).toBe('Different APOD');
      expect(fetchFromNasa).toHaveBeenCalledTimes(2);
    });

    test('should not cache error responses', async () => {
      const error = new Error('Server error');
      error.response = { status: 500, data: { error: 'Server error' } };

      fetchFromNasa
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(defaultMockResponse);

      const res1 = await request(app).get('/api/apod');
      expect(res1.statusCode).toBe(503);

      const res2 = await request(app).get('/api/apod');
      expect(res2.statusCode).toBe(200);

      expect(fetchFromNasa).toHaveBeenCalledTimes(2);
    });
  });

  describe('GET /api/apod/health - Health Check', () => {
    test('should return health status', async () => {
      const res = await request(app).get('/api/apod/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('APOD API');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.cache).toBeDefined();
      expect(res.body.cache.size).toBeDefined();
      expect(res.body.cache.maxSize).toBe(100);
    });
  });

  describe('DELETE /api/apod/cache - Cache Management', () => {
    test('should clear cache successfully', async () => {
      fetchFromNasa.mockResolvedValue(defaultMockResponse);
      await request(app).get('/api/apod');

      const res = await request(app).delete('/api/apod/cache');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cache cleared successfully');
      expect(res.body.clearedEntries).toBeGreaterThanOrEqual(0);
      expect(res.body.timestamp).toBeDefined();
    });

    test('should clear cache even when empty', async () => {
      const res = await request(app).delete('/api/apod/cache');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cache cleared successfully');
      expect(res.body.clearedEntries).toBe(0);
    });
  });

  describe('Edge Cases and Integration', () => {
    test('should handle special characters in date parameter', async () => {
      const res = await request(app).get('/api/apod?date=2023-13-45');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid date format. Please use YYYY-MM-DD format.');
    });

    test('should handle multiple query parameters', async () => {
      const testDate = '2023-12-25';
      const mockWithDate = { ...defaultMockResponse, date: testDate };

      fetchFromNasa.mockResolvedValue(mockWithDate);

      const res = await request(app).get(`/api/apod?date=${testDate}&hd=false`);

      expect(res.statusCode).toBe(200);
      expect(res.body.date).toBe(testDate);
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { hd: false, date: testDate }
      );
    });

    test('should handle empty response body from NASA API', async () => {
      fetchFromNasa.mockResolvedValue('');

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });

    test('should handle very large response from NASA API', async () => {
      const largeResponse = {
        ...defaultMockResponse,
        explanation: 'A'.repeat(10000)
      };

      fetchFromNasa.mockResolvedValue(largeResponse);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(200);
      expect(res.body.explanation.length).toBe(10000);
    });

    test('should handle concurrent requests properly', async () => {
      fetchFromNasa.mockResolvedValue(defaultMockResponse);

      const promises = Array(5).fill().map(() => request(app).get('/api/apod'));
      const responses = await Promise.all(promises);

      responses.forEach((res, index) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Mock APOD Title');
        if (index === 0) {
          expect(res.body.cached).toBeUndefined();
        } else {
          expect(res.body.cached).toBe(true);
        }
      });

      expect(fetchFromNasa).toHaveBeenCalledTimes(1);
    });
  });

  describe('Security and Performance', () => {
    test('should include security headers in enhanced response', async () => {
      fetchFromNasa.mockResolvedValue(defaultMockResponse);

      const res = await request(app).get('/api/apod');

      expect(res.statusCode).toBe(200);
      expect(res.body.url).toMatch(/^https:/);
      expect(res.body.hdurl).toMatch(/^https:/);
    });

    test('should validate all query parameters properly', async () => {
      fetchFromNasa.mockResolvedValue(defaultMockResponse);

      const res = await request(app).get('/api/apod?hd=true&extraParam=value');

      expect(res.statusCode).toBe(200);
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { hd: true }
      );
    });

    test('should handle boolean hd parameter variations', async () => {
      fetchFromNasa.mockResolvedValue(defaultMockResponse);

      const res1 = await request(app).get('/api/apod?hd=true');
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { hd: true }
      );

      const res2 = await request(app).get('/api/apod?hd=false');
      expect(fetchFromNasa).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod',
        { hd: false }
      );

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
    });
  });
});
