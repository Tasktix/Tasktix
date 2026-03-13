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

import { NamedColor } from '@/lib/model/color';
import List from '@/lib/model/list';
import ListItem from '@/lib/model/listItem';
import ListMember from '@/lib/model/listMember';
import ListSection from '@/lib/model/listSection';
import Tag from '@/lib/model/tag';

/**
 * Possible actions and the required data needed for updating a list with the list
 * reducer.
 */
export type ListAction =
  | { type: 'SetHasDueDates'; hasDueDates: ListState['hasDueDates'] }
  | {
      type: 'SetHasTimeTracking';
      hasTimeTracking: ListState['hasTimeTracking'];
    }
  | { type: 'SetIsAutoOrdered'; isAutoOrdered: ListState['isAutoOrdered'] }
  | { type: 'SetListColor'; color: ListState['color'] }
  | { type: 'SetListName'; name: ListState['name'] }
  | { type: 'AddTag'; tag: Tag }
  | { type: 'AddSection'; section: ListSection };

export type MemberAction =
  | { type: 'AddMember'; member: ListMemberState }
  | {
      type: 'UpdateMemberPermissions';
      id: string;
      role: string;
    };

export type TagAction =
  | { type: 'UpdateTagColor'; id: string; color: NamedColor }
  | { type: 'UpdateTagName'; id: string; name: string }
  | { type: 'DeleteTag'; id: string };

/**
 * Possible actions and the required data needed for updating a list section with the the
 * list reducer.
 */
export type SectionAction =
  | { type: 'AddItemToSection'; id: string; item: ListItem }
  | {
      type: 'ReorderItem';
      sectionId: string;
      oldIndex: number;
      newIndex: number;
    }
  | { type: 'DeleteSection'; id: string };

/**
 * Possible actions and the required data needed for updating a list item with the the
 * list reducer.
 */
export type ItemAction =
  | { type: 'SetItemName'; id: string; name: ListItem['name'] }
  | { type: 'SetItemDueDate'; id: string; date: ListItem['dateDue'] }
  | { type: 'SetItemPriority'; id: string; priority: ListItem['priority'] }
  | { type: 'SetItemIncomplete'; id: string }
  | {
      type: 'SetItemComplete';
      id: string;
      dateCompleted: ListItem['dateCompleted'];
    }
  | {
      type: 'SetItemExpectedMs';
      id: string;
      expectedMs: ListItem['expectedMs'];
    }
  | { type: 'StartItemTime'; id: string }
  | { type: 'PauseItemTime'; id: string }
  | { type: 'ResetItemTime'; id: string }
  | {
      type: 'LinkTagToItem';
      itemId: string;
      tagId: string;
    }
  | { type: 'UnlinkTagFromItem'; itemId: string; tagId: string }
  | { type: 'DeleteItem'; sectionId: string; id: string };

export type ListMemberState = Omit<ListMember, 'role'> & { role: string };

export type ListItemState = Omit<ListItem, 'assignees' | 'tags'> & {
  assignees: [string, string][];
  tags: string[];
};

/**
 * The state of a list section, as defined and modified by the list reducer.
 */
export type ListSectionState = Omit<ListSection, 'items'> & { items: string[] };

/**
 * The list state, as defined and modified by the list reducer.
 */
export type ListState = Omit<List, 'members' | 'sections' | 'tags'> & {
  members: Map<string, ListMemberState>;
  tags: Map<string, Tag>;
  sections: Map<string, ListSectionState>;
  items: Map<string, ListItemState>;
};
