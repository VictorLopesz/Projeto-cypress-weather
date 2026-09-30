class CookieBanner {
  elements = {
    banner: () => cy.get('.cookies-banner'),
    message: (text: string) => cy.get('.cookies-banner').contains(text),
    button: (name: string) => cy.contains('.cookies-banner button', name),
  };

  // name: "Accept" ou "Decline"
  choose(name: string) {
    this.elements.button(name).click();
    this.elements.banner().should('not.exist');
  }
}

export default new CookieBanner();
