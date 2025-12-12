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
  createUser,
  getUserByUsername,
  getUserByEmail
} from '@/lib/database/user';
import User, { ZodUser } from '@/lib/model/user';
import { hash } from '@/lib/security/hash';

export const dynamic = 'force-dynamic'; // defaults to auto

const PostBody = ZodUser.omit({ id: true, color: true });

/**
 * Create a new user with `username`, `email`, and `password`
 */
export async function POST(request: Request) {
  try {
    const parseResult = PostBody.safeParse(await request.json());

    if (!parseResult.success)
      return ClientError.BadRequest('Invalid request body');

    const requestBody = parseResult.data;

    const username = requestBody.username;
    const email = requestBody.email;
    const password = requestBody.password;

    if (await getUserByUsername(username))
      return ClientError.BadRequest('Username unavailable');
    if (await getUserByEmail(email))
      return ClientError.BadRequest('Another account already uses this email');

    const user = new User(
      username,
      email,
      await hash(password),
      new Date(),
      new Date(),
      {}
    );

    const result = await createUser(user);

    if (!result) return ServerError.Internal('Could not create user');

    return Success.Created('User Created', `/api/user/${user.id}`);
  } catch (error: unknown) {
    return ServerError.Internal(error?.toString() ?? 'Internal Server Error');
  }
}
