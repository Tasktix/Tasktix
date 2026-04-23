/**
 * Tasktix: A powerful and flexible task-tracking tool for all.
 * Copyright (C) 2025 Nate Baird & other Tasktix contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

describe('Sign up', () => {
  beforeEach(() => {
    // ///////////////////////////////////////////////////////////////////////////////////
    // WARNING: These tests do **NOT** clean up the database between runs. To preserve
    // test isolation, be sure that the user interactions between tests do not overlap.
    // ///////////////////////////////////////////////////////////////////////////////////
    cy.visit('/');
  });

  it('Allows users to sign up', () => {
    cy.contains('Sign In').click();
    cy.contains('Sign Up').click();

    cy.findByLabelText('Username').type(`user_${Date.now()}`);
    cy.findByLabelText('Email').type(`user${Date.now()}@example.com`);
    cy.findByLabelText('Password').type('Secur3P@ssw0rd123');

    cy.findByRole('form').contains('Sign Up').click();

    cy.location('pathname').should('eq', '/list');
  });

  it('Rejects Passwords that have been compromised', () => {
    cy.contains('Sign In').click();
    cy.contains('Sign Up').click();

    cy.findByLabelText('Username').type(`user_${Date.now()}`);
    cy.findByLabelText('Email').type(`user${Date.now()}@example.com`);
    cy.findByLabelText('Password').type('password123');

    cy.findByRole('form').contains('Sign Up').click();

    cy.get('[data-toast="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Please choose a more secure password').should(
          'be.visible'
        );
      });
  });
});
