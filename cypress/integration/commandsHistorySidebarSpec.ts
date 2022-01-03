describe('Initial homepage test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Open Command History sidebar', () => {
    cy.get('#commandsHistoryButton').click();
    cy.get('#historySidebar').should('be.visible');
    cy.get('#commandsHistoryButton').click();
    cy.get('#historySidebar').should('not.be.visible');
  });
});
