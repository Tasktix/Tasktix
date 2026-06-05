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
 *
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';

import { renderHook } from '@testing-library/react';

import { useKanbanPref } from '../useKanbanPref';

//Mocking local storage
const localStorageMock = {
  get length() {
    return 0;
  },
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn()
} satisfies Storage;

beforeAll(() => {
  vi.stubGlobal('localStorage', localStorageMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

it('Updates local storage and state when kanban preference is changed', () => {
  const { result } = renderHook(() => useKanbanPref('listId'));
  const [isKanban, setIsKanban] = result.current;

  expect(isKanban).toBe(false);

  setIsKanban(true);

  expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
  expect(localStorageMock.setItem).toHaveBeenNthCalledWith(
    1,
    'KanbanPreference',
    '[["listId",false]]'
  );
  expect(localStorageMock.setItem).toHaveBeenNthCalledWith(
    2,
    'KanbanPreference',
    '[["listId",true]]'
  );
});
