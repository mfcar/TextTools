describe('Command Palette test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Open command palette clicking on button', () => {
    cy.get('#commandPaletteButton').click();
    cy.get('#commandPaletteModal').should('exist');
    cy.get('body').click(0, 0);
    cy.get('#commandPaletteModal').should('not.exist');
  });

  it('Open command palette using hotkey', () => {
    cy.get('body').type('{ctrl+shift+f}');
    cy.get('#commandPaletteModal').should('exist');
    cy.get('body').type('{esc}');
    cy.get('#commandPaletteModal').should('not.exist');
  });
});
