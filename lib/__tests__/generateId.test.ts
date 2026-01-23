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

import { generateId } from '../generateId';

test('Generates a 16-character ID by default', () => {
  const result = generateId();

  expect(result.length).toBe(16);
});

test('Generates IDs of the specified length', () => {
  const result = generateId(64);

  expect(result.length).toBe(64);

  const result2 = generateId(512);

  expect(result2.length).toBe(512);

  const result3 = generateId(1);

  expect(result3.length).toBe(1);
});

test('Generated IDs contain only numbers and letters', () => {
  crypto.getRandomValues = jest
    .fn()
    .mockReturnValueOnce(new Uint8Array([...new Array(512).map((_, i) => i)]));

  const result2 = generateId(512);

  expect(result2).toMatch(/[0-9A-Za-z]{512}/);
});
