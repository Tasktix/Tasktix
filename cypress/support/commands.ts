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

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (username: string, password: string) => {
  const REDIRECT_PATH = '/list';

  cy.session(
    `login-${username}`,
    () => {
      cy.visit('/');
      cy.contains('Sign In').click();

      cy.findByLabelText('Username').type(username);
      cy.findByLabelText('Password').type(password);

      cy.findByRole('form').contains('Sign In').click();

      // Included to make sure the request is resolved before Cypress runs the validate()
      // function. Also needed to catch it if the redirect changes - the `REDIRECT_PATH`
      // constant will need to be updated so the very last line of this command works.
      cy.location('pathname').should('eq', REDIRECT_PATH);
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.getCookie('better-auth.session_token').should('exist');
        cy.request('/api/auth/get-session').its('status').should('eq', 200);
      }
    }
  );

  // End up on "about:blank" after cy.session(), so need to resume where logging in left off
  cy.visit(REDIRECT_PATH);
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}
