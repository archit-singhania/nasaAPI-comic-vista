describe('NEO Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/neo/feed*', { fixture: 'neo-feed.json' }).as('getNeoFeed');
    cy.intercept('GET', '/api/neo/stats', { fixture: 'neo-stats.json' }).as('getNeoStats');
    cy.intercept('GET', '/api/neo/browse*', { fixture: 'neo-browse.json' }).as('getNeoBrowse');
    cy.visit('/');
  });

  describe('Dashboard Loading and Display', () => {
    it('should display loading state initially', () => {
      cy.intercept('GET', '/api/neo/feed*', (req) => {
        req.reply((res) => {
          setTimeout(() => res.send({ fixture: 'neo-feed.json' }), 2000);
        });
      }).as('getSlowNeoFeed');

      cy.visit('/');
      cy.contains('Loading Asteroid Data').should('be.visible');
      cy.contains('Fetching from NASA NeoWs API...').should('be.visible');
      cy.get('[data-testid="globe-icon"]').should('be.visible');
    });

    it('should load dashboard successfully', () => {
      cy.wait('@getNeoFeed');
      cy.contains('Asteroid Tracking Dashboard').should('be.visible');
      cy.contains('Real-time near-Earth object monitoring').should('be.visible');
      cy.get('[data-testid="refresh-icon"]').should('be.visible');
    });

    it('should display all chart sections', () => {
      cy.wait('@getNeoFeed');
      cy.contains('Daily Asteroid Count').should('be.visible');
      cy.contains('Risk Assessment').should('be.visible');
      cy.contains('Hazardous vs Safe Classification').should('be.visible');
      cy.contains('Approach Velocity Distribution').should('be.visible');
      cy.contains('Risk Assessment Timeline').should('be.visible');
      cy.get('[data-testid="area-chart"]').should('exist');
      cy.get('[data-testid="pie-chart"]').should('exist');
      cy.get('[data-testid="bar-chart"]').should('exist');
      cy.get('[data-testid="line-chart"]').should('exist');
    });

    it('should show asteroid statistics', () => {
      cy.wait('@getNeoFeed');
      cy.contains('Total Asteroids').parent().should('contain.text', '3');
      cy.contains('Hazardous').parent().should('contain.text', '1');
      cy.contains('Safe').parent().should('contain.text', '2');
    });

    it('should show live status and update info', () => {
      cy.wait('@getNeoFeed');
      cy.contains('Live Data').should('be.visible');
      cy.contains('Powered by NASA Near Earth Object Web Service (NeoWs) API').should('be.visible');
      cy.contains('Data updated every hour • All times in UTC').should('be.visible');
    });

    it('should retry after failed fetch', () => {
      cy.intercept('GET', '/api/neo/feed*', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('getFailedNeoFeed');

      cy.visit('/');
      cy.wait('@getFailedNeoFeed');
      cy.contains('Data Loading Error').should('be.visible');
      cy.get('[data-testid="alert-triangle-icon"]').should('exist');
      cy.contains('Retry').click();

      cy.intercept('GET', '/api/neo/feed*', { fixture: 'neo-feed.json' }).as('getNeoFeedRetry');
      cy.wait('@getNeoFeedRetry');
      cy.contains('Asteroid Tracking Dashboard').should('be.visible');
    });

    it('should refresh data when refresh button clicked', () => {
      cy.wait('@getNeoFeed');
      cy.get('[data-testid="refresh-icon"]').click();

      cy.intercept('GET', '/api/neo/feed*', { fixture: 'neo-feed.json' }).as('getNeoFeedRefreshed');
      cy.wait('@getNeoFeedRefreshed');
      cy.contains('Asteroid Tracking Dashboard').should('be.visible');
    });

    it('should handle empty data gracefully', () => {
      cy.intercept('GET', '/api/neo/feed*', {
        body: {
          data: {
            near_earth_objects: {}
          }
        }
      }).as('getEmptyFeed');

      cy.visit('/');
      cy.wait('@getEmptyFeed');
      cy.contains('Asteroid Tracking Dashboard').should('be.visible');
      cy.contains('0').should('exist'); 
    });

    it('should call API with correct parameters', () => {
      cy.wait('@getNeoFeed').its('request.url').should('match', /start_date=\d{4}-\d{2}-\d{2}&end_date=\d{4}-\d{2}-\d{2}/);
    });
  });
});
