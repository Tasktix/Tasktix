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

import ListModel from '@/lib/model/list';

import { ItemGroupState, ListState } from './types';

/**
 * Generates the normalized member state (map of member user IDs to member objects) from
 * all List data. Represents the M:1 relationship of member:role by including the role ID
 * but not other role data in the normalized member.
 *
 * @param list The list to extract member data from
 */
export function generateMembersState(list: ListModel): ListState['members'] {
  return new Map(
    list.members.map(member => [
      member.user.id,
      { ...member, role: member.role.id }
    ])
  );
}

/**
 * Generates the normalized tag state (map of tag IDs to full tag objects) from all List
 * data
 *
 * @param list The list to extract tag data from
 */
export function generateTagsState(list: ListModel): ListState['tags'] {
  return new Map(list.tags.map(tag => [tag.id, tag]));
}

/**
 * Generates the normalized section state (map of section IDs to full section objects)
 * from all List data
 *
 * @param list The list to extract section data from
 */
export function generateSectionsState(list: ListModel): ListState['sections'] {
  return new Map(
    list.sections.map(section => [section.id, { ...section, items: undefined }])
  );
}

/**
 * Generates the 1:M normalized mapping of sections to the items they contain (map of
 * section IDs to the item IDs of all items in each section) from all List data
 *
 * @param list The list to extract section:item mapping data from
 */
export function generateSectionItemsState(
  list: ListModel
): ListState['sectionItems'] {
  return new Map(
    list.sections.map(section => [
      section.id,
      section.items.map(item => item.id)
    ])
  );
}

/**
 * Generates the normalized item state (map of item IDs to full item objects) from all
 * List data
 *
 * @param list The list to extract item data from
 */
export function generateItemsState(list: ListModel): ListState['items'] {
  return new Map(
    list.sections.flatMap(section =>
      section.items.map(item => [
        item.id,
        {
          ...item,
          dateCreated: new Date(item.dateCreated),
          dateDue: item.dateDue ? new Date(item.dateDue) : null,
          dateStarted: item.dateStarted ? new Date(item.dateStarted) : null,
          dateCompleted: item.dateCompleted
            ? new Date(item.dateCompleted)
            : null,
          tags: undefined,
          assignees: undefined,
          listId: list.id
        }
      ])
    )
  );
}

/**
 * Generates the 1:M normalized mapping of items to the assignees they contain (map of
 * item IDs to the assignee IDs of all assignees in each item) from all List data
 *
 * @param list The list to extract item:assignee mapping data from
 */
export function generateItemAssigneesState(
  list: ListModel
): ListState['itemAssignees'] {
  return new Map(
    list.sections.flatMap(section =>
      section.items.map(item => [
        item.id,
        item.assignees.map(assignee => [assignee.user.id, assignee.role])
      ])
    )
  );
}

/**
 * Generates the 1:M normalized mapping of items to the tags they contain (map of item IDs
 * to the tag IDs of all tags in each item) from all List data
 *
 * @param list The list to extract item:tag mapping data from
 */
export function generateItemTagsState(list: ListModel): ListState['itemTags'] {
  return new Map(
    list.sections.flatMap(section =>
      section.items.map(item => [item.id, item.tags.map(tag => tag.id)])
    )
  );
}

export function generateListSectionsState(
  lists: ListModel[]
): ItemGroupState['listSections'] {
  return new Map(
    lists.map(list => [list.id, list.sections.map(section => section.id)])
  );
}

export function generateListMembersState(
  lists: ListModel[]
): ItemGroupState['listMembers'] {
  return new Map(
    lists.map(list => [list.id, list.members.map(member => member.user.id)])
  );
}

export function generateListTagsState(
  lists: ListModel[]
): ItemGroupState['listTags'] {
  return new Map(lists.map(list => [list.id, list.tags.map(tag => tag.id)]));
}

export function generateListsState(
  lists: ListModel[]
): ItemGroupState['lists'] {
  return new Map(
    lists.map(list => [
      list.id,
      {
        id: list.id,
        name: list.name,
        color: list.color,
        hasTimeTracking: list.hasTimeTracking,
        hasDueDates: list.hasDueDates,
        isAutoOrdered: list.isAutoOrdered,
        repoId: list.repoId
      }
    ])
  );
}
