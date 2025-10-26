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

import ListMember from '@/lib/model/listMember';
import List from '@/lib/model/list';
import Tag from '@/lib/model/tag';

import { execute, query } from './db_connect';
import {
  DB_List,
  extractListFromRow,
  extractListsFromRows
} from './model/list';
import { extractListMemberFromRow } from './model/listMember';
import { DB_Tag, extractTagFromRow } from './model/tag';

export async function createList(list: List): Promise<boolean> {
  const sql = `
    INSERT INTO \`lists\`(
      \`l_id\`,
      \`l_name\`,
      \`l_color\`
    )
    VALUES (:id, :name, :color);
  `;

  const result = await execute(sql, list);

  if (!result) return false;

  for (const member of list.members) {
    const sql = `
      INSERT INTO \`listMembers\`(
        \`lm_u_id\`,
        \`lm_l_id\`,
        \`lm_canAdd\`,
        \`lm_canRemove\`,
        \`lm_canComplete\`,
        \`lm_canAssign\`
      )
      VALUES (:userId, :listId, :canAdd, :canRemove, :canComplete, :canAssign);
    `;

    const result = await execute(sql, {
      ...member,
      userId: member.user.id,
      listId: list.id
    });

    if (!result) return false;
  }

  return true;
}

export async function createTag(listId: string, tag: Tag): Promise<boolean> {
  const sql = `
    INSERT INTO \`tags\`(
      \`t_id\`,
      \`t_name\`,
      \`t_color\`,
      \`t_l_id\`
    )
    VALUES (
      :id,
      :name,
      :color,
      :listId
    );
  `;

  const result = await execute(sql, { listId, ...tag });

  return !!result;
}

export async function getListById(id: string): Promise<List | false> {
  const sql = `
    SELECT * FROM \`lists\`
      LEFT JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
      LEFT JOIN \`users\` ON \`users\`.\`u_id\` = \`listMembers\`.\`lm_u_id\`
      LEFT JOIN \`listSections\` ON \`listSections\`.\`ls_l_id\` = \`lists\`.\`l_id\`
      LEFT JOIN \`items\` ON \`items\`.\`i_ls_id\` = \`listSections\`.\`ls_id\`
      LEFT JOIN \`itemTags\` ON \`itemTags\`.\`it_i_id\` = \`items\`.\`i_id\`
      LEFT JOIN \`tags\` ON \`tags\`.\`t_id\` = \`itemTags\`.\`it_t_id\`
      LEFT JOIN \`itemAssignees\` ON \`itemAssignees\`.\`ia_i_id\` = \`items\`.\`i_id\`
    WHERE \`l_id\` = :id
    ORDER BY \`listSections\`.\`ls_name\` ASC, \`items\`.\`i_id\` ASC;
  `;

  const result = await query<DB_List>(sql, { id });

  if (!result) return false;

  return extractListsFromRows(result)[0];
}

export async function getListBySectionId(id: string): Promise<List | false> {
  const sql = `
    SELECT * FROM \`lists\`
      LEFT JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
      LEFT JOIN \`users\` ON \`users\`.\`u_id\` = \`listMembers\`.\`lm_u_id\`
      LEFT JOIN \`listSections\` ON \`listSections\`.\`ls_l_id\` = \`lists\`.\`l_id\`
      LEFT JOIN \`items\` ON \`items\`.\`i_ls_id\` = \`listSections\`.\`ls_id\`
      LEFT JOIN \`itemTags\` ON \`itemTags\`.\`it_i_id\` = \`items\`.\`i_id\`
      LEFT JOIN \`tags\` ON \`tags\`.\`t_id\` = \`itemTags\`.\`it_t_id\`
      LEFT JOIN \`itemAssignees\` ON \`itemAssignees\`.\`ia_i_id\` = \`items\`.\`i_id\`
    WHERE \`l_id\` IN (
      SELECT \`listSections\`.\`ls_l_id\` FROM \`listSections\`
      WHERE \`listSections\`.\`ls_id\` = :id
    )
    ORDER BY \`listSections\`.\`ls_name\` ASC, \`items\`.\`i_id\` ASC;
  `;

  const result = await query<DB_List>(sql, { id });

  if (!result) return false;

  return extractListsFromRows(result)[0];
}

export async function getListsByUser(id: string): Promise<List[] | false> {
  const sql = `
    SELECT \`lists\`.* FROM \`lists\`
    INNER JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
    WHERE \`listMembers\`.\`lm_u_id\` = :id
    ORDER BY \`lists\`.\`l_name\` ASC;
  `;

  const result = await query<DB_List>(sql, { id });

  if (!result) return false;

  return result.map(extractListFromRow);
}

export async function getListMembersByUser(
  userId: string
): Promise<{ [id: string]: ListMember[] } | false> {
  const sql = `
    SELECT * FROM \`lists\`
      LEFT JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
      LEFT JOIN \`listSections\` ON \`listSections\`.\`ls_l_id\` = \`lists\`.\`l_id\`
    WHERE \`lists\`.\`l_id\` IN (
      SELECT \`listMembers\`.\`lm_l_id\` FROM \`listMembers\`
      WHERE \`listMembers\`.\`lm_u_id\` = :userId
    )
    ORDER BY \`lists\`.\`l_id\` ASC;
  `;

  const result = await query<DB_List>(sql, { userId });

  if (!result) return false;

  const returnVal: { [id: string]: ListMember[] } = {};

  for (const row of result) {
    if (!returnVal[row.l_id])
      returnVal[row.l_id] = [extractListMemberFromRow(row)];
    else returnVal[row.l_id].push(extractListMemberFromRow(row));
  }

  return returnVal;
}

