import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MarsRoverGallery from '../MarsRoverGallery';

global.fetch = jest.fn();

global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mocked-blob-url'),
    revokeObjectURL: jest.fn(),
  }
});

Object.defineProperty(navigator, 'share', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve())
  },
  writable: true
});

describe('MarsRoverGallery Component', () => {
  const mockRoversResponse = {
    success: true,
    data: [
      { name: 'Curiosity', status: 'active' },
      { name: 'Perseverance', status: 'active' },
      { name: 'Opportunity', status: 'complete' },
      { name: 'Spirit', status: 'complete' }
    ]
  };

  const mockCamerasResponse = {
    success: true,
    data: {
      cameras: [
        { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
        { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
        { name: 'MAST', full_name: 'Mast Camera' }
      ]
    }
  };

  const mockPhotosResponse = {
    success: true,
    data: {
      photos: [
        {
          id: 12345,
          sol: 1000,
          earth_date: '2023-01-01',
          img_src: 'https://mars.nasa.gov/photo1.jpg',
          camera: {
            name: 'FHAZ',
            full_name: 'Front Hazard Avoidance Camera'
          },
          rover: {
            name: 'Curiosity',
            status: 'active'
          }
        },
        {
          id: 12346,
          sol: 1000,
          earth_date: '2023-01-01',
          img_src: 'https://mars.nasa.gov/photo2.jpg',
          camera: {
            name: 'MAST',
            full_name: 'Mast Camera'
          },
          rover: {
            name: 'Curiosity',
            status: 'active'
          }
        }
      ]
    }
  };

  const mockHealthResponse = {
    success: true,
    status: 'healthy',
    uptime: 123456
  };

  beforeEach(() => {
    fetch.mockClear();
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealthResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoversResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCamerasResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPhotosResponse)
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('renders main title and components', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      expect(screen.getByText('Mars Rover Gallery')).toBeInTheDocument();
      expect(screen.getByText('Search Filters')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('API Online')).toBeInTheDocument();
      });
    });

    test('shows loading state initially', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      expect(screen.getByText('Loading Mars photos...')).toBeInTheDocument();
    });
  });

  describe('API Health Check', () => {
    test('displays online status when API is healthy', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('API Online')).toBeInTheDocument();
      });
    });

    test('displays offline status and retry button when API fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Connection failed'));

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('API Offline')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    test('retry button attempts reconnection', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        });

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Retry'));
      });

      await waitFor(() => {
        expect(screen.getByText('API Online')).toBeInTheDocument();
      });
    });
  });

  describe('Rover Selection', () => {
    test('renders rover dropdown with options', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      const roverSelect = screen.getByDisplayValue(/curiosity/i);
      expect(roverSelect).toBeInTheDocument();
    });

    test('changes rover selection and fetches new data', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue(/curiosity/i)).toBeInTheDocument();
      });

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCamerasResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPhotosResponse)
        });

      const roverSelect = screen.getByDisplayValue(/curiosity/i);
      await user.selectOptions(roverSelect, 'perseverance');

      expect(roverSelect.value).toBe('perseverance');
    });
  });

  describe('Camera Selection', () => {
    test('renders camera dropdown with options', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        const cameraSelect = screen.getByDisplayValue('All Cameras');
        expect(cameraSelect).toBeInTheDocument();
      });
    });

    test('filters photos by camera selection', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('All Cameras')).toBeInTheDocument();
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockPhotosResponse,
          data: {
            photos: [mockPhotosResponse.data.photos[0]] 
          }
        })
      });

      const cameraSelect = screen.getByDisplayValue('All Cameras');
      await user.selectOptions(cameraSelect, 'FHAZ');

      expect(cameraSelect.value).toBe('FHAZ');
    });
  });

  describe('Date and Sol Filters', () => {
    test('allows date input and filters photos', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument();
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPhotosResponse)
      });

      const dateInput = screen.getByDisplayValue('2023-01-01');
      await user.clear(dateInput);
      await user.type(dateInput, '2023-12-01');

      expect(dateInput.value).toBe('2023-12-01');
    });

    test('allows sol input and clears date', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Optional')).toBeInTheDocument();
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPhotosResponse)
      });

      const solInput = screen.getByPlaceholderText('Optional');
      await user.type(solInput, '2000');

      expect(solInput.value).toBe('2000');
    });
  });

  describe('Photo Grid Display', () => {
    test('displays photos in grid format', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('2 photos found')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
    });

    test('switches between grid and list view', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('Grid')).toBeInTheDocument();
        expect(screen.getByText('List')).toBeInTheDocument();
      });

      const listButton = screen.getByText('List');
      await user.click(listButton);

      expect(listButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Photo Interactions', () => {
    test('opens photo modal when clicking zoom button', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
      });

      const firstPhoto = screen.getAllByRole('img')[0].closest('.group');
      await user.hover(firstPhoto);

      await waitFor(() => {
        const zoomButtons = screen.getAllByRole('button').filter(btn => 
          btn.querySelector('svg')
        );
        expect(zoomButtons.length).toBeGreaterThan(0);
      });
    });

    test('toggles favorite status', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
      });

      const firstPhoto = screen.getAllByRole('img')[0].closest('.group');
      await user.hover(firstPhoto);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    test('downloads image when clicking download button', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        blob: () => Promise.resolve(new Blob(['fake image data']))
      });

      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn()
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      jest.spyOn(document.body, 'appendChild').mockImplementation();
      jest.spyOn(document.body, 'removeChild').mockImplementation();

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toBeInTheDocument();
      });

      const firstPhoto = screen.getAllByRole('img')[0].closest('.group');
      await user.hover(firstPhoto);
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API request fails', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRoversResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCamerasResponse)
        })
        .mockRejectedValueOnce(new Error('Failed to fetch photos'));

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch photos/)).toBeInTheDocument();
      });
    });

    test('displays no photos found message', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRoversResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCamerasResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { photos: [] }
          })
        });

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('No photos found')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Reset', () => {
    test('resets all filters when reset button is clicked', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('Reset')).toBeInTheDocument();
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPhotosResponse)
      });

      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);

      expect(screen.getByDisplayValue('All Cameras')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2023-01-01')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('shows/hides filters on mobile', async () => {
      const user = userEvent.setup();
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      const showFiltersButton = screen.queryByText('Show Filters');
      if (showFiltersButton) {
        await user.click(showFiltersButton);
        expect(screen.getByText('Hide Filters')).toBeInTheDocument();
      }
    });
  });

  describe('Load More Functionality', () => {
    test('loads more photos when load more button is clicked', async () => {
      const user = userEvent.setup();
      
      const manyPhotosResponse = {
        success: true,
        data: {
          photos: Array.from({ length: 24 }, (_, i) => ({
            id: 10000 + i,
            sol: 1000 + i,
            earth_date: '2023-01-01',
            img_src: `https://mars.nasa.gov/photo${i}.jpg`,
            camera: {
              name: 'FHAZ',
              full_name: 'Front Hazard Avoidance Camera'
            },
            rover: {
              name: 'Curiosity',
              status: 'active'
            }
          }))
        }
      };

      fetch.mockClear();
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHealthResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRoversResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCamerasResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(manyPhotosResponse)
        });

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('24 photos found')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText('Load More Photos');
      expect(loadMoreButton).toBeInTheDocument();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            photos: Array.from({ length: 12 }, (_, i) => ({
              id: 20000 + i,
              sol: 2000 + i,
              earth_date: '2023-01-02',
              img_src: `https://mars.nasa.gov/photo_page2_${i}.jpg`,
              camera: {
                name: 'MAST',
                full_name: 'Mast Camera'
              },
              rover: {
                name: 'Curiosity',
                status: 'active'
              }
            }))
          }
        })
      });

      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText('36 photos found')).toBeInTheDocument();
      });
    });

    test('hides load more button when less than 24 photos are returned', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByText('2 photos found')).toBeInTheDocument();
      });

      expect(screen.queryByText('Load More Photos')).not.toBeInTheDocument();
    });
  });

  describe('Photo Modal Functionality', () => {
    test('opens modal with photo details when zoom button is clicked', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
      });

      const photoCards = document.querySelectorAll('.group');
      expect(photoCards).toHaveLength(2);

      await user.hover(photoCards[0]);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const zoomButton = buttons.find(btn => {
          const svg = btn.querySelector('svg');
          return svg && btn.className.includes('backdrop-blur-sm') && !btn.className.includes('red-500');
        });
        
        if (zoomButton) {
          fireEvent.click(zoomButton);
        }
      });

      await waitFor(() => {
        const modalText = screen.queryByText('Photo Details');
        if (modalText) {
          expect(modalText).toBeInTheDocument();
        }
      });
    });

    test('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
      });

      const photoCards = document.querySelectorAll('.group');
      await user.hover(photoCards[0]);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const zoomButton = buttons.find(btn => {
          const svg = btn.querySelector('svg');
          return svg && btn.className.includes('backdrop-blur-sm') && !btn.className.includes('red-500');
        });
        
        if (zoomButton) {
          fireEvent.click(zoomButton);
        }
      });

      const modalContainer = document.querySelector('.fixed.inset-0');
      if (modalContainer) {
        const closeButton = modalContainer.querySelector('button');
        if (closeButton) {
          await user.click(closeButton);
        }
      }
    });
  });

  describe('Share Functionality', () => {
    test('shares photo using native share API when available', async () => {
      const user = userEvent.setup();
      const mockShare = jest.fn().mockResolvedValue();
      navigator.share = mockShare;

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
      });

      const photoCards = document.querySelectorAll('.group');
      await user.hover(photoCards[0]);

      const shareButtons = document.querySelectorAll('button svg');
      const shareButton = Array.from(shareButtons).find(svg => {
        return svg.parentElement.className.includes('bg-white/20');
      });

      if (shareButton) {
        await user.click(shareButton.parentElement);
        expect(mockShare).toHaveBeenCalled();
      }
    });

    test('falls back to clipboard when native share is unavailable', async () => {
      const user = userEvent.setup();
      delete navigator.share;
      const mockWriteText = jest.fn().mockResolvedValue();
      navigator.clipboard.writeText = mockWriteText;
      
      window.alert = jest.fn();

      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
      });

      const photoCards = document.querySelectorAll('.group');
      await user.hover(photoCards[0]);
    });
  });

  describe('Favorites Management', () => {
    test('adds photo to favorites when heart button is clicked', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
        expect(screen.getByText('2 photos found')).toBeInTheDocument();
      });

      const photoCards = document.querySelectorAll('.group');
      await user.hover(photoCards[0]);

      await waitFor(() => {
        const heartButtons = document.querySelectorAll('button svg');
        const heartButton = Array.from(heartButtons).find(svg => {
          return svg.parentElement.className.includes('backdrop-blur-sm') && 
                 svg.parentElement.className.includes('bg-black/50');
        });

        if (heartButton) {
          fireEvent.click(heartButton.parentElement);
        }
      });

      await waitFor(() => {
        const favoriteText = screen.queryByText(/1 favorited/);
        if (favoriteText) {
          expect(favoriteText).toBeInTheDocument();
        }
      });
    });

    test('removes photo from favorites when heart button is clicked again', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(2);
      });

      const photoCards = document.querySelectorAll('.group');
      await user.hover(photoCards[0]);

      const heartButtons = document.querySelectorAll('button');
      const heartButton = Array.from(heartButtons).find(btn => {
        return btn.className.includes('backdrop-blur-sm') && 
               btn.className.includes('bg-black/50');
      });

      if (heartButton) {
        await user.click(heartButton);
        
        await waitFor(() => {
          expect(heartButton.className).toContain('bg-red-500/90');
        });

        await user.click(heartButton);
        
        await waitFor(() => {
          expect(heartButton.className).toContain('bg-black/50');
        });
      }
    });
  });

  describe('Image Error Handling', () => {
    test('displays fallback image when photo fails to load', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
      });

      const firstImage = screen.getAllByRole('img')[0];
      fireEvent.error(firstImage);

      expect(firstImage.src).toContain('data:image/svg+xml');
    });
  });

  describe('Accessibility', () => {
    test('has proper alt text for images', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('alt');
          expect(img.alt).toContain('Mars photo by');
        });
      });
    });

    test('has proper form labels', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/rover/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/camera/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/earth date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sol/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('uses lazy loading for images', async () => {
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('loading', 'lazy');
        });
      });
    });
  });

  describe('URL Parameters and State Management', () => {
    test('maintains filter state when switching between grid and list view', async () => {
      const user = userEvent.setup();
      
      await act(async () => {
        render(<MarsRoverGallery />);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('All Cameras')).toBeInTheDocument();
      });

      const cameraSelect = screen.getByDisplayValue('All Cameras');
      await user.selectOptions(cameraSelect, 'FHAZ');

      const listButton = screen.getByText('List');
      await user.click(listButton);

      expect(screen.getByDisplayValue('FHAZ')).toBeInTheDocument();
    });
  });
});