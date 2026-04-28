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

import { Octokit } from 'octokit';
import { Endpoints } from '@octokit/types';
import 'server-only';

type ListRepositoriesResponse =
  Endpoints['GET /user/installations/{installation_id}/repositories']['response']['data'];

/**
 * Fetches the repositories made available to a Github App installation by a
 * User Access Token. This function returns the full object provided by the
 * Github REST API, which should often be filtered as it contains far more
 * information than needed for any Tasktix use case.
 * @param accessToken
 */
export async function getAccessibleRepositories(
  accessToken: string
): Promise<ListRepositoriesResponse['repositories'] | false> {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const installations = await octokit.request('GET /user/installations', {
      headers: {
        'X-GitHub-Api-Version': '2026-03-10'
      }
    });

    if (
      installations.status !== 200 ||
      installations.data.installations.length < 1
    ) {
      return false;
    }

    // Only Fetch repositories for installation 0, this should handle most use
    // cases, without n+1 network requests
    const installationId = installations.data.installations[0].id;
    const repos = await octokit.request(
      'GET /user/installations/{installation_id}/repositories',
      {
        installation_id: installationId,
        headers: {
          'X-GitHub-Api-Version': '2026-03-10'
        }
      }
    );

    return repos.data.repositories ?? false;
  } catch (error) {
    console.error('GitHub API Error:', error);

    return false;
  }
}
