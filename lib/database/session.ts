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

import Session from '@/lib/model/session';

import { execute, query } from './db_connect';
import { DB_Session, extractSessionFromRow } from './model/session';

export async function createSession(session: Session): Promise<boolean> {
  const sql = `
    INSERT INTO \`sessions\`(
      \`s_id\`,
      \`s_u_id\`,
      \`s_dateExpire\`
    )
    VALUES (:id, :userId, :dateExpire);
  `;

  const result = await execute(sql, session);

  return !!result;
}

export async function getSessionById(id: string): Promise<Session | false> {
  const sql = `
    SELECT * FROM \`sessions\`
    WHERE \`s_id\` = :id;
  `;

  const result = await query<DB_Session>(sql, { id });

  if (!result) return false;

  return extractSessionFromRow(result[0]);
}

export async function deleteSession(id: string): Promise<boolean> {
  const sql = `
    DELETE FROM \`sessions\`
    WHERE \`s_id\` = :id;
  `;

  const result = await execute(sql, { id });

  return !!result;
}
