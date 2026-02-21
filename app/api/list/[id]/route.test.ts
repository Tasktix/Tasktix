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

import {
  getIsListAssignee,
  getListById,
  updateList
} from '@/lib/database/list';
import List from '@/lib/model/list';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import { broadcastEvent } from '@/lib/sse/server';

import { PATCH } from './route';

const MOCK_USER = new User(
  'user-id',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MOCK_LIST = new List(
  'List name',
  'Amber',
  [],
  [],
  true,
  true,
  true,
  'list-id'
);

const LIST_PATH = `http://localhost/api/list/${MOCK_LIST.id}` as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');
vi.mock('@/lib/sse/server');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Allows updating list name without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(updateList).mockResolvedValue(true);

    const response = await PATCH(
      new Request(LIST_PATH, {
        method: 'patch',
        body: JSON.stringify({ name: 'New list name' })
      }),
      { params: Promise.resolve({ id: 'list-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateList).toHaveBeenCalledOnce();
    const fields = vi.mocked(updateList).mock.calls[0][0];

    expect(fields).toMatchObject({ name: 'New list name' });

    expect(fields).not.toMatchObject({ hasTimeTracking: false });
    expect(fields).not.toMatchObject({ hasDueDates: false });
    expect(fields).not.toMatchObject({ isAutoOrdered: false });
    expect(!('color' in fields) || fields.color == 'Amber').toBe(true);

    expect(broadcastEvent).toHaveBeenCalledExactlyOnceWith('list-id', {
      type: 'SetListName',
      name: 'New list name'
    });
  });

  test('Allows updating time tracking without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(updateList).mockResolvedValue(true);

    const response = await PATCH(
      new Request(LIST_PATH, {
        method: 'patch',
        body: JSON.stringify({ hasTimeTracking: false })
      }),
      { params: Promise.resolve({ id: 'list-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateList).toHaveBeenCalledOnce();
    const fields = vi.mocked(updateList).mock.calls[0][0];

    expect(fields).toMatchObject({ hasTimeTracking: false });

    expect(!('name' in fields) || fields.name === 'List name').toBe(true);
    expect(fields).not.toMatchObject({ hasDueDates: false });
    expect(fields).not.toMatchObject({ isAutoOrdered: false });
    expect(!('color' in fields) || fields.color === 'Amber').toBe(true);

    expect(broadcastEvent).toHaveBeenCalledExactlyOnceWith('list-id', {
      type: 'SetHasTimeTracking',
      hasTimeTracking: false
    });
  });

  test('Allows updating due dates without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(updateList).mockResolvedValue(true);

    const response = await PATCH(
      new Request(LIST_PATH, {
        method: 'patch',
        body: JSON.stringify({ hasDueDates: false })
      }),
      { params: Promise.resolve({ id: 'list-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateList).toHaveBeenCalledOnce();
    const fields = vi.mocked(updateList).mock.calls[0][0];

    expect(fields).toMatchObject({ hasDueDates: false });

    expect(!('name' in fields) || fields.name === 'List name').toBe(true);
    expect(fields).not.toMatchObject({ hasTimeTracking: false });
    expect(fields).not.toMatchObject({ isAutoOrdered: false });
    expect(!('color' in fields) || fields.color === 'Amber').toBe(true);

    expect(broadcastEvent).toHaveBeenCalledExactlyOnceWith('list-id', {
      type: 'SetHasDueDates',
      hasDueDates: false
    });
  });

  test('Allows updating auto-ordering without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(updateList).mockResolvedValue(true);

    const response = await PATCH(
      new Request(LIST_PATH, {
        method: 'patch',
        body: JSON.stringify({ isAutoOrdered: false })
      }),
      { params: Promise.resolve({ id: 'list-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateList).toHaveBeenCalledOnce();
    const fields = vi.mocked(updateList).mock.calls[0][0];

    expect(fields).toMatchObject({ isAutoOrdered: false });

    expect(!('name' in fields) || fields.name === 'List name').toBe(true);
    expect(fields).not.toMatchObject({ hasTimeTracking: false });
    expect(fields).not.toMatchObject({ hasDueDates: false });
    expect(!('color' in fields) || fields.color === 'Amber').toBe(true);

    expect(broadcastEvent).toHaveBeenCalledExactlyOnceWith('list-id', {
      type: 'SetIsAutoOrdered',
      isAutoOrdered: false
    });
  });

  test('Allows updating color without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(updateList).mockResolvedValue(true);

    const response = await PATCH(
      new Request(LIST_PATH, {
        method: 'patch',
        body: JSON.stringify({ color: 'Blue' })
      }),
      { params: Promise.resolve({ id: 'list-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateList).toHaveBeenCalledOnce();
    const fields = vi.mocked(updateList).mock.calls[0][0];

    expect(fields).toMatchObject({ color: 'Blue' });

    expect(!('name' in fields) || fields.name === 'List name').toBe(true);
    expect(fields).not.toMatchObject({ hasTimeTracking: false });
    expect(fields).not.toMatchObject({ hasDueDates: false });
    expect(fields).not.toMatchObject({ isAutoOrdered: false });

    expect(broadcastEvent).toHaveBeenCalledExactlyOnceWith('list-id', {
      type: 'SetListColor',
      color: 'Blue'
    });
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await PATCH(
        new Request(LIST_PATH, {
          method: 'patch',
          body: JSON.stringify({ name: 'New list name' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(401);
      expect(updateList).not.toHaveBeenCalled();
      expect(broadcastEvent).not.toHaveBeenCalled();
    });

    test('Rejects requests to modify nonexistent lists', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListById).mockResolvedValue(false);

      const response = await PATCH(
        new Request(LIST_PATH, {
          method: 'patch',
          body: JSON.stringify({ name: 'New list name' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(404);
      expect(updateList).not.toHaveBeenCalled();
      expect(broadcastEvent).not.toHaveBeenCalled();
    });

    test('Rejects requests to modify list not a member of', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
      vi.mocked(getIsListAssignee).mockResolvedValue(false);

      const response = await PATCH(
        new Request(LIST_PATH, {
          method: 'patch',
          body: JSON.stringify({ name: 'New list name' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(404);
      expect(updateList).not.toHaveBeenCalled();
      expect(broadcastEvent).not.toHaveBeenCalled();
    });

    test('Rejects requests with malformed bodies', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
      vi.mocked(getIsListAssignee).mockResolvedValue(true);

      const response = await PATCH(
        new Request(LIST_PATH, {
          method: 'patch',
          body: JSON.stringify({ invalidField: true })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(400);
      expect(updateList).not.toHaveBeenCalled();
      expect(broadcastEvent).not.toHaveBeenCalled();
    });

    test("Warns the user and doesn't push updates if updating the list fails", async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListById).mockResolvedValue(structuredClone(MOCK_LIST));
      vi.mocked(getIsListAssignee).mockResolvedValue(true);
      vi.mocked(updateList).mockResolvedValue(false);

      const response = await PATCH(
        new Request(LIST_PATH, {
          method: 'patch',
          body: JSON.stringify({ name: 'New list name' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(500);
      expect(broadcastEvent).not.toHaveBeenCalled();
    });
  });
});
