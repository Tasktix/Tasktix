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

import { prisma } from './db_connect';

export async function createListItem(
  sectionId: string,
  item: Omit<ListItem, 'assignees' | 'tags'>
): Promise<boolean> {
  try {
    await prisma.item.create({
      data: { sectionId, ...item }
    });
  } catch {
    return false;
  }

  return true;
}

export async function getListItemById(id: string): Promise<ListItem | false> {
  const result = await prisma.item.findUnique({
    where: { id },
    include: { tags: true, assignees: { include: { user: true } } }
  });

  return result ?? false;
}

export async function getListItemsByUser(userId: string): Promise<ListItem[]> {
  const result = await prisma.item.findMany({
    where: { section: { list: { members: { some: { userId } } } } },
    include: { tags: true, assignees: { include: { user: true } } }
  });

  return result;
}

export async function linkTag(itemId: string, tagId: string): Promise<boolean> {
  try {
    await prisma.item.update({
      where: { id: itemId },
      data: {
        tags: {
          connect: { id: tagId }
        }
      }
    });
  } catch {
    return false;
  }

  return true;
}

export async function linkAssignee(
  itemId: string,
  userId: string,
  role: string
): Promise<boolean> {
  try {
    await prisma.itemAssignee.create({
      data: {
        itemId,
        userId,
        role
      }
    });
  } catch {
    return false;
  }

  return true;
}

export async function updateListItem(
  item: Omit<ListItem, 'assignees' | 'tags'>
): Promise<boolean> {
  try {
    await prisma.item.update({
      where: { id: item.id },
      data: { ...item, sectionId: undefined }
    });
  } catch {
    return false;
  }

  return true;
}

export async function updateSectionIndices(
  sectionId: string,
  itemId: string,
  index: number,
  oldIndex: number
): Promise<boolean> {
  // Raw SQL preserved here to avoid potential concurrency issues with database writes
  // without slowing things down by using the SERIALIZABLE isolation level
  const indexOne = Math.min(oldIndex, index);
  const indexTwo = Math.max(oldIndex, index);

  // TODO: validate that inline ternary for index works as expected
  try {
    await prisma.$executeRaw`
      UPDATE \`items\`
      SET \`i_sectionIndex\` = CASE 
        WHEN i_id = ${itemId}
          THEN ${index}
          ELSE \`i_sectionIndex\` ${oldIndex > index ? '+ 1' : '- 1'}
        END
      WHERE i_ls_id = ${sectionId}
        AND i_sectionIndex >= ${indexOne}
        AND i_sectionIndex <= ${indexTwo};
    `;
  } catch {
    return false;
  }

  return true;
}

export async function deleteListItem(id: string): Promise<boolean> {
  try {
    await prisma.item.delete({ where: { id } });
  } catch {
    return false;
  }

  return true;
}

export async function unlinkTag(
  itemId: string,
  tagId: string
): Promise<boolean> {
  try {
    await prisma.item.update({
      where: { id: itemId },
      data: {
        tags: {
          disconnect: { id: tagId }
        }
      }
    });
  } catch {
    return false;
  }

  return true;
}

export async function unlinkAssignee(
  itemId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.itemAssignee.delete({
      where: { userId_itemId: { itemId, userId } }
    });
  } catch {
    return false;
  }

  return true;
}
