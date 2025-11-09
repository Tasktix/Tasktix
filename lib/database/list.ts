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

import { Prisma, List, ListMember, Tag } from '@prisma/client';

import { prisma } from './db_connect';

export async function createList(
  list: Prisma.ListCreateInput
): Promise<boolean> {
  try {
    await prisma.list.create({ data: list });
  } catch {
    return false;
  }

  return true;
}

export async function createTag(tag: Prisma.TagCreateInput): Promise<boolean> {
  try {
    await prisma.tag.create({ data: tag });
  } catch {
    return false;
  }

  return true;
}

export async function getListById(id: string): Promise<List | false> {
  const result = await prisma.list.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true
        }
      },
      sections: {
        include: {
          items: {
            include: {
              assignees: true,
              tags: true
            }
          }
        }
      },
      tags: true
    }
  });

  return result ?? false;
}

export async function getListBySectionId(id: string): Promise<List | false> {
  const result = await prisma.list.findFirst({
    where: { sections: { some: { id } } },
    include: {
      members: {
        include: {
          user: true
        }
      },
      sections: {
        include: {
          items: {
            include: {
              assignees: true,
              tags: true
            }
          }
        }
      },
      tags: true
    }
  });

  return result ?? false;
}

export async function getListsByUser(id: string): Promise<List[]> {
  const result = await prisma.list.findMany({
    where: { members: { some: { userId: id } } }
  });

  return result;
}

export async function getListMembersByUser(
  userId: string
): Promise<{ [id: string]: ListMember[] }> {
  const result = await prisma.listMember.findMany({
    where: { userId }
  });

  const returnVal: { [id: string]: ListMember[] } = {};

  for (const member of result) {
    if (!returnVal[member.listId]) returnVal[member.listId] = [member];
    else returnVal[member.listId].push(member);
  }

  return returnVal;
}

export async function getIsListAssignee(
  userId: string,
  listId: string
): Promise<boolean> {
  const result = await prisma.list.count({
    where: { id: listId, members: { some: { userId } } }
  });

  return result > 0;
}

export async function getIsListAssigneeBySection(
  userId: string,
  sectionId: string
): Promise<boolean> {
  const result = await prisma.list.count({
    where: {
      members: { some: { userId } },
      sections: { some: { id: sectionId } }
    }
  });

  return result > 0;
}

export async function getIsListAssigneeByItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const result = await prisma.list.count({
    where: {
      members: { some: { userId } },
      sections: { some: { items: { some: { id: itemId } } } }
    }
  });

  return result > 0;
}

export async function getTagById(id: string): Promise<Tag | false> {
  const result = await prisma.tag.findFirst({
    where: { id }
  });

  return result ?? false;
}

export async function getTagsByUser(
  userId: string
): Promise<{ [id: string]: Tag[] } | false> {
  const result = await prisma.tag.findMany({
    where: { list: { members: { some: { userId: userId } } } }
  });

  if (!result) return false;

  const returnVal: { [id: string]: Tag[] } = {};

  for (const tag of result) {
    if (!returnVal[tag.listId]) returnVal[tag.listId] = [tag];
    else returnVal[tag.listId].push(tag);
  }

  return returnVal;
}

export async function getTagsByListId(id: string): Promise<Tag[] | false> {
  const result = await prisma.tag.findMany({
    where: { listId: id },
    orderBy: { name: 'asc' }
  });

  return result ?? false;
}

export async function updateList(list: List): Promise<boolean> {
  try {
    await prisma.list.update({
      where: { id: list.id },
      data: list
    });
  } catch {
    return false;
  }

  return true;
}

export async function updateTag(tag: Tag): Promise<boolean> {
  try {
    await prisma.tag.update({
      where: { id: tag.id },
      data: tag
    });
  } catch {
    return false;
  }

  return true;
}

export async function deleteList(id: string): Promise<boolean> {
  try {
    await prisma.list.delete({ where: { id } });
  } catch {
    return false;
  }

  return true;
}

export async function deleteTag(id: string): Promise<boolean> {
  try {
    await prisma.tag.delete({ where: { id } });
  } catch {
    return false;
  }

  return true;
}
