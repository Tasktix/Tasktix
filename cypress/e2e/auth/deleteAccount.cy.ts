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

describe('delete account', () => {
  beforeEach(() => {
    cy.exec('npm run testdb:reset');
    cy.exec('npm run testdb:seed');

    cy.visit('/');
  });

  it('Deletion fails if password invalid', () => {
    cy.login('newUser', 'password123');

    cy.findByLabelText('Profile actions').click();
    cy.findByLabelText('Profile').should('be.visible').click();

    cy.findByLabelText('Delete Account').click();
    cy.findByLabelText('Password')
      .should('be.visible')
      .type('incorrectpassword');

    cy.findByLabelText('Confirm Delete Account').click();

    cy.get('[data-toast="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Invalid password').should('be.visible');
      });
  });

  // This test succesfully validates the verification of session freshness,
  // but includes busy waiting for over a minute, if session freshness proves
  // to be an important issue, this test may be useful
  it.skip('Deletion fails if session is stale', () => {
    cy.login('newUser', 'password123');
    cy.clock();

    cy.findByLabelText('Profile actions').click();
    cy.findByLabelText('Profile').should('be.visible').click();

    cy.findByLabelText('Delete Account').click();

    // Move Clock forward to make session stale
    cy.wait(65 * 1000);

    cy.findByLabelText('Confirm Delete Account').click();

    cy.get('[data-toast="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Session expired.').should('be.visible');
      });
  });

  it('Deletion succeeds with correct password', () => {
    cy.login('newUser', 'password123');

    cy.findByLabelText('Profile actions').click();
    cy.findByLabelText('Profile').should('be.visible').click();

    cy.findByLabelText('Delete Account').click();
    cy.findByLabelText('Password').should('be.visible').type('password123');

    cy.findByLabelText('Confirm Delete Account').click();

    cy.location('pathname').should('eq', '/about');

    cy.get('[data-toast="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Account succesfully deleted').should('be.visible');
      });
  });

  it('Deletion succeeds as only admin of non-shared list', () => {
    cy.login('newUser', 'password123');

    cy.createList('dummyList');

    cy.findByLabelText('Profile Actions Dropdown').click();
    cy.findByLabelText('Profile').should('be.visible').click();

    cy.findByLabelText('Delete Account').click();
    cy.findByLabelText('Password').should('be.visible').type('password123');

    cy.findByLabelText('Confirm Delete Account').click();

    cy.location('pathname').should('eq', '/about');

    cy.get('[data-toast="true"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Account succesfully deleted').should('be.visible');
      });
  });
});
