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
  getListMember,
  updateListMember
} from '@/lib/database/list';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import ListMember from '@/lib/model/listMember';

import { PATCH } from './route';

const MOCK_MEMBER = new ListMember(
  new User(
    "abcdefg",
    "username",
    "email@example.com",
    false,
    new Date(),
    new Date(),
    "Amber",
  ),
  true,
  false,
  true,
  false
);
const MEMBER_PATH =
  `http://localhost/api/list/some-list-id/member/${MOCK_MEMBER.user.id}` as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Allows updating canAdd without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(structuredClone(MOCK_MEMBER));
    vi.mocked(updateListMember).mockResolvedValue(true);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canAdd: false })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(updateListMember).toHaveBeenCalledTimes(1);
    expect(updateListMember).toHaveBeenCalledWith(
      'some-list-id',
      MOCK_MEMBER.user.id,
      expect.anything()
    );
    const options = vi.mocked(updateListMember).mock.calls[0][2];

    expect(options).toEqual(expect.objectContaining({ canAdd: false }));
    expect(options).not.toEqual(expect.objectContaining({ canRemove: true }));
    expect(options).not.toEqual(
      expect.objectContaining({ canComplete: false })
    );
    expect(options).not.toEqual(expect.objectContaining({ canAssign: true }));
  });

  test('Allows updating canRemove without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(structuredClone(MOCK_MEMBER));
    vi.mocked(updateListMember).mockResolvedValue(true);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canRemove: true })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(updateListMember).toHaveBeenCalledTimes(1);
    expect(updateListMember).toHaveBeenCalledWith(
      'some-list-id',
      MOCK_MEMBER.user.id,
      expect.anything()
    );
    const options = vi.mocked(updateListMember).mock.calls[0][2];

    expect(options).toEqual(expect.objectContaining({ canRemove: true }));
    expect(options).not.toEqual(expect.objectContaining({ canAdd: false }));
    expect(options).not.toEqual(
      expect.objectContaining({ canComplete: false })
    );
    expect(options).not.toEqual(expect.objectContaining({ canAssign: true }));
  });

  test('Allows updating canComplete without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(structuredClone(MOCK_MEMBER));
    vi.mocked(updateListMember).mockResolvedValue(true);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canComplete: false })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(updateListMember).toHaveBeenCalledTimes(1);
    expect(updateListMember).toHaveBeenCalledWith(
      'some-list-id',
      MOCK_MEMBER.user.id,
      expect.anything()
    );
    const options = vi.mocked(updateListMember).mock.calls[0][2];

    expect(options).toEqual(expect.objectContaining({ canComplete: false }));
    expect(options).not.toEqual(expect.objectContaining({ canAdd: false }));
    expect(options).not.toEqual(expect.objectContaining({ canRemove: true }));
    expect(options).not.toEqual(expect.objectContaining({ canAssign: true }));
  });

  test('Allows updating canAssign without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(structuredClone(MOCK_MEMBER));
    vi.mocked(updateListMember).mockResolvedValue(true);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canAssign: true })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(updateListMember).toHaveBeenCalledTimes(1);
    expect(updateListMember).toHaveBeenCalledWith(
      'some-list-id',
      MOCK_MEMBER.user.id,
      expect.anything()
    );
    const options = vi.mocked(updateListMember).mock.calls[0][2];

    expect(options).toEqual(expect.objectContaining({ canAssign: true }));
    expect(options).not.toEqual(expect.objectContaining({ canAdd: false }));
    expect(options).not.toEqual(expect.objectContaining({ canRemove: true }));
    expect(options).not.toEqual(
      expect.objectContaining({ canComplete: false })
    );
  });

  test('Allows multiple field updates at the same time', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(structuredClone(MOCK_MEMBER));
    vi.mocked(updateListMember).mockResolvedValue(true);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({
          canAdd: false,
          canRemove: true,
          canComplete: false,
          canAssign: true
        })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(updateListMember).toHaveBeenCalledTimes(1);
    expect(updateListMember).toHaveBeenCalledWith(
      'some-list-id',
      MOCK_MEMBER.user.id,
      expect.objectContaining({
        canAdd: false,
        canRemove: true,
        canComplete: false,
        canAssign: true
      })
    );
  });

  test('Rejects unauthenticated users', async () => {
    vi.mocked(getUser).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canAdd: false })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(updateListMember).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });

  test('Rejects requests to modify lists not a member of', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canAdd: false })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(404);
    expect(updateListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests to modify members not part of the list', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canAdd: false })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(404);
    expect(updateListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests with malformed bodies', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(structuredClone(MOCK_MEMBER));

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ invalidField: true })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(400);
    expect(updateListMember).not.toHaveBeenCalled();
  });

  test('Warns the user if updating the member failed', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_MEMBER.user);
    vi.mocked(getIsListAssignee).mockResolvedValue(true);
    vi.mocked(getListMember).mockResolvedValue(structuredClone(MOCK_MEMBER));
    vi.mocked(updateListMember).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canAdd: false })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_MEMBER.user.id
        })
      }
    );

    expect(response.status).toBe(500);
  });
});
