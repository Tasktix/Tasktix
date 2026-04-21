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

interface ApiResponseBody {
  content: string;
}

function getResponsiveSpecIdFromPath(path: string, label: string) {
  const id = path.split('/').pop();

  expect(id, `${label} should have an id segment`).to.be.a('string');
  expect(id, `${label} should not be empty`).to.not.equal('');

  return id as string;
}

describe('Responsive shell', () => {
  beforeEach(() => {
    cy.exec('npm run testdb:reset');
    cy.exec('npm run testdb:seed');
  });

  it('opens the mobile navigation drawer and closes it after navigating to a list', () => {
    cy.viewport('iphone-6');
    cy.login('newUser', 'password123');

    cy.request('POST', '/api/list', {
      name: 'Mobile Cypress List',
      color: 'Blue'
    }).then(({ body }: { body: ApiResponseBody }) => {
      const listPath = body.content;
      const listId = getResponsiveSpecIdFromPath(listPath, 'list path');

      cy.visit('/list');
      cy.findByRole('button', { name: 'Open navigation menu' })
        .should('have.attr', 'aria-expanded', 'false')
        .click()
        .should('have.attr', 'aria-expanded', 'true');

      cy.findByRole('dialog').should('be.visible');
      cy.findByText('Navigation').should('be.visible');
      cy.findByRole('link', { name: 'Mobile Cypress List' }).click();

      cy.location('pathname').should('eq', `/list/${listId}`);
      cy.findByRole('button', { name: 'Open navigation menu' }).should(
        'have.attr',
        'aria-expanded',
        'false'
      );
      cy.findByRole('dialog').should('not.exist');
    });
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
        cy.findByPlaceholderText('List name').type('Drawer Created List');
        cy.findByLabelText('Submit list').click();
      });

    cy.location('pathname').should('match', /^\/list\/[a-zA-Z0-9]{16}$/);
    cy.findByRole('dialog').within(() => {
      cy.findByRole('link', { name: 'Drawer Created List' }).should('exist');
    });
  });
});
