describe('Initial page test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.contains('Text Tools');
  });
});
