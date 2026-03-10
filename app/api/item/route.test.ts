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

import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import { createListItem } from '@/lib/database/listItem';
import { getListBySectionId, getListMember } from '@/lib/database/list';
import List from '@/lib/model/list';
import ListSection from '@/lib/model/listSection';

import { POST } from './route';

const MOCK_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MOCK_SECTION = new ListSection('Section name', [], 'section-id-16-ch');

const ITEM_PATH = 'http://localhost/api/item' as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');
vi.mock('@/lib/database/listItem');

beforeEach(vi.resetAllMocks);

describe('POST', () => {
  test('Allows items with no expected time when the list has time tracking disabled', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListBySectionId).mockResolvedValue(
      new List(
        'List name',
        'Amber',
        [],
        [MOCK_SECTION],
        false,
        true,
        true,
        'list-id'
      )
    );
    vi.mocked(getListMember).mockResolvedValue({
      canAdd: true,
      canAssign: true,
      canComplete: true,
      canRemove: true
    });
    vi.mocked(createListItem).mockResolvedValue(true);

    const response = await POST(
      new Request(ITEM_PATH, {
        method: 'post',
        body: JSON.stringify({
          name: 'Item name',
          dateDue: new Date('2026-01-01'),
          priority: 'High',
          sectionId: MOCK_SECTION.id,
          sectionIndex: 0
        })
      })
    );

    expect(response.status).toBe(201);
    expect(createListItem).toHaveBeenCalledTimes(1);
    expect(createListItem).toHaveBeenCalledWith(
      'section-id-16-ch',
      expect.objectContaining({
        name: 'Item name',
        dateDue: new Date('2026-01-01'),
        priority: 'High',
        sectionIndex: 0,
        expectedMs: null
      })
    );
  });

  test('Allows items with no due date when the list has due dates disabled', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListBySectionId).mockResolvedValue(
      new List(
        'List name',
        'Amber',
        [],
        [MOCK_SECTION],
        true,
        false,
        true,
        'list-id'
      )
    );
    vi.mocked(getListMember).mockResolvedValue({
      canAdd: true,
      canAssign: true,
      canComplete: true,
      canRemove: true
    });
    vi.mocked(createListItem).mockResolvedValue(true);

    const response = await POST(
      new Request(ITEM_PATH, {
        method: 'post',
        body: JSON.stringify({
          name: 'Item name',
          priority: 'High',
          sectionId: MOCK_SECTION.id,
          sectionIndex: 0,
          expectedMs: 10000
        })
      })
    );

    expect(response.status).toBe(201);
    expect(createListItem).toHaveBeenCalledTimes(1);
    expect(createListItem).toHaveBeenCalledWith(
      'section-id-16-ch',
      expect.objectContaining({
        name: 'Item name',
        dateDue: null,
        priority: 'High',
        sectionIndex: 0,
        expectedMs: 10000
      })
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify(
            JSON.stringify({
              name: 'Item name',
              dateDue: new Date('2026-01-01'),
              priority: 'High',
              sectionId: MOCK_SECTION.id,
              sectionIndex: 0,
              expectedMs: 10000
            })
          )
        })
      );

      expect(response.status).toBe(401);
      expect(createListItem).not.toHaveBeenCalled();
    });

    test('Rejects requests with malformed bodies', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify({
            invalidField: true
          })
        })
      );

      expect(response.status).toBe(400);
      expect(createListItem).not.toHaveBeenCalled();
    });

    test('Rejects requests to add items to nonexistent lists', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListBySectionId).mockResolvedValue(false);

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify({
            name: 'Item name',
            dateDue: new Date('2026-01-01'),
            priority: 'High',
            sectionId: MOCK_SECTION.id,
            sectionIndex: 0,
            expectedMs: 10000
          })
        })
      );

      expect(response.status).toBe(400);
      expect(createListItem).not.toHaveBeenCalled();
    });

    test('Rejects requests to add items to lists not a member of', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListBySectionId).mockResolvedValue(
        new List(
          'List name',
          'Amber',
          [],
          [MOCK_SECTION],
          true,
          true,
          true,
          'list-id'
        )
      );
      vi.mocked(getListMember).mockResolvedValue(false);

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify({
            name: 'Item name',
            priority: 'High',
            sectionId: MOCK_SECTION.id,
            sectionIndex: 0,
            expectedMs: 10000
          })
        })
      );

      expect(response.status).toBe(400);
      expect(createListItem).not.toHaveBeenCalled();
    });

    test('Rejects requests to add items with insufficient permissions', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListBySectionId).mockResolvedValue(
        new List(
          'List name',
          'Amber',
          [],
          [MOCK_SECTION],
          true,
          true,
          true,
          'list-id'
        )
      );
      vi.mocked(getListMember).mockResolvedValue({
        canAdd: false,
        canAssign: true,
        canComplete: true,
        canRemove: true
      });

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify({
            name: 'Item name',
            priority: 'High',
            sectionId: MOCK_SECTION.id,
            sectionIndex: 0,
            expectedMs: 10000
          })
        })
      );

      expect(response.status).toBe(400);
      expect(createListItem).not.toHaveBeenCalled();
    });

    test('Rejects items with no expected time when the list has time tracking enabled', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListBySectionId).mockResolvedValue(
        new List(
          'List name',
          'Amber',
          [],
          [MOCK_SECTION],
          true,
          true,
          true,
          'list-id'
        )
      );
      vi.mocked(getListMember).mockResolvedValue({
        canAdd: true,
        canAssign: true,
        canComplete: true,
        canRemove: true
      });

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify({
            name: 'Item name',
            dateDue: new Date('2026-01-01'),
            priority: 'High',
            sectionId: MOCK_SECTION.id,
            sectionIndex: 0
          })
        })
      );

      expect(response.status).toBe(400);
      expect(createListItem).not.toHaveBeenCalled();
    });

    test('Rejects items with no due date when the list has due dates enabled', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListBySectionId).mockResolvedValue(
        new List(
          'List name',
          'Amber',
          [],
          [MOCK_SECTION],
          true,
          true,
          true,
          'list-id'
        )
      );
      vi.mocked(getListMember).mockResolvedValue({
        canAdd: true,
        canAssign: true,
        canComplete: true,
        canRemove: true
      });

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify({
            name: 'Item name',
            priority: 'High',
            sectionId: MOCK_SECTION.id,
            sectionIndex: 0,
            expectedMs: 10000
          })
        })
      );

      expect(response.status).toBe(400);
      expect(createListItem).not.toHaveBeenCalled();
    });

    test('Warns the user if adding the item failed', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListBySectionId).mockResolvedValue(
        new List(
          'List name',
          'Amber',
          [],
          [MOCK_SECTION],
          true,
          true,
          true,
          'list-id'
        )
      );
      vi.mocked(getListMember).mockResolvedValue({
        canAdd: true,
        canAssign: true,
        canComplete: true,
        canRemove: true
      });
      vi.mocked(createListItem).mockResolvedValue(false);

      const response = await POST(
        new Request(ITEM_PATH, {
          method: 'post',
          body: JSON.stringify({
            name: 'Item name',
            dateDue: new Date('2026-01-01'),
            priority: 'High',
            sectionId: MOCK_SECTION.id,
            sectionIndex: 0,
            expectedMs: 10000
          })
        })
      );

      expect(response.status).toBe(500);
    });
  });
});
