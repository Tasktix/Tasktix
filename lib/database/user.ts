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

export async function createUser(user: User): Promise<boolean> {
  try {
    await prisma.user.create({
      data: user
    });
  } catch {
    return false;
  }

  return true;
}

/**
 * Directly Updates a users database object by id.
 * !IMPORTANT: Updating a user object should be generally handled using the BetterAuth API, 
 * ! or via a narrower scoped function than (i.e updateUserColor)   
 * @param user 
 * @returns 
 */
export async function updateUser(user: User): Promise<boolean> {
  const result = await prisma.user.update({
    where: { id: user.id },
    data: user
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

export async function getUserByEmail(email: string): Promise<User | false> {
  const result = await prisma.user.findUnique({ where: { email } });

  return result ?? false;
}

