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

function getIdFromPath(path: string, label: string) {
  const id = path.split('/').pop();

  expect(id, `${label} should have an id segment`).to.be.a('string');
  expect(id, `${label} should not be empty`).to.not.equal('');

  return id as string;
}

describe('Home List', () => {
  beforeEach(() => {
    cy.exec('npm run testdb:reset');
    cy.exec('npm run testdb:seed');

    cy.visit('/');
  });

  it('Shows an "all caught up" message for a new user', () => {
    cy.login('newUser', 'password123');

    cy.contains("You're all caught up!");
  });

  it('marks an item complete from the list view', () => {
    cy.login('newUser', 'password123');

    cy.request('POST', '/api/list', {
      name: 'Cypress List',
      color: 'Amber'
    }).then(({ body }: { body: ApiResponseBody }) => {
      const listPath = body.content;
      const listId = getIdFromPath(listPath, 'list path');

      cy.request('POST', `/api/list/${listId}/section`, {
        name: 'Today Section'
      }).then(({ body }: { body: ApiResponseBody }) => {
        const sectionId = getIdFromPath(body.content, 'section path');

        cy.request('POST', '/api/item', {
          name: 'Cypress task',
          priority: 'High',
          sectionId,
          sectionIndex: 0,
          dateDue: new Date('2026-03-09T23:59:59.000Z').toISOString(),
          expectedMs: 60000
        }).then(({ body }: { body: ApiResponseBody }) => {
          const itemId = getIdFromPath(body.content, 'item path');

          cy.intercept('PATCH', `/api/item/${itemId}`).as('completeItem');
          cy.visit(listPath);

          cy.findByDisplayValue('Cypress task').should('exist');
          cy.findByRole('checkbox').should('not.be.checked');

          cy.findByRole('checkbox').click();
          cy.wait('@completeItem').its('response.statusCode').should('eq', 200);

          cy.findByRole('checkbox').should('be.checked');
          cy.findByText('Cypress task').should('have.class', 'line-through');
          cy.contains(/^Completed /).should('exist');
        });
      });
    });
  });
});
