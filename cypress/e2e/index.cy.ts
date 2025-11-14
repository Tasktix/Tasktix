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

describe('Homepage', () => {
  it('Has screenshots and brief descriptions highlighting key Tasktix features', () => {
    cy.visit('/');

    cy.contains('Tasktix — Smarter Task Tracking').should('be.visible');
    cy.contains('Sign In').should('be.visible');
  });

  it('Displays the same information on mobile screens', () => {
    cy.viewport('iphone-6');
    cy.visit('/');

    cy.contains('Tasktix — Smarter Task Tracking').should('be.visible');
    cy.contains('Sign In').should('be.visible');
  });

  it('Responds to theme toggling', () => {
    cy.visit('/');

    cy.get('html').should('have.class', 'dark');
    cy.findByLabelText('Set dark theme').click();
    cy.get('html').should('have.class', 'light');
  });
});
