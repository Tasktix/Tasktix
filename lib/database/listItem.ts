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

import ListItem from '@/lib/model/listItem';

import { execute, query } from './db_connect';
import { DB_ListItem, extractListItemsFromRows } from './model/listItem';

export async function createListItem(
  sectionId: string,
  listItem: ListItem
): Promise<boolean> {
  const sql = `
    INSERT INTO \`items\`(
      \`i_id\`,
      \`i_name\`,
      \`i_status\`,
      \`i_priority\`,
      \`i_isUnclear\`,
      \`i_expectedMs\`,
      \`i_elapsedMs\`,
      \`i_parentId\`,
      \`i_ls_id\`,
      \`i_sectionIndex\`,
      \`i_dateCreated\`,
      \`i_dateDue\`,
      \`i_dateStarted\`,
      \`i_dateCompleted\`
    )
    VALUES (
      :id,
      :name,
      :status,
      :priority,
      :isUnclear,
      :expectedMs,
      :elapsedMs,
      NULL,
      :sectionId,
      :sectionIndex,
      :dateCreated,
      :dateDue,
      :dateStarted,
      :dateCompleted
    );
  `;

  const result = await execute(sql, { ...listItem, sectionId });

  return !!result;
}

export async function getListItemById(id: string): Promise<ListItem | false> {
  const sql = `
    SELECT * FROM \`items\`
      LEFT JOIN \`itemTags\` ON \`itemTags\`.\`it_i_id\` = \`items\`.\`i_id\`
      LEFT JOIN \`tags\` ON \`tags\`.\`t_id\` = \`itemTags\`.\`it_t_id\`
      LEFT JOIN \`itemAssignees\` ON \`itemAssignees\`.\`ia_i_id\` = \`items\`.\`i_id\`
    WHERE \`i_id\` = :id
    ORDER BY \`tags\`.\`t_name\` ASC;
  `;

  const result = await query<DB_ListItem>(sql, { id });

  if (!result) return false;

  return extractListItemsFromRows(result)[0];
}

export async function getListItemsByUser(
  userId: string
): Promise<ListItem[] | false> {
  const sql = `
    SELECT * FROM \`items\`
      LEFT JOIN \`itemTags\` ON \`itemTags\`.\`it_i_id\` = \`items\`.\`i_id\`
      LEFT JOIN \`tags\` ON \`tags\`.\`t_id\` = \`itemTags\`.\`it_t_id\`
      LEFT JOIN \`itemAssignees\` ON \`itemAssignees\`.\`ia_i_id\` = \`items\`.\`i_id\`
      INNER JOIN \`listSections\` ON \`listSections\`.\`ls_id\` = \`items\`.\`i_ls_id\`
      INNER JOIN \`lists\` ON \`lists\`.\`l_id\` = \`listSections\`.\`ls_l_id\`
      INNER JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`listSections\`.\`ls_l_id\`
    WHERE \`listMembers\`.\`lm_u_id\` = :userId
    ORDER BY \`items\`.\`i_id\` ASC, \`tags\`.\`t_name\` ASC;
  `;

  const result = await query<DB_ListItem>(sql, { userId });

  if (!result) return false;

  return extractListItemsFromRows(result);
}

export async function linkTag(itemId: string, tagId: string): Promise<boolean> {
  const sql = `
    INSERT INTO \`itemTags\`(
      \`it_i_id\`,
      \`it_t_id\`
    )
    VALUES (
      :itemId,
      :tagId
    );
  `;

  const result = await execute(sql, { itemId, tagId });

  return !!result;
}

export async function linkAssignee(
  itemId: string,
  userId: string,
  role: string
): Promise<boolean> {
  const sql = `
    INSERT INTO \`itemAssignees\`(
      \`ia_i_id\`,
      \`ia_u_id\`,
      \`ia_role\`
    )
    VALUES (
      :itemId,
      :userId,
      :role
    );
  `;

  const result = await execute(sql, { itemId, userId, role });

  return !!result;
}

export async function updateListItem(item: ListItem): Promise<boolean> {
  const sql = `
    UPDATE \`items\` SET 
      \`i_name\` = :name,
      \`i_status\` = :status,
      \`i_priority\` = :priority,
      \`i_isUnclear\` = :isUnclear,
      \`i_expectedMs\` = :expectedMs,
      \`i_elapsedMs\` = :elapsedMs,
      \`i_sectionIndex\` = :sectionIndex,
      \`i_dateCreated\` = :dateCreated,
      \`i_dateDue\` = :dateDue,
      \`i_dateStarted\` = :dateStarted,
      \`i_dateCompleted\` = :dateCompleted
    WHERE \`i_id\` = :id;
  `;

  const result = await execute(sql, { ...item });

  return !!result;
}

export async function updateSectionIndices(
  sectionId: string,
  itemId: string,
  index: number,
  oldIndex: number
): Promise<boolean> {
  const sql = `
    UPDATE \`items\`
    SET \`i_sectionIndex\` = CASE 
      WHEN i_id = :itemId 
        THEN :index
        ELSE \`i_sectionIndex\` ${oldIndex > index ? '+ 1' : '- 1'}
      END
    WHERE i_ls_id = :sectionId
      AND i_sectionIndex >= :indexOne
      AND i_sectionIndex <= :indexTwo;
  `;

  const result = await execute(sql, {
    sectionId,
    itemId,
    index,
    indexOne: Math.min(oldIndex, index),
    indexTwo: Math.max(oldIndex, index)
  });

  return !!result;
}

export async function deleteListItem(id: string): Promise<boolean> {
  const sql = `
    DELETE FROM \`items\`
    WHERE \`i_id\` = :id;
  `;

  const result = await execute(sql, { id });

  return !!result;
}

export async function unlinkTag(
  itemId: string,
  tagId: string
): Promise<boolean> {
  const sql = `
    DELETE FROM \`itemTags\`
    WHERE \`it_i_id\` = :itemId
      AND \`it_t_id\` = :tagId;
  `;

  const result = await execute(sql, { itemId, tagId });

  return !!result;
}

export async function unlinkAssignee(
  itemId: string,
  userId: string
): Promise<boolean> {
  const sql = `
    DELETE FROM \`itemAssignees\`
    WHERE \`ia_i_id\` = :itemId
      AND \`ia_u_id\` = :userId;
  `;

  const result = await execute(sql, { itemId, userId });

  return !!result;
}
