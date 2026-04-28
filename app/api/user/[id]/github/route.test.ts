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

import { error } from 'better-auth/api';

import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import { getIsAccountLinkedToGithub } from '@/lib/database/user';
import { getAccessibleRepositories } from '@/lib/integration/github/account';
import { auth } from '@/lib/auth';

import { GET } from './route';

vi.mock('@/lib/session');
vi.mock('@/lib/database/user');
vi.mock('@/lib/integration/github/account');
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getAccessToken: vi.fn()
    }
  }
}));

const MOCK_USER = new User(
  'user-id',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);

const requestURL = `http://localhost/api/user/${MOCK_USER.id}/github`;

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET', () => {
  test('Fetches Repositories when requestor has is linked to Github', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getIsAccountLinkedToGithub).mockResolvedValue(true);
    vi.mocked(auth.api.getAccessToken).mockResolvedValue({
      accessToken: 'mocktoken',
      accessTokenExpiresAt: undefined,
      scopes: ['none'],
      idToken: 'otherToken'
    });
    vi.mocked(getAccessibleRepositories).mockResolvedValue([]);

    const response = await GET(
      new Request(requestURL, {
        method: 'GET'
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(getIsAccountLinkedToGithub).toHaveBeenCalledExactlyOnceWith(
      MOCK_USER.id
    );
    expect(auth.api.getAccessToken).toHaveBeenCalled();
    expect(getAccessibleRepositories).toHaveBeenCalledExactlyOnceWith(
      'mocktoken'
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);
      vi.mocked(getIsAccountLinkedToGithub).mockResolvedValue(false);

      const response = await GET(
        new Request(requestURL, {
          method: 'GET'
        }),
        { params: Promise.resolve({ id: MOCK_USER.id }) }
      );

      expect(response.status).toBe(401);
      expect(getIsAccountLinkedToGithub).not.toHaveBeenCalled();
    });

    test('Rejects requests for different users', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getIsAccountLinkedToGithub).mockResolvedValue(false);

      const response = await GET(
        new Request(requestURL, {
          method: 'GET'
        }),
        { params: Promise.resolve({ id: 'differentId' }) }
      );

      expect(response.status).toBe(403);
      expect(getIsAccountLinkedToGithub).not.toHaveBeenCalled();
    });

    test('Rejects requests from non-github linked users', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getIsAccountLinkedToGithub).mockResolvedValue(false);
      vi.mocked(auth.api.getAccessToken).mockResolvedValue({
        accessToken: 'mocktoken',
        accessTokenExpiresAt: undefined,
        scopes: ['none'],
        idToken: 'otherToken'
      });

      const response = await GET(
        new Request(requestURL, {
          method: 'GET'
        }),
        { params: Promise.resolve({ id: MOCK_USER.id }) }
      );

      expect(response.status).toBe(400);
      expect(getIsAccountLinkedToGithub).toHaveBeenCalled();
      expect(auth.api.getAccessToken).not.toHaveBeenCalled();
    });

    test('Alerts for server errors from BetterAuth', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getIsAccountLinkedToGithub).mockResolvedValue(true);
      vi.mocked(auth.api.getAccessToken).mockRejectedValue(error);
      vi.mocked(getAccessibleRepositories).mockResolvedValue(false);

      const response = await GET(
        new Request(requestURL, {
          method: 'GET'
        }),
        { params: Promise.resolve({ id: MOCK_USER.id }) }
      );

      expect(response.status).toBe(500);
      expect(getIsAccountLinkedToGithub).toHaveBeenCalledExactlyOnceWith(
        MOCK_USER.id
      );
      expect(auth.api.getAccessToken).toHaveBeenCalled();
      expect(getAccessibleRepositories).not.toHaveBeenCalled();
    });

    test('Alerts for server errors from Github/Octokit', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getIsAccountLinkedToGithub).mockResolvedValue(true);
      vi.mocked(auth.api.getAccessToken).mockResolvedValue({
        accessToken: 'mocktoken',
        accessTokenExpiresAt: undefined,
        scopes: ['none'],
        idToken: 'otherToken'
      });
      vi.mocked(getAccessibleRepositories).mockResolvedValue(false);

      const response = await GET(
        new Request(requestURL, {
          method: 'GET'
        }),
        { params: Promise.resolve({ id: MOCK_USER.id }) }
      );

      expect(response.status).toBe(500);
      expect(getIsAccountLinkedToGithub).toHaveBeenCalledExactlyOnceWith(
        MOCK_USER.id
      );
      expect(auth.api.getAccessToken).toHaveBeenCalled();
      expect(getAccessibleRepositories).toHaveBeenCalledExactlyOnceWith(
        'mocktoken'
      );
    });
  });
});
