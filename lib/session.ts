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

import { cookies } from 'next/headers';

import { createSession, deleteSession } from '@/lib/database/session';
import { getUserBySessionId } from '@/lib/database/user';
import Session from '@/lib/model/session';
import User from '@/lib/model/user';

export async function setUser(userId: string): Promise<string | false> {
  const date = new Date();

  date.setDate(date.getDate() + 1);

  const session = new Session(userId, date);

  const result = await createSession(session);

  if (!result) return false;

  cookies().set('user', session.id, { expires: session.dateExpire });

  return session.id;
}

export async function getUser(): Promise<User | false> {
  const sessionId = cookies().get('user')?.value;

  if (!sessionId) return false;

  const user = await getUserBySessionId(sessionId);

  return user;
}

export async function clearUser(): Promise<boolean> {
  const sessionId = cookies().get('user')?.value;

  if (!sessionId) return false;

  const result = await deleteSession(sessionId);

  if (!result) return false;

  cookies().delete('user');

  return true;
}