export async function getIsListAssignee(
  userId: string,
  listId: string
): Promise<boolean> {
  const sql = `
    SELECT * FROM \`lists\`
    INNER JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
    WHERE \`listMembers\`.\`lm_u_id\` = :userId
      AND \`lists\`.\`l_id\` = :listId
    ORDER BY \`lists\`.\`l_name\` ASC;
  `;

  const result = await query<DB_List>(sql, { userId, listId });

  return !!(result && result.length);
}

export async function getIsListAssigneeBySection(
  userId: string,
  sectionId: string
): Promise<boolean> {
  const sql = `
    SELECT * FROM \`lists\`
    INNER JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
    INNER JOIN \`listSections\` ON \`listSections\`.\`ls_l_id\` = \`lists\`.\`l_id\`
    WHERE \`listMembers\`.\`lm_u_id\` = :userId
      AND \`listSections\`.\`ls_id\` = :sectionId
    ORDER BY \`lists\`.\`l_name\` ASC;
  `;

  const result = await query<DB_List>(sql, { userId, sectionId });

  return !!(result && result.length);
}

export async function getIsListAssigneeByItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const sql = `
    SELECT * FROM \`lists\`
    INNER JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
    INNER JOIN \`listSections\` ON \`listSections\`.\`ls_l_id\` = \`lists\`.\`l_id\`
    INNER JOIN \`items\` ON \`items\`.\`i_ls_id\` = \`listSections\`.\`ls_id\`
    WHERE \`listMembers\`.\`lm_u_id\` = :userId
      AND \`items\`.\`i_id\` = :itemId
    ORDER BY \`lists\`.\`l_name\` ASC;
  `;

  const result = await query<DB_List>(sql, { userId, itemId });

  return !!(result && result.length);
}

export async function getTagById(id: string): Promise<Tag | false> {
  const sql = `
    SELECT * FROM \`tags\`
    WHERE \`tags\`.\`t_id\` = :id;
  `;

  const result = await query<DB_Tag>(sql, { id });

  if (!result) return false;

  return extractTagFromRow(result[0]);
}

export async function getTagsByUser(
  userId: string
): Promise<{ [id: string]: Tag[] } | false> {
  const sql = `
    SELECT * FROM \`lists\`
      LEFT JOIN \`tags\` ON \`tags\`.\`t_l_id\` = \`lists\`.\`l_id\`
      INNER JOIN \`listMembers\` ON \`listMembers\`.\`lm_l_id\` = \`lists\`.\`l_id\`
    WHERE \`listMembers\`.\`lm_u_id\` = :userId
    ORDER BY \`lists\`.\`l_id\` ASC, \`tags\`.\`t_name\` ASC;
  `;

  const result = await query<DB_Tag>(sql, { userId });

  if (!result) return false;

  const returnVal: { [id: string]: Tag[] } = {};

  for (const row of result) {
    if (!returnVal[row.l_id]) returnVal[row.l_id] = [extractTagFromRow(row)];
    else returnVal[row.l_id].push(extractTagFromRow(row));
  }

  return returnVal;
}

export async function getTagsByListId(id: string): Promise<Tag[] | false> {
  const sql = `
    SELECT * FROM \`tags\`
    WHERE \`tags\`.\`t_l_id\` = :id
    ORDER BY \`tags\`.\`t_name\` ASC;
  `;

  const result = await query<DB_Tag>(sql, { id });

  if (!result) return false;

  return result.map(extractTagFromRow);
}

export async function updateList(list: List): Promise<boolean> {
  const sql = `
    UPDATE \`lists\` 
    SET
      \`l_name\` = :name,
      \`l_color\` = :color,
      \`l_hasTimeTracking\` = :hasTimeTracking,
      \`l_hasDueDates\` = :hasDueDates,
      \`l_isAutoOrdered\` = :isAutoOrdered
    WHERE \`l_id\` = :id;
  `;

  const result = await execute(sql, { ...list });

  return !!result;
}

export async function updateTag(listId: string, tag: Tag): Promise<boolean> {
  const sql = `
    UPDATE \`tags\`
    SET
      \`t_name\` = :name,
      \`t_color\` = :color,
      \`t_l_id\` = :listId
    WHERE \`t_id\` = :id;
  `;

  const result = await execute(sql, { listId, ...tag });

  return !!result;
}

export async function deleteList(id: string): Promise<boolean> {
  const sql = `
  DELETE FROM \`lists\`
  WHERE \`l_id\` = :id;
  `;

  const result = await execute(sql, { id });

  return !!result;
}

export async function deleteTag(id: string): Promise<boolean> {
  const sql = `
  DELETE FROM \`tags\`
  WHERE \`t_id\` = :id;
  `;

  const result = await execute(sql, { id });

  return !!result;
}
