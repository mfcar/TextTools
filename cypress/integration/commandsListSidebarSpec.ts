describe('Initial homepage test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Open Command List sidebar', () => {
    cy.get('#commandsListButton').click();
    cy.get('#commandsListSidebar').should('be.visible');
    cy.get('#commandsListButton').click();
    cy.get('#commandsListSidebar').should('not.be.visible');
  });
});
