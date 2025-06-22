const request = require('supertest');
const app = require('../routes/marsRover'); 
const axios = require('axios');

jest.mock('axios');
const mockedAxios = axios;

describe('Mars Rover API Backend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: { rovers: [] },
      status: 200
    });
  });

  describe('Health Check', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 'healthy',
          service: 'Mars Rover Photos API',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          cache: expect.objectContaining({
            size: expect.any(Number),
            maxSize: 100
          })
        })
      );
    });
  });

  describe('API Documentation', () => {
    test('GET /api/docs should return API documentation', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          title: 'Mars Rover Photos API',
          version: expect.any(String),
          endpoints: expect.any(Object),
          valid_rovers: expect.arrayContaining(['curiosity', 'opportunity', 'spirit', 'perseverance'])
        })
      );
    });
  });

  describe('Rovers Endpoint', () => {
    test('GET /api/rovers should return list of rovers', async () => {
      const mockRoversData = {
        rovers: [
          { 
            name: 'Curiosity', 
            status: 'active',
            landing_date: '2012-08-05',
            launch_date: '2011-11-26',
            total_photos: 500000,
            max_sol: 3000,
            max_date: '2023-01-01'
          },
          { 
            name: 'Perseverance', 
            status: 'active',
            landing_date: '2021-02-18',
            launch_date: '2020-07-30',
            total_photos: 150000,
            max_sol: 800,
            max_date: '2023-12-01'
          }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockRoversData,
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          count: expect.any(Number),
          fetchTime: expect.any(String)
        })
      );
      
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            status: expect.stringMatching(/^(active|complete)$/),
            landing_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            total_photos: expect.any(Number)
          })
        ])
      );
    });

    test('GET /api/rovers should handle NASA API errors', async () => {
      const axiosError = new Error('NASA API Error');
      axiosError.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: { error: { message: 'NASA API is down' } }
      };
      
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      const response = await request(app)
        .get('/api/rovers')
        .expect(500);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          code: 'ROVERS_FETCH_ERROR'
        })
      );
    });

    test('GET /api/rovers should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout. NASA API is taking too long to respond.');
      timeoutError.code = 'ECONNABORTED';
      
      mockedAxios.get.mockRejectedValueOnce(timeoutError);

      const response = await request(app)
        .get('/api/rovers')
        .expect(500);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('timeout'),
          code: 'ROVERS_FETCH_ERROR'
        })
      );
    });

    test('GET /api/rovers should handle empty response from NASA API', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { rovers: [] },
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: [],
          count: 0,
          fetchTime: expect.any(String)
        })
      );
    });
  });

  describe('Specific Rover Endpoint', () => {
    test('GET /api/rovers/:rover should return rover info for valid rover', async () => {
      const mockRoverData = {
        rover: {
          name: 'Curiosity',
          status: 'active',
          landing_date: '2012-08-05',
          launch_date: '2011-11-26',
          total_photos: 500000,
          max_sol: 3000,
          max_date: '2023-01-01',
          cameras: [
            { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
            { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
            { name: 'MAST', full_name: 'Mast Camera' }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockRoverData,
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers/curiosity')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: 'Curiosity',
            status: 'active'
          }),
          fetchTime: expect.any(String)
        })
      );
    });

    test('GET /api/rovers/:rover should return 400 for invalid rover', async () => {
      const response = await request(app)
        .get('/api/rovers/invalid-rover')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid rover name'),
          code: 'INVALID_ROVER'
        })
      );
    });
  });

  describe('Rover Photos Endpoint', () => {
    test('GET /api/rovers/:rover/photos should return photos with valid parameters', async () => {
      const mockPhotosData = {
        photos: [
          {
            id: 12345,
            sol: 1000,
            earth_date: '2023-01-01',
            img_src: 'https://mars.nasa.gov/photo1.jpg',
            camera: {
              id: 20,
              name: 'FHAZ',
              rover_id: 5,
              full_name: 'Front Hazard Avoidance Camera'
            },
            rover: {
              id: 5,
              name: 'Curiosity',
              landing_date: '2012-08-05',
              launch_date: '2011-11-26',
              status: 'active'
            }
          }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockPhotosData,
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers/curiosity/photos')
        .query({ sol: 1000, page: 1, per_page: 25 })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            photos: expect.any(Array),
            pagination: expect.objectContaining({
              current_page: 1,
              per_page: 25,
              total_photos: expect.any(Number)
            }),
            filters: expect.objectContaining({
              rover: 'curiosity',
              sol: 1000
            })
          })
        })
      );
    });

    test('GET /api/rovers/:rover/photos should handle camera filter', async () => {
      const mockPhotosData = {
        photos: [
          {
            id: 12345,
            sol: 1000,
            earth_date: '2023-01-01',
            img_src: 'https://mars.nasa.gov/photo1.jpg',
            camera: {
              id: 22,
              name: 'MAST',
              rover_id: 5,
              full_name: 'Mast Camera'
            },
            rover: {
              id: 5,
              name: 'Curiosity',
              status: 'active'
            }
          }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockPhotosData,
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers/curiosity/photos')
        .query({ sol: 1000, camera: 'MAST' })
        .expect(200);

      expect(response.body.data.filters).toEqual(
        expect.objectContaining({
          rover: 'curiosity',
          sol: 1000,
          camera: 'mast' 
        })
      );
    });

    test('GET /api/rovers/:rover/photos should handle earth_date parameter', async () => {
      const mockPhotosData = {
        photos: [
          {
            id: 12347,
            sol: 1001,
            earth_date: '2023-01-02',
            img_src: 'https://mars.nasa.gov/photo3.jpg',
            camera: {
              name: 'NAVCAM',
              full_name: 'Navigation Camera'
            },
            rover: {
              name: 'Curiosity',
              status: 'active'
            }
          }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockPhotosData,
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers/curiosity/photos')
        .query({ earth_date: '2023-01-02' })
        .expect(200);

      expect(response.body.data.filters).toEqual(
        expect.objectContaining({
          rover: 'curiosity',
          earth_date: '2023-01-02'
        })
      );
    });

    test('GET /api/rovers/:rover/photos should validate date format', async () => {
      const response = await request(app)
        .get('/api/rovers/curiosity/photos')
        .query({ earth_date: 'invalid-date' })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid date format'),
          code: 'INVALID_DATE_FORMAT'
        })
      );
    });

    test('GET /api/rovers/:rover/photos should validate sol parameter', async () => {
      const response = await request(app)
        .get('/api/rovers/curiosity/photos')
        .query({ sol: 'invalid-sol' })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid sol value'),
          code: 'INVALID_SOL'
        })
      );
    });

    test('GET /api/rovers/:rover/photos should validate negative sol values', async () => {
      const response = await request(app)
        .get('/api/rovers/curiosity/photos')
        .query({ sol: -1 })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid sol value'), 
          code: 'INVALID_SOL'
        })
      );
    });

    test('GET /api/rovers/:rover/photos should handle no photos found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { photos: [] },
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers/curiosity/photos')
        .query({ sol: 9999 })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            photos: [],
            pagination: expect.objectContaining({
              total_photos: 0
            })
          })
        })
      );
    });
  });

  describe('Rover Cameras Endpoint', () => {
    test('GET /api/rovers/:rover/cameras should return cameras for valid rover', async () => {
      const mockRoverData = {
        rover: {
          name: 'Curiosity',
          status: 'active',
          cameras: [
            { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
            { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
            { name: 'MAST', full_name: 'Mast Camera' },
            { name: 'CHEMCAM', full_name: 'Chemistry and Camera Complex' },
            { name: 'MAHLI', full_name: 'Mars Hand Lens Imager' }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockRoverData,
        status: 200
      });

      const response = await request(app)
        .get('/api/rovers/curiosity/cameras')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            rover: 'curiosity',
            cameras: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                full_name: expect.any(String)
              })
            ])
          })
        })
      );
      
      expect(response.body.data.cameras.length).toBeGreaterThan(0);
    });
  });

  describe('Latest Photos Endpoint', () => {
    test('GET /api/latest should return latest photos from active rovers', async () => {
      const mockLatestPhotos = {
        latest_photos: [
          {
            id: 67890,
            sol: 3000,
            earth_date: '2023-12-01',
            img_src: 'https://mars.nasa.gov/latest1.jpg',
            camera: { name: 'MAST', full_name: 'Mast Camera' },
            rover: { name: 'Curiosity', status: 'active' }
          }
        ]
      };

      mockedAxios.get.mockResolvedValue({
        data: mockLatestPhotos,
        status: 200
      });

      const response = await request(app)
        .get('/api/latest')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          totalPhotos: expect.any(Number),
          fetchTime: expect.any(String)
        })
      );
    });

    test('GET /api/latest should handle per_rover parameter', async () => {
      const mockLatestPhotos = {
        latest_photos: [
          {
            id: 67890,
            sol: 3000,
            earth_date: '2023-12-01',
            img_src: 'https://mars.nasa.gov/latest1.jpg',
            camera: { name: 'MAST', full_name: 'Mast Camera' },
            rover: { name: 'Curiosity', status: 'active' }
          }
        ]
      };

      mockedAxios.get.mockResolvedValue({
        data: mockLatestPhotos,
        status: 200
      });

      const response = await request(app)
        .get('/api/latest')
        .query({ per_rover: 5 }) 
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.any(Array)
        })
      );
    });

    test('GET /api/latest should handle rover filter', async () => {
      const mockLatestPhotos = {
        latest_photos: [
          {
            id: 67890,
            sol: 3000,
            earth_date: '2023-12-01',
            img_src: 'https://mars.nasa.gov/latest1.jpg',
            camera: { name: 'MAST', full_name: 'Mast Camera' },
            rover: { name: 'Curiosity', status: 'active' }
          }
        ]
      };

      mockedAxios.get.mockResolvedValue({
        data: mockLatestPhotos,
        status: 200
      });

      const response = await request(app)
        .get('/api/latest')
        .query({ rover: 'curiosity' })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              rover: 'curiosity',
              photos: expect.any(Array),
              status: 'success'
            })
          ])
        })
      );
    });

    test('GET /api/latest should handle empty results', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { latest_photos: [] },
        status: 200
      });

      const response = await request(app)
        .get('/api/latest')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          totalPhotos: 0
        })
      );
    });
  });

  describe('Cache Management', () => {
    test('DELETE /api/cache should clear cache successfully', async () => {
      const response = await request(app)
        .delete('/api/cache')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Cache cleared successfully',
          clearedEntries: expect.any(Number),
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('Should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: 'Endpoint not found',
          code: 'NOT_FOUND',
          availableEndpoints: expect.any(Array)
        })
      );
    });
  });

  describe('NASA API Integration', () => {
    test('Should handle NASA API rate limiting', async () => {
      const rateLimitError = new Error('NASA API rate limit exceeded. Please try again later.');
      rateLimitError.response = {
        status: 429,
        statusText: 'Too Many Requests',
        data: { error: { message: 'Rate limit exceeded' } }
      };

      mockedAxios.get.mockRejectedValueOnce(rateLimitError);

      const response = await request(app)
        .get('/api/rovers')
        .expect(500);

      expect(response.body.error).toContain('rate limit');
    });

    test('Should handle NASA API authentication errors', async () => {
      const authError = new Error('NASA API access forbidden. Please check your API key.');
      authError.response = {
        status: 403,
        statusText: 'Forbidden',
        data: { error: { message: 'Invalid API key' } }
      };

      mockedAxios.get.mockRejectedValueOnce(authError);

      const response = await request(app)
        .get('/api/rovers')
        .expect(500);

      expect(response.body.error).toContain('API key');
    });
  });

  describe('Test Endpoint', () => {
    test('GET /api/test should verify NASA API connectivity', async () => {
      const mockRoversData = {
        rovers: [
          { name: 'Curiosity' },
          { name: 'Perseverance' }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockRoversData,
        status: 200
      });

      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'NASA API connectivity test successful',
          data: expect.objectContaining({
            rovers_count: 2,
            rovers: ['Curiosity', 'Perseverance']
          })
        })
      );
    });
  });
});

