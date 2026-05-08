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
import Assignee from '@/lib/model/assignee';
import ListItem from '@/lib/model/listItem';
import MemberRole from '@/lib/model/memberRole';
import ListMember from '@/lib/model/listMember';

import { FullState } from './types';

/**
 * Generates the normalized member state (map of member user IDs to member objects) from
 * all List data. Represents the M:1 relationship of member:role by including the role ID
 * but not other role data in the normalized member.
 *
 * @param list The list to extract member data from
 */
export function generateMembersState(list: ListModel): FullState['members'] {
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
export function generateTagsState(list: ListModel): FullState['tags'] {
  return new Map(list.tags.map(tag => [tag.id, tag]));
}

/**
 * Generates the normalized section state (map of section IDs to full section objects)
 * from all List data
 *
 * @param list The list to extract section data from
 */
export function generateSectionsState(list: ListModel): FullState['sections'] {
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
): FullState['sectionItems'] {
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
export function generateItemsState(list: ListModel): FullState['items'] {
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
          assignees: undefined
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
): FullState['itemAssignees'] {
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
export function generateItemTagsState(list: ListModel): FullState['itemTags'] {
  return new Map(
    list.sections.flatMap(section =>
      section.items.map(item => [item.id, item.tags.map(tag => tag.id)])
    )
  );
}

/**
 * Generates a list of full ListMember objects from the normalized state data tracked for
 * lists. That is, this function converts the M:1 relationship of members:roles back to
 * each member's role nested within the member object.
 *
 * @param members The normalized members to convert to ListMember objects
 * @param roles The roles available that `members` may be given
 */
export function stateToMembers(
  members: FullState['members'],
  roles: Map<string, MemberRole>
): ListMember[] {
  return members
    .values()
    .map(member => {
      const role = roles.get(member.role);

      return role ? { ...member, role } : undefined;
    })
    .filter(member => member !== undefined)
    .toArray();
}

/**
 * Generates a list of full Item objects from the normalized state data tracked for lists.
 * That is, this function converts the 1:M relationship of items:assignees and the 1:M
 * relationship of items:tags back to each items's assignees and tags nested within the
 * item object.
 *
 * @param items
 * @param itemAssignees
 * @param itemTags
 * @param allItems
 * @param allMembers
 * @param allTags
 * @returns
 */
export function stateToItems(
  items: string[] | undefined,
  itemAssignees: FullState['itemAssignees'],
  itemTags: FullState['itemTags'],
  allItems: FullState['items'],
  allMembers: FullState['members'],
  allTags: FullState['tags']
): ListItem[] {
  return (
    items
      ?.map(id => allItems.get(id))
      .filter(e => e !== undefined)
      .map(item => ({
        ...item,
        assignees:
          itemAssignees
            .get(item.id)
            ?.map(([assigneeId, role]) => {
              const member = allMembers.get(assigneeId);

              return member ? new Assignee(member.user, role) : undefined;
            })
            .filter(e => e !== undefined) ?? [],
        tags:
          itemTags
            .get(item.id)
            ?.map(tagId => allTags.get(tagId))
            .filter(e => e !== undefined) ?? []
      })) ?? []
  );
}
