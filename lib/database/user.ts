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

'use server';

import User from '@/lib/model/user';

import { prisma } from './db_connect';

/**
 * Updates a user Color in the database
 * Custom implementation necessary because BetterAuth doesn't provide API for modifying custom Fields
 * @param user the user to update the color of. the new Color should be set on this User object
 */
export async function updateUserColor(user: User): Promise<boolean> {
  const result = await prisma.user.update({
    where: { id: user.id },
    data: { color: user.color }
  });

  return Boolean(result);
}

export async function getUserById(id: string): Promise<User | false> {
  const result = await prisma.user.findUnique({ where: { id } });

  return result ?? false;
}

export async function getUserByUsername(
  username: string
): Promise<User | false> {
  const result = await prisma.user.findUnique({ where: { username } });

  return result ?? false;
}

/**
 * Returns a User object associated with email
 * Custom Implementation as querying an email is not supported by betterauth
 * @param email The email to query for
 */
export async function getUserByEmail(email: string): Promise<User | false> {
  const result = await prisma.user.findUnique({ where: { email } });

  return result ?? false;
}
