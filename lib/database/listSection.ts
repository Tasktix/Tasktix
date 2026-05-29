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

import { prisma } from './db_connect';

export async function createListSection(
  listId: string,
  section: ListSection
): Promise<string | false> {
  const result = await prisma.listSection.create({
    data: {
      id: section.id,
      name: section.name,
      listId
    }
  });

  return result.id ?? false;
}

/**
 * Gets the listId, the first sectionId, and the count of items in that section
 * for all lists tracking a provided repoId. If a list has no sections, returns
 * placeholders so a section can be created.
 * @param repoId - repoId to query by
 */
export async function getSectionInfoByRepoId(
  repoId: number
): Promise<
  { listId: string; sectionId: string | null; itemCount: number }[] | false
> {
  const results = await prisma.list.findMany({
    where: {
      repoId
    },
    select: {
      id: true,
      sections: {
        take: 1,
        select: {
          id: true,
          _count: {
            select: {
              items: true
            }
          }
        }
      }
    }
  });

  if (!results || results.length === 0) {
    return false;
  }

  return results.map(list => {
    const firstSection = list.sections[0];

    if (!firstSection) {
      return {
        listId: list.id,
        sectionId: null,
        itemCount: 0
      };
    }

    return {
      listId: list.id,
      sectionId: firstSection.id,
      itemCount: firstSection._count.items
    };
  });
}

export async function updateListSection(
  id: string,
  name: string
): Promise<boolean> {
  try {
    await prisma.listSection.update({
      where: { id },
      data: { name }
    });
  } catch {
    return false;
  }

  return true;
}

export async function deleteListSection(id: string): Promise<boolean> {
  try {
    await prisma.listSection.delete({ where: { id } });
  } catch {
    return false;
  }

  return true;
}
