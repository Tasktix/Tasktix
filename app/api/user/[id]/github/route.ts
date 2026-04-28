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

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { getAccessibleRepositories } from '@/lib/integration/github/account';
import { ClientError, ServerError, Success } from '@/lib/Response';
import { getUser } from '@/lib/session';
import { getIsAccountLinkedToGithub } from '@/lib/database/user';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  if (user.id !== id) return ClientError.Forbidden('Insufficient permissions');

  const isLinked = await getIsAccountLinkedToGithub(user.id);

  if (!isLinked) return ClientError.BadRequest('Account not linked to Github');
  const result = await auth.api.getAccessToken({
    body: {
      providerId: 'github'
    },
    headers: await headers()
  });

  if (!result)
    return ServerError.Internal('Failed to find a Github Access Token');

  const repositories = await getAccessibleRepositories(result.accessToken);

  if (!repositories)
    return ServerError.Internal('Failed to fetch accessible repositories');
  const simplifiedRepos = repositories.map(repo => ({
    id: repo.id,
    name: repo.full_name,
    description: repo.description
  }));

  return Success.OK('Fetched Repositories', JSON.stringify(simplifiedRepos));
}
