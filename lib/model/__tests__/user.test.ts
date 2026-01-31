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
import * as colorModule from '@/lib/color'; // Needed for mocking - skipcq: JS-C1003

import User from '../user';

const fixedDateCreated = new Date('2020-01-01T00:00:00Z');
const fixedDateSignedIn = new Date('2020-01-02T00:00:00Z');

beforeEach(() => {
  jest
    .spyOn(generateIdModule, 'generateId')
    .mockReturnValue('mock-generated-id');
  jest
    .spyOn(colorModule, 'randomNamedColor')
    .mockReturnValue('mock-color' as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('Generates an id if none provided', () => {
  const user = new User(
    'testUser',
    'test@example.com',
    'secret',
    fixedDateCreated,
    fixedDateSignedIn,
    {}
  );

  expect(user.id).toBe('mock-generated-id');
  expect(generateIdModule.generateId).toHaveBeenCalled();
});

test('Uses the provided id', () => {
  const user = new User(
    'testUser',
    'test@example.com',
    'secret',
    fixedDateCreated,
    fixedDateSignedIn,
    { id: 'provided-id' }
  );

  expect(user.id).toBe('provided-id');
  expect(generateIdModule.generateId).not.toHaveBeenCalled();
});

test('Picks a color if none provided', () => {
  const user = new User(
    'testUser',
    'test@example.com',
    'secret',
    fixedDateCreated,
    fixedDateSignedIn,
    {}
  );

  expect(user.color).toBe('mock-color');
  expect(colorModule.randomNamedColor).toHaveBeenCalled();
});

test('Uses the provided color', () => {
  const user = new User(
    'testUser',
    'test@example.com',
    'secret',
    fixedDateCreated,
    fixedDateSignedIn,
    { color: 'provided-color' as never }
  );

  expect(user.color).toBe('provided-color');
  expect(colorModule.randomNamedColor).not.toHaveBeenCalled();
});

test('Assigns all properties correctly', () => {
  const user = new User(
    'testUser',
    'test@example.com',
    'secret',
    fixedDateCreated,
    fixedDateSignedIn,
    { id: 'provided-id', color: 'provided-color' as never }
  );

  expect(user.username).toBe('testUser');
  expect(user.email).toBe('test@example.com');
  expect(user.password).toBe('secret');
  expect(user.dateCreated).toBe(fixedDateCreated);
  expect(user.dateSignedIn).toBe(fixedDateSignedIn);
  expect(user.id).toBe('provided-id');
  expect(user.color).toBe('provided-color');
});
