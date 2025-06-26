describe('Mars Rover Gallery E2E Tests', () => {
  const API_BASE = 'https://nasaapi-comic-vista-backend.onrender.com';
  
  beforeEach(() => {
    cy.visit('https://nasa-api-comic-vista.vercel.app'); 
    
    cy.get('[data-cy="app-title"]').should('contain', 'Mars Rover Gallery');
  });

  describe('Application Loading and Health Check', () => {
    it('should display the application header correctly', () => {
      cy.get('header').should('be.visible');
      cy.get('[data-cy="app-title"]').should('contain', 'Mars Rover Gallery');
      cy.get('[data-cy="connection-status"]').should('be.visible');
    });

    it('should check API health status on load', () => {
      cy.get('[data-cy="connection-status"]', { timeout: 10000 })
        .should('contain.text', 'API Online')
        .or('contain.text', 'API Offline');
    });

    it('should display API stats when connected', () => {
      cy.get('[data-cy="connection-status"]').then(($status) => {
        if ($status.text().includes('API Online')) {
          cy.get('[data-cy="api-stats"]').should('be.visible');
        }
      });
    });
  });

  describe('Rover and Camera Selection', () => {
    it('should load rovers on page load', () => {
      cy.get('[data-cy="rover-select"]').should('be.visible');
      cy.get('[data-cy="rover-select"] option').should('have.length.greaterThan', 1);
    });

    it('should have Curiosity selected by default', () => {
      cy.get('[data-cy="rover-select"]').should('have.value', 'curiosity');
    });

    it('should load cameras when rover is selected', () => {
      cy.get('[data-cy="rover-select"]').select('perseverance');
      cy.get('[data-cy="camera-select"]').should('be.visible');
      
      cy.get('[data-cy="camera-select"] option', { timeout: 5000 })
        .should('have.length.greaterThan', 1);
    });

    it('should change rover and update available cameras', () => {
      cy.get('[data-cy="rover-select"]').select('curiosity');
      cy.wait(1000);
      
      let curiosityCameras;
      cy.get('[data-cy="camera-select"] option').then($options => {
        curiosityCameras = $options.length;
      });

      cy.get('[data-cy="rover-select"]').select('perseverance');
      cy.wait(1000);
      
      cy.get('[data-cy="camera-select"] option').should($options => {
        expect($options.length).to.be.greaterThan(0);
      });
    });
  });

  describe('Date and Sol Filtering', () => {
    it('should have default date set', () => {
      cy.get('[data-cy="date-input"]').should('have.value', '2023-01-01');
    });

    it('should allow date selection', () => {
      const testDate = '2023-06-15';
      cy.get('[data-cy="date-input"]').clear().type(testDate);
      cy.get('[data-cy="date-input"]').should('have.value', testDate);
    });

    it('should allow sol input and disable date when sol is entered', () => {
      cy.get('[data-cy="sol-input"]').type('100');
      cy.get('[data-cy="date-input"]').should('be.disabled');
    });

    it('should clear sol and re-enable date input', () => {
      cy.get('[data-cy="sol-input"]').type('100');
      cy.get('[data-cy="sol-input"]').clear();
      cy.get('[data-cy="date-input"]').should('not.be.disabled');
    });
  });

  describe('Photo Loading and Display', () => {
    it('should load photos on page load', () => {
      cy.get('[data-cy="loading-indicator"]', { timeout: 10000 })
        .should('not.exist');
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="photo-grid"]').length > 0) {
          cy.get('[data-cy="photo-card"]').should('have.length.greaterThan', 0);
        } else {
          cy.get('[data-cy="no-photos-message"]').should('be.visible');
        }
      });
    });

    it('should display loading indicator when fetching photos', () => {
      cy.get('[data-cy="date-input"]').clear().type('2023-07-01');
      cy.get('[data-cy="loading-indicator"]').should('be.visible');
      cy.get('[data-cy="loading-indicator"]', { timeout: 10000 }).should('not.exist');
    });

    it('should show error message when photos fail to load', () => {
      cy.intercept('GET', `${API_BASE}/rovers/*/photos*`, { statusCode: 500 });
      
      cy.get('[data-cy="date-input"]').clear().type('1999-01-01');
      cy.get('[data-cy="error-message"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Photo Grid Interactions', () => {
    beforeEach(() => {
      cy.get('[data-cy="photo-card"]', { timeout: 15000 }).should('exist');
    });

    it('should display photo cards with correct information', () => {
      cy.get('[data-cy="photo-card"]').first().within(() => {
        cy.get('img').should('be.visible');
        cy.get('[data-cy="rover-name"]').should('be.visible');
        cy.get('[data-cy="camera-name"]').should('be.visible');
        cy.get('[data-cy="earth-date"]').should('be.visible');
      });
    });

    it('should show hover effects on photo cards', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="photo-actions"]').first().should('be.visible');
    });

    it('should allow favoriting photos', () => {
      cy.get('[data-cy="photo-card"]').first().within(() => {
        cy.get('[data-cy="favorite-btn"]').click();
        cy.get('[data-cy="favorite-btn"]').should('have.class', 'text-red-500');
      });
      
      cy.get('[data-cy="favorites-count"]').should('contain', '1');
    });

    it('should allow unfavoriting photos', () => {
      cy.get('[data-cy="photo-card"]').first().within(() => {
        cy.get('[data-cy="favorite-btn"]').click();
      });
      
      cy.get('[data-cy="photo-card"]').first().within(() => {
        cy.get('[data-cy="favorite-btn"]').click();
        cy.get('[data-cy="favorite-btn"]').should('not.have.class', 'text-red-500');
      });
    });
  });

  describe('Photo Modal', () => {
    beforeEach(() => {
      cy.get('[data-cy="photo-card"]', { timeout: 15000 }).should('exist');
    });

    it('should open photo modal when zoom button is clicked', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="zoom-btn"]').first().click();
      cy.get('[data-cy="photo-modal"]').should('be.visible');
    });

    it('should display photo details in modal', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="zoom-btn"]').first().click();
      
      cy.get('[data-cy="photo-modal"]').within(() => {
        cy.get('img').should('be.visible');
        cy.get('[data-cy="modal-rover-name"]').should('be.visible');
        cy.get('[data-cy="modal-camera-name"]').should('be.visible');
        cy.get('[data-cy="modal-earth-date"]').should('be.visible');
        cy.get('[data-cy="modal-sol"]').should('be.visible');
        cy.get('[data-cy="modal-photo-id"]').should('be.visible');
      });
    });

    it('should close modal when close button is clicked', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="zoom-btn"]').first().click();
      cy.get('[data-cy="modal-close-btn"]').click();
      cy.get('[data-cy="photo-modal"]').should('not.exist');
    });

    it('should close modal when clicking outside', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="zoom-btn"]').first().click();
      cy.get('[data-cy="photo-modal"]').click('topLeft');
      cy.get('[data-cy="photo-modal"]').should('not.exist');
    });

    it('should allow favoriting from modal', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="zoom-btn"]').first().click();
      
      cy.get('[data-cy="modal-favorite-btn"]').click();
      cy.get('[data-cy="modal-favorite-btn"]').should('contain', 'Favorited');
    });
  });

  describe('View Mode Toggle', () => {
    it('should have grid view selected by default', () => {
      cy.get('[data-cy="grid-view-btn"]').should('have.class', 'bg-blue-600');
      cy.get('[data-cy="list-view-btn"]').should('have.class', 'bg-gray-700');
    });

    it('should switch to list view', () => {
      cy.get('[data-cy="list-view-btn"]').click();
      cy.get('[data-cy="list-view-btn"]').should('have.class', 'bg-blue-600');
      cy.get('[data-cy="grid-view-btn"]').should('have.class', 'bg-gray-700');
    });

    it('should switch back to grid view', () => {
      cy.get('[data-cy="list-view-btn"]').click();
      cy.get('[data-cy="grid-view-btn"]').click();
      cy.get('[data-cy="grid-view-btn"]').should('have.class', 'bg-blue-600');
    });
  });

  describe('Filter Controls', () => {
    it('should show/hide filters on mobile', () => {
      cy.viewport(375, 667); 
      
      cy.get('[data-cy="toggle-filters-btn"]').should('be.visible');
      cy.get('[data-cy="filters-container"]').should('have.class', 'hidden');
      
      cy.get('[data-cy="toggle-filters-btn"]').click();
      cy.get('[data-cy="filters-container"]').should('not.have.class', 'hidden');
    });

    it('should reset all filters when reset button is clicked', () => {
      cy.get('[data-cy="rover-select"]').select('perseverance');
      cy.get('[data-cy="date-input"]').clear().type('2023-12-25');
      cy.get('[data-cy="sol-input"]').type('500');
      
      cy.get('[data-cy="reset-filters-btn"]').click();
      
      cy.get('[data-cy="rover-select"]').should('have.value', 'curiosity');
      cy.get('[data-cy="date-input"]').should('have.value', '2023-01-01');
      cy.get('[data-cy="sol-input"]').should('have.value', '');
      cy.get('[data-cy="camera-select"]').should('have.value', '');
    });
  });

  describe('Load More Functionality', () => {
    it('should show load more button when there are more photos', () => {
      cy.get('[data-cy="photo-card"]', { timeout: 15000 }).should('exist');
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="load-more-btn"]').length > 0) {
          cy.get('[data-cy="load-more-btn"]').should('be.visible');
        }
      });
    });

    it('should load more photos when button is clicked', () => {
      cy.get('[data-cy="photo-card"]', { timeout: 15000 }).should('exist');
      
      cy.get('body').then($body => {
        const initialPhotoCount = $body.find('[data-cy="photo-card"]').length;
        
        if ($body.find('[data-cy="load-more-btn"]').length > 0) {
          cy.get('[data-cy="load-more-btn"]').click();
          cy.get('[data-cy="loading-indicator"]').should('be.visible');
          cy.get('[data-cy="loading-indicator"]', { timeout: 10000 }).should('not.exist');
          
          cy.get('[data-cy="photo-card"]').should('have.length.greaterThan', initialPhotoCount);
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should show retry button when API is disconnected', () => {
      cy.intercept('GET', `${API_BASE}/health`, { statusCode: 500 }).as('healthCheck');
      
      cy.reload();
      cy.get('[data-cy="retry-connection-btn"]', { timeout: 10000 }).should('be.visible');
    });

    it('should attempt to reconnect when retry button is clicked', () => {
      cy.intercept('GET', `${API_BASE}/health`, { statusCode: 500 }).as('healthCheckFail');
      
      cy.reload();
      cy.wait('@healthCheckFail');
      
      cy.intercept('GET', `${API_BASE}/health`, {
        statusCode: 200,
        body: { status: 'ok', uptime: 100 }
      }).as('healthCheckSuccess');
      
      cy.get('[data-cy="retry-connection-btn"]').click();
      cy.wait('@healthCheckSuccess');
      cy.get('[data-cy="connection-status"]').should('contain', 'API Online');
    });

    it('should handle image load errors gracefully', () => {
      cy.get('[data-cy="photo-card"]', { timeout: 15000 }).should('exist');
      
      cy.get('[data-cy="photo-card"] img').first().then($img => {
        $img[0].src = 'invalid-url';
        $img[0].onerror();
      });
      
      cy.get('[data-cy="photo-card"] img').first()
        .should('have.attr', 'src')
        .and('include', 'data:image/svg+xml');
    });
  });

  describe('Download and Share Functionality', () => {
    beforeEach(() => {
      cy.get('[data-cy="photo-card"]', { timeout: 15000 }).should('exist');
    });

    it('should show download button on hover', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="download-btn"]').first().should('be.visible');
    });

    it('should show share button on hover', () => {
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="share-btn"]').first().should('be.visible');
    });

    it('should attempt download when download button is clicked', () => {
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen');
      });
      
      cy.get('[data-cy="photo-card"]').first().trigger('mouseover');
      cy.get('[data-cy="download-btn"]').first().click();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-cy="rover-select"]').should('have.attr', 'aria-label');
      cy.get('[data-cy="camera-select"]').should('have.attr', 'aria-label');
      cy.get('[data-cy="date-input"]').should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      cy.get('[data-cy="rover-select"]').focus().should('be.focused');
      cy.get('[data-cy="rover-select"]').tab();
      cy.get('[data-cy="camera-select"]').should('be.focused');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop' }
    ];

    viewports.forEach(viewport => {
      it(`should display correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        cy.get('header').should('be.visible');
        cy.get('[data-cy="filters-container"]').should('exist');
        
        cy.get('[data-cy="photo-card"]', { timeout: 15000 }).should('exist');
        cy.get('[data-cy="photo-card"]').first().should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('waitForPhotosToLoad', () => {
  cy.get('[data-cy="loading-indicator"]', { timeout: 15000 }).should('not.exist');
  cy.get('[data-cy="photo-card"]').should('exist').or(cy.get('[data-cy="no-photos-message"]').should('exist'));
});

Cypress.Commands.add('selectRoverAndWait', (roverName) => {
  cy.get('[data-cy="rover-select"]').select(roverName);
  cy.wait(1000); 
});

Cypress.Commands.add('mockApiResponse', (endpoint, response, statusCode = 200) => {
  cy.intercept('GET', `${API_BASE}${endpoint}`, {
    statusCode,
    body: response
  });
});