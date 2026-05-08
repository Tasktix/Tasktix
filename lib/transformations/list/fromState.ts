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

import Assignee from '@/lib/model/assignee';
import ListItem from '@/lib/model/listItem';
import ListMember from '@/lib/model/listMember';
import MemberRole from '@/lib/model/memberRole';

import { ListState } from './types';

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
  itemAssignees: ListState['itemAssignees'],
  itemTags: ListState['itemTags'],
  allItems: ListState['items'],
  allMembers: ListState['members'],
  allTags: ListState['tags']
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
} /**
 * Generates a list of full ListMember objects from the normalized state data tracked for
 * lists. That is, this function converts the M:1 relationship of members:roles back to
 * each member's role nested within the member object.
 *
 * @param members The normalized members to convert to ListMember objects
 * @param roles The roles available that `members` may be given
 */
export function stateToMembers(
  members: ListState['members'],
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
