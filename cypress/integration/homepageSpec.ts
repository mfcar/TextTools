describe('Initial homepage test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Visits the initial project page', () => {
    cy.contains('Text Tools');
  });
});
