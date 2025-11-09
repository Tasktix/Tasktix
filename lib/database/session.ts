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

import { Session } from '@prisma/client';

import { prisma } from './db_connect';

export async function createSession(
  id: string,
  userId: string,
  dateExpire: Date
): Promise<boolean> {
  try {
    await prisma.session.create({
      data: {
        id,
        userId,
        dateExpire
      }
    });
  } catch {
    return false;
  }

  return true;
}

export async function getSessionById(id: string): Promise<Session | false> {
  const result = await prisma.session.findUnique({ where: { id } });

  return result ?? false;
}

export async function deleteSession(id: string): Promise<boolean> {
  try {
    await prisma.session.delete({ where: { id } });
  } catch {
    return false;
  }

  return true;
}
