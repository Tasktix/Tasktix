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

import { execute, query } from './db_connect';
import { DB_User, extractUserFromRow } from './model/user';

export async function createUser(user: User): Promise<boolean> {
  const sql = `
    INSERT INTO \`users\`(
      \`u_id\`,
      \`u_username\`,
      \`u_email\`,
      \`u_password\`,
      \`u_dateCreated\`,
      \`u_dateSignedIn\`
    )
    VALUES (:id, :username, :email, :password, :dateCreated, :dateSignedIn);
  `;

  const result = await execute(sql, user);

  return !!result;
}

export async function updateUser(user: User): Promise<boolean> {
  const sql = `
    UPDATE \`users\`
    SET 
      \`u_username\` = :username,
      \`u_email\` = :email,
      \`u_password\` = :password,
      \`u_dateSignedIn\` = :dateSignedIn
    WHERE \`u_id\` = :id;
  `;

  const result = await execute(sql, user);

  return !!result;
}

export async function getUserById(id: string): Promise<User | false> {
  const sql = `
    SELECT * FROM \`users\`
    WHERE \`u_id\` = :id;
  `;

  const result = await query<DB_User>(sql, { id });

  if (!result) return false;

  return extractUserFromRow(result[0]);
}

export async function getUserByUsername(
  username: string
): Promise<User | false> {
  const sql = `
    SELECT * FROM \`users\`
    WHERE \`u_username\` = :username;
  `;

  const result = await query<DB_User>(sql, { username });

  if (!result) return false;

  return extractUserFromRow(result[0]);
}

export async function getUserByEmail(email: string): Promise<User | false> {
  const sql = `
    SELECT * FROM \`users\`
    WHERE \`u_email\` = :email;
  `;

  const result = await query<DB_User>(sql, { email });

  if (!result) return false;

  return extractUserFromRow(result[0]);
}

export async function getUserBySessionId(id: string): Promise<User | false> {
  interface DB_Session extends DB_User {
    s_id: string;
    s_dateExpire: Date;
  }

  const sql = `
    SELECT * FROM \`users\`
      INNER JOIN \`sessions\` ON \`users\`.\`u_id\` = \`sessions\`.\`s_u_id\`
    WHERE \`s_id\` = :id;
  `;

  const result = await query<DB_Session>(sql, { id });

  if (!result) return false;

  if (result[0].s_dateExpire.getTime() < new Date().getTime()) return false;

  return extractUserFromRow(result[0]);
}
