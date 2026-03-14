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

export function generateMembersState(list: ListModel): FullState['members'] {
  return new Map(
    list.members.map(member => [
      member.user.id,
      { ...member, role: member.role.id }
    ])
  );
}

export function generateTagsState(list: ListModel): FullState['tags'] {
  return new Map(list.tags.map(tag => [tag.id, tag]));
}

export function generateSectionsState(list: ListModel): FullState['sections'] {
  return new Map(
    list.sections.map(section => [section.id, { ...section, items: undefined }])
  );
}

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

export function generateItemTagsState(list: ListModel): FullState['itemTags'] {
  return new Map(
    list.sections.flatMap(section =>
      section.items.map(item => [item.id, item.tags.map(tag => tag.id)])
    )
  );
}

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
