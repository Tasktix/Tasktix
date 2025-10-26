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

import ListSection from '@/lib/model/listSection';

import { execute } from './db_connect';

export async function createListSection(
  listId: string,
  listSection: ListSection
): Promise<boolean> {
  const sql = `
    INSERT INTO \`listSections\`(
      \`ls_id\`,
      \`ls_l_id\`,
      \`ls_name\`
    )
    VALUES (:id, :listId, :name);
  `;

  const result = await execute(sql, { listId, ...listSection });

  return !!result;
}

export async function updateListSection(
  id: string,
  name: string
): Promise<boolean> {
  const sql = `
    UPDATE \`listSections\`
    SET \`ls_name\` = name
    WHERE \`ls_id\` = :id;
  `;

  const result = await execute(sql, { id, name });

  return !!result;
}

export async function deleteListSection(id: string): Promise<boolean> {
  const sql = `
    DELETE FROM \`listSections\`
    WHERE \`ls_id\` = :id;
  `;

  const result = await execute(sql, { id });

  return !!result;
}
