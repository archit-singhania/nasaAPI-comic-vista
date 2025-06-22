describe('NASA APOD E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the landing hero correctly', () => {
    cy.contains('Astronomy').should('be.visible');
    cy.contains('Picture').should('be.visible');
    cy.contains('of the Day').should('be.visible');
  });

  it('loads featured image and description', () => {
    cy.contains('FEATURED TODAY').should('exist');
    cy.get('img').should('have.attr', 'src').and('include', 'https://');
    cy.contains(/Horsehead Nebula/i).should('exist');
    cy.contains(/Barnard 33/i).should('exist');
  });

  it('opens image viewer modal on image click', () => {
    cy.get('img').first().click({ force: true });
    cy.get('img').should('have.class', 'max-w-full');
    cy.get('button').first().click(); 
  });

  it('toggles Read More and Show Less', () => {
    cy.contains(/Read More/).click();
    cy.contains(/Show Less/).should('exist');
    cy.contains(/Show Less/).click();
    cy.contains(/Read More/).should('exist');
  });

  it('can select a new date and refresh image', () => {
    const date = '2023-12-25';
    cy.get('input[type="date"]').clear().type(date);
    cy.get('img').should('have.attr', 'src');
  });

  it('adds and removes from favorites', () => {
    cy.get('[aria-label="favorites"]').click({ force: true });
    cy.get('[aria-label="favorites"]').click({ force: true });
  });

  it('downloads the image when download button is clicked', () => {
    cy.contains('Download').click({ force: true });
  });

  it('uses the share button (fallback to clipboard)', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('copy');
    });
    cy.contains('Share').click({ force: true });
    cy.get('@copy').should('be.called');
  });

  it('has working navbar items', () => {
    cy.contains('Explore').click();
    cy.contains('Favorites').click();
  });

  it('renders cosmic stats like views, likes, shares', () => {
    cy.contains(/views/i).should('exist');
    cy.get('button').contains(/Share/i).should('exist');
    cy.get('button').contains(/Bookmark/i).should('exist');
  });

  it('displays footer content correctly', () => {
    cy.contains(/Powered by NASA API/i).should('exist');
    cy.contains(/Built with cutting-edge/i).should('exist');
  });
});
