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

import * as generateIdModule from '@/lib/generateId'; // Needed for mocking - skipcq: JS-C1003

import Session from './session';

beforeEach(() => {
  jest
    .spyOn(generateIdModule, 'generateId')
    .mockReturnValue('mock-generated-id');
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('Generates an id if none provided', () => {
  const session = new Session();

  expect(session.id).toBe('mock-generated-id');
  expect(generateIdModule.generateId).toHaveBeenCalled();
});

test('Uses the provided id', () => {
  const session = new Session('provided-id');

  expect(session.id).toBe('provided-id');
  expect(generateIdModule.generateId).not.toHaveBeenCalled();
});

test('Assigns all properties correctly', () => {
  const session = new Session('provided-id');

  expect(session.id).toBe('provided-id');
  expect(session.userId).toBeNull();
  expect(session.dateExpire).toBeNull();
});
