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

vi.mock('@/lib/generateId', () => ({
  generateId: vi.fn(() => 'mock-generated-id')
}));

import { generateId } from '@/lib/generateId';

import Tag from '../tag';

beforeEach(() => {
  vi.mocked(generateId).mockClear();
});

test('Generates an id if none provided', () => {
  const tag = new Tag('testTag', 'Amber');

  expect(tag.id).toBe('mock-generated-id');
  expect(generateId).toHaveBeenCalled();
});

test('Uses the provided id', () => {
  const tag = new Tag('testTag', 'Amber', 'provided-id');

  expect(tag.id).toBe('provided-id');
  expect(generateId).not.toHaveBeenCalled();
});

test('Assigns all properties correctly', () => {
  const tag = new Tag('testTag', 'Amber', 'provided-id');

  expect(tag.name).toBe('testTag');
  expect(tag.color).toBe('Amber');
  expect(tag.id).toBe('provided-id');
});
