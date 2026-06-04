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

const RESPONSIVE_LIST_ID = 'responsiveList01';
const RESPONSIVE_LIST_NAME = 'Responsive Cypress List';

describe('Responsive shell', () => {
  beforeEach(() => {
    cy.exec('npm run testdb:reset');
    cy.exec('npm run testdb:seed');
  });

  it('opens the mobile navigation drawer and closes it after navigating to a list', () => {
    cy.viewport('iphone-6');
    cy.login('responsiveUser', 'password123');

    cy.visit('/list');
    cy.findByRole('button', { name: 'Open navigation menu' })
      .should('have.attr', 'aria-expanded', 'false')
      .click()
      .should('have.attr', 'aria-expanded', 'true');

    cy.findByRole('dialog').should('be.visible');
    cy.findByText('Navigation').should('be.visible');
    cy.findByRole('link', { name: RESPONSIVE_LIST_NAME }).click();

    cy.location('pathname').should('eq', `/list/${RESPONSIVE_LIST_ID}`);
    cy.findByRole('button', { name: 'Open navigation menu' }).should(
      'have.attr',
      'aria-expanded',
      'false'
    );
    cy.findByRole('dialog').should('not.exist');
  });

  it('shows the desktop sidebar without opening the mobile drawer', () => {
    cy.viewport(1024, 768);
    cy.login('responsiveUser', 'password123');

    cy.visit('/list');
    cy.findByRole('button', {
      hidden: true,
      name: 'Open navigation menu'
    }).should('have.attr', 'aria-expanded', 'false');
    cy.findByRole('link', { name: RESPONSIVE_LIST_NAME }).should('be.visible');
    cy.findByRole('dialog').should('not.exist');
  });

  it('creates a new list from the mobile drawer', () => {
    cy.viewport('iphone-6');
    cy.login('newUser', 'password123');

    cy.visit('/list');
    cy.findByRole('button', { name: 'Open navigation menu' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Create new list').click();
      });

    cy.findByRole('dialog', { name: 'Create New List' })
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('List name').type('Drawer Created List');
        cy.findByLabelText('Submit list').click();
      });

    cy.location('pathname').should('match', /^\/list\/[a-zA-Z0-9]{16}$/);
    cy.findByRole('dialog').within(() => {
      cy.findByRole('link', { name: 'Drawer Created List' }).should('exist');
    });
  });
});