describe('Edge Cases and Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should handle concurrent requests properly', async () => {
    const mockRoversData = {
      rovers: [
        { name: 'Curiosity', status: 'active' }
      ]
    };

    mockedAxios.get.mockResolvedValue({
      data: mockRoversData,
      status: 200
    });

    const requests = Promise.all([
      request(app).get('/api/rovers'),
      request(app).get('/api/rovers'),
      request(app).get('/api/rovers')
    ]);

    const responses = await requests;
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  test('Should handle very large sol values', async () => {
    const response = await request(app)
      .get('/api/rovers/curiosity/photos')
      .query({ sol: 15000 }) 
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Sol value too large'),
        code: 'SOL_TOO_LARGE'
      })
    );
  });

  test('Should handle special characters in rover names', async () => {
    const response = await request(app)
      .get('/api/rovers/test-rover!')
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Invalid rover name'),
        code: 'INVALID_ROVER'
      })
    );
  });
});

describe('Performance and Caching Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should cache rover data and serve from cache on subsequent requests', async () => {
    const mockRoversData = {
      rovers: [
        { name: 'Curiosity', status: 'active' }
      ]
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: mockRoversData,
      status: 200
    });

    await request(app)
      .get('/api/rovers')
      .expect(200);

    await request(app)
      .delete('/api/cache')
      .expect(200);

    await request(app)
      .get('/api/rovers')
      .expect(200);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1); 
  });

  test('Should limit response size for large photo collections', async () => {
    const mockPhotosData = {
      photos: Array.from({ length: 100 }, (_, i) => ({ 
        id: i,
        sol: 1000,
        earth_date: '2023-01-01',
        img_src: `https://mars.nasa.gov/photo${i}.jpg`,
        camera: { name: 'MAST', full_name: 'Mast Camera' },
        rover: { name: 'Curiosity', status: 'active' }
      }))
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: mockPhotosData,
      status: 200
    });

    const response = await request(app)
      .get('/api/rovers/curiosity/photos')
      .query({ sol: 1000, per_page: 100 })
      .expect(200);

    expect(response.body.data.photos.length).toBeLessThanOrEqual(100);
  });
});

describe('Security and Validation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should sanitize query parameters', async () => {
    const response = await request(app)
      .get('/api/rovers/curiosity/photos')
      .query({ sol: '<script>alert("xss")</script>' })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Invalid sol value'),
        code: 'INVALID_SOL'
      })
    );
  });

  test('Should handle SQL injection attempts', async () => {
    const response = await request(app)
      .get('/api/rovers/curiosity; DROP TABLE rovers;--')
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Invalid rover name'),
        code: 'INVALID_ROVER'
      })
    );
  });
});

describe('Integration with NASA API Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should handle NASA API partial response', async () => {
    const partialResponse = {
      rovers: [
        { name: 'Curiosity' }, 
        { name: 'Perseverance', status: 'active' }
      ]
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: partialResponse,
      status: 200
    });

    const response = await request(app)
      .get('/api/rovers')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Curiosity'
        })
      ])
    );
  });

  test('Should handle NASA API with unexpected fields', async () => {
    const responseWithExtraFields = {
      rovers: [
        {
          name: 'Curiosity',
          status: 'active',
          unexpected_field: 'some value',
          another_field: { nested: 'data' }
        }
      ]
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: responseWithExtraFields,
      status: 200
    });

    const response = await request(app)
      .get('/api/rovers')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});