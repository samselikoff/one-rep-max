describe("smoke tests", () => {
  it("should render", () => {
    cy.visit("/");

    cy.contains("Sign up").should("exist");
  });
});
