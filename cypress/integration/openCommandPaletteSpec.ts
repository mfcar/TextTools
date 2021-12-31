describe('Command Palette test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Open command palette clicking on button', () => {
    cy.get('#CommandPaletteButton').click();
    cy.contains('Command search');
  });

  it('Close command palette using Esc Key', () => {
    cy.get('body').type('{esc}');
    cy.contains('Command search').should('not.exist');
  });

  it('Open command palette using hotkey', () => {
    cy.get('body').type('{ctrl+shift+f}');
    cy.contains('Command search');
  });
});
