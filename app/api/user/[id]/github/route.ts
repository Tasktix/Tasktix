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

import { auth } from '@/lib/auth';
import { getAccessibleRepositories } from '@/lib/integration/github/account';
import { ClientError, ServerError, Success } from '@/lib/Response';
import { getUser } from '@/lib/session';

export const dynamic = 'force-dynamic'; // defaults to auto

/**
 * Fetches the Github repositories available for a given user who has linked
 * their account with Github. Will automatically refresh an access Token via
 * BetterAuth methods if it has expired and we have a valid refreshToken
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  if (user.id !== id) return ClientError.Forbidden('Insufficient permissions');

  let accessToken: string | undefined;

  try {
    const response = await auth.api.getAccessToken({
      body: {
        providerId: 'github'
      },
      headers: request.headers
    });

    accessToken = response.accessToken;
  } catch (error) {
    console.error('BetterAuth API Error:', error);

    return ClientError.NotFound('Failed to fetch valid GitHub Access Token');
  }
  const repositories = await getAccessibleRepositories(accessToken);

  if (!repositories)
    return ServerError.BadGateway('Failed to fetch accessible repositories');

  return Success.OK('Fetched Repositories', JSON.stringify(repositories));
}
