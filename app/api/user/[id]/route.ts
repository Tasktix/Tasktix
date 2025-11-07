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

import { Success, ClientError, ServerError } from '@/lib/Response';
import {
  getUserByUsername,
  getUserByEmail,
  updateUser
} from '@/lib/database/user';
import { ZodUser } from '@/lib/model/user';
import { getUser } from '@/lib/session';

export const dynamic = 'force-dynamic' as const; // defaults to auto

const PatchBody = ZodUser.omit({ id: true, password: true }).partial();

/**
 * Update a user's `username`, `email`, and/or `color`
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();

    if (!user) return ClientError.Unauthenticated('Not logged in');
    if (user.id !== params.id)
      return ClientError.Forbidden('Insufficient permissions');
    const parseResult = PatchBody.safeParse(await request.json());

    if (!parseResult.success)
      return ClientError.BadRequest('Invalid request body');

    const requestBody = parseResult.data;

    if (requestBody.username) {
      if (await getUserByUsername(requestBody.username))
        return ClientError.BadRequest('Username unavailable');
      user.username = requestBody.username;
    }

    if (requestBody.email) {
      if (await getUserByEmail(requestBody.email))
        return ClientError.BadRequest(
          'Another account already uses this email'
        );
      user.email = requestBody.email;
    }

    if (requestBody.color) user.color = requestBody.color;

    const result = await updateUser(user);

    if (!result) return ServerError.Internal('Could not update user');

    return Success.OK('User updated');
  } catch (error: unknown) {
    return ServerError.Internal(error?.toString() ?? 'Internal Server Error');
  }
}
