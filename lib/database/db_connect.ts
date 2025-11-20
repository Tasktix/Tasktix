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

import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

async function connect(): Promise<mysql.Connection> {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  conn.config.namedPlaceholders = true;

  return conn;
}

export async function query<T extends RowDataPacket>(
  sql: string,
  values: unknown
): Promise<T[] | false> {
  let conn;

  try {
    conn = await connect();

    let result;

    if (values) [result] = await conn.query<T[]>(sql, values);
    else [result] = await conn.query<T[]>(sql);

    await conn.end();

    if (result.length) return result;

    return false;
  } catch {
    try {
      await conn?.end();
    } catch {
      /* Don't let ending the connection cause an error if it's having issues too */
    }

    return false;
  }
}

export async function execute(
  sql: string,
  values: unknown
): Promise<ResultSetHeader | false> {
  let conn;

  try {
    conn = await connect();

    let result;

    if (values) [result] = await conn.execute<ResultSetHeader>(sql, values);
    else [result] = await conn.execute<ResultSetHeader>(sql);

    await conn.end();

    return result;
  } catch {
    try {
      await conn?.end();
    } catch {
      /* Don't let ending the connection cause an error if it's having issues too */
    }

    return false;
  }
}
