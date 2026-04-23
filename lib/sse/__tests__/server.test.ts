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

import { addClient, broadcastEvent, removeClient } from '../server';

test('addClient returns a unique identifier for the connected client', () => {
  const id = addClient({} as ReadableStreamDefaultController, ['list-id']);
  const id2 = addClient({} as ReadableStreamDefaultController, ['list-id']);

  expect(id).not.toEqual(id2);

  // Cleanup must be done manually since `clients` isn't exposed or mocked
  removeClient(id);
  removeClient(id2);
});

test('broadcastEvent dispatches an event for clients subscribed to the given list', () => {
  const data = { type: 'SetListName', name: 'Some name' } as const;
  const enqueue = vi.fn();
  const id = addClient(
    { enqueue } as unknown as ReadableStreamDefaultController,
    ['list-id']
  );

  broadcastEvent('list-id', data);

  expect(enqueue).toHaveBeenCalledExactlyOnceWith(
    expect.stringContaining(JSON.stringify(data))
  );

  // Cleanup must be done manually since `clients` isn't exposed or mocked
  removeClient(id);
});

test('broadcastEvent does not dispatch an event for clients not subscribed to the given list', () => {
  const data = { type: 'SetListName', name: 'Some name' } as const;
  const enqueue = vi.fn();
  const id = addClient(
    { enqueue } as unknown as ReadableStreamDefaultController,
    ['other-list-id']
  );

  broadcastEvent('list-id', data);

  expect(enqueue).not.toHaveBeenCalled();

  // Cleanup must be done manually since `clients` isn't exposed or mocked
  removeClient(id);
});

test("removeClient doesn't error if client not added", () => {
  expect(() => removeClient(Symbol('un-added symbol'))).not.toThrow();
});
