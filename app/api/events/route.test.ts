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

import { NextRequest } from 'next/server';

import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import { addClient, removeClient } from '@/lib/sse/server';
import { getIsAllListsAssignee } from '@/lib/database/list';

import { GET } from './route';

const MOCK_USER = new User(
  'user-id',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);

const PATH = 'http://localhost/api/events?' as const;

vi.mock('@/lib/database/list');
vi.mock('@/lib/session');
vi.mock('@/lib/sse/server');

beforeEach(vi.resetAllMocks);

describe('GET', () => {
  test("Allows users to subscribe to events on a list they're a member of", async () => {
    const params = new URLSearchParams([['list', 'list-1-id']]);
    const abortController = new AbortController();

    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getIsAllListsAssignee).mockResolvedValue(true);

    const response = await GET(
      new NextRequest(PATH + params.toString(), {
        method: 'get',
        signal: abortController.signal
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Connection')).toBe('keep-alive');

    expect(addClient).toHaveBeenCalledExactlyOnceWith(
      expect.any(ReadableStreamDefaultController),
      ['list-1-id']
    );

    abortController.abort(); // Close stream to clean up resources
  });

  test("Allows users to subscribe to events on several lists they're a member of", async () => {
    const params = new URLSearchParams([
      ['list', 'list-1-id'],
      ['list', 'list-2-id']
    ]);
    const abortController = new AbortController();

    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getIsAllListsAssignee).mockResolvedValue(true);

    const response = await GET(
      new NextRequest(PATH + params.toString(), {
        method: 'get',
        signal: abortController.signal
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Connection')).toBe('keep-alive');

    expect(addClient).toHaveBeenCalledExactlyOnceWith(
      expect.any(ReadableStreamDefaultController),
      expect.arrayContaining(['list-1-id', 'list-2-id'])
    );

    abortController.abort(); // Close stream to clean up resources
  });

  test('Unsubscribes users when they close the connection', async () => {
    const params = new URLSearchParams([['list', 'list-1-id']]);
    const abortController = new AbortController();

    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getIsAllListsAssignee).mockResolvedValue(true);

    const response = await GET(
      new NextRequest(PATH + params.toString(), {
        method: 'get',
        signal: abortController.signal
      })
    );

    abortController.abort();

    expect(response.status).toBe(200);
    expect(removeClient).toHaveBeenCalledOnce();
  });

  describe('Errors', () => {
    test('Rejects requests from unauthenticated users', async () => {
      const params = new URLSearchParams([['list', 'list-1-id']]);
      const abortController = new AbortController();

      vi.mocked(getUser).mockResolvedValue(false);

      const response = await GET(
        new NextRequest(PATH + params.toString(), {
          method: 'get',
          signal: abortController.signal
        })
      );

      expect(response.status).toBe(401);
      expect(response.headers.get('Content-Type')).not.toBe(
        'text/event-stream'
      );

      expect(addClient).not.toHaveBeenCalled();

      abortController.abort(); // Close stream to clean up resources
    });

    test('Rejects requests to subscribe to events on a list not a member of', async () => {
      const params = new URLSearchParams([['list', 'list-1-id']]);
      const abortController = new AbortController();

      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getIsAllListsAssignee).mockResolvedValue(false);

      const response = await GET(
        new NextRequest(PATH + params.toString(), {
          method: 'get',
          signal: abortController.signal
        })
      );

      expect(response.status).toBe(404);
      expect(response.headers.get('Content-Type')).not.toBe(
        'text/event-stream'
      );

      expect(addClient).not.toHaveBeenCalled();

      abortController.abort(); // Close stream to clean up resources
    });
  });
});
