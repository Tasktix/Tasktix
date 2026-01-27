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
  getUserByEmail,
  updateUserColor
} from '@/lib/database/user';
import { ZodUser } from '@/lib/model/user';
import { getUser } from '@/lib/session';
import { auth } from '@/lib/auth';
import z from 'zod';

export const dynamic = 'force-dynamic'; // defaults to auto

const PatchBody = ZodUser.omit({ id: true, legacyPassword: true }).extend({ oldPassword: z.string().min(10).max(128), newPassword: z.string().min(10).max(128)}).partial();

/**
 * Update a user's `username`, `email`, `password` and/or `color`
 *
 * @param params.id The user to update (must match the logged-in user)
 * @param request.username The new username to use
 * @param request.oldPassword The users current password
 * @param request.newPassword The new password to use
 * @param request.email The new email address to use
 * @param request.color The new profile color to use
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await getUser();

    if (!user) return ClientError.Unauthenticated('Not logged in');
    if (user.id !== id)
      return ClientError.Forbidden('Insufficient permissions');
    const parseResult = PatchBody.safeParse(await request.json());

    if (!parseResult.success)
      return ClientError.BadRequest('Invalid request body');

    const requestBody = parseResult.data;

    if (requestBody.username) {
      const res = await auth.api.isUsernameAvailable({
        body: {
          username: requestBody.username
          },
          headers: request.headers
        });
        if (!res.available) {
          return ClientError.BadRequest('Username unavailable');
        }

        const result = await auth.api.updateUser({
          body: {
            username: requestBody.username,
          },
          headers: request.headers
        });
        if (!result.status){
          return ServerError.Internal("Failed to update username");
        }
    }

    if (requestBody.email) {
        if(await getUserByEmail(requestBody.email))
          return ClientError.BadRequest(
            'Another account already uses this email'
        );
        const result = await auth.api.changeEmail({
          body: {
            newEmail: requestBody.email
          },
          headers: request.headers
        })
        if(!result.status){
          return ServerError.Internal("Failed to update email");
        }
    }
    if (requestBody.newPassword) {
      const allowed = await auth.api.verifyPassword({
        body: { password: requestBody.oldPassword },
        headers: request.headers
      })
      if(!allowed.status){
        return ClientError.BadRequest("Incorrect Password");
      }
      const result = await auth.api.changePassword({
        body: { 
            newPassword: requestBody.newPassword,
            currentPassword: requestBody.oldPassword,
            revokeOtherSessions: true,
          },
        headers: request.headers
      })
      if(!result){
        return ServerError.Internal("Failed to update password");
      }

    }
    if (requestBody.color) {
      user.color = requestBody.color;
      const result = await updateUserColor(user);
      if (!result) {
        return ServerError.Internal('Could not update user Color');
      }
    }

    return Success.OK('User updated');
  } catch (error: unknown) {
    return ServerError.Internal(error?.toString() ?? 'Internal Server Error');
  }
}
