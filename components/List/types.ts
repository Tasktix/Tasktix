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

import List from '@/lib/model/list';
import ListItem from '@/lib/model/listItem';
import ListSection from '@/lib/model/listSection';
import Tag from '@/lib/model/tag';

/**
 * Possible actions and the required data needed for updating a list with the list
 * reducer.
 */
export type ListAction =
  | { type: 'SetHasDueDates'; hasDueDates: List['hasDueDates'] }
  | { type: 'SetHasTimeTracking'; hasTimeTracking: List['hasTimeTracking'] }
  | { type: 'SetIsAutoOrdered'; isAutoOrdered: List['isAutoOrdered'] }
  | { type: 'SetListColor'; color: List['color'] }
  | { type: 'SetListName'; name: List['name'] }
  | { type: 'SetMembers'; members: List['members'] }
  | { type: 'AddTag'; tag: Tag }
  | { type: 'SetTagsAvailable'; tags: Tag[] }
  | { type: 'AddSection'; section: ListSection };

/**
 * Possible actions and the required data needed for updating a list section with the the
 * list reducer.
 */
export type SectionAction =
  | { type: 'AddItemToSection'; sectionId: string; item: ListItem }
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
  | {
      type: 'SetItemName';
      sectionId: string;
      id: string;
      name: ListItem['name'];
    }
  | {
      type: 'SetItemDueDate';
      sectionId: string;
      id: string;
      date: ListItem['dateDue'];
    }
  | {
      type: 'SetItemPriority';
      sectionId: string;
      id: string;
      priority: ListItem['priority'];
    }
  | { type: 'SetItemIncomplete'; sectionId: string; id: string }
  | {
      type: 'SetItemComplete';
      sectionId: string;
      id: string;
      dateCompleted: ListItem['dateCompleted'];
    }
  | {
      type: 'SetItemExpectedMs';
      sectionId: string;
      id: string;
      expectedMs: ListItem['expectedMs'];
    }
  | { type: 'StartItemTime'; sectionId: string; id: string }
  | { type: 'PauseItemTime'; sectionId: string; id: string }
  | {
      type: 'ResetItemTime';
      sectionId: string;
      id: string;
      status: Extract<ListItem['status'], 'Unstarted' | 'Completed'>;
    }
  | {
      type: 'LinkTagToItem';
      sectionId: string;
      itemId: string;
      tagId: string;
      tagsAvailable: Tag[];
    }
  | { type: 'LinkNewTagToItem'; sectionId: string; itemId: string; tag: Tag }
  | {
      type: 'UnlinkTagFromItem';
      sectionId: string;
      itemId: string;
      tagId: string;
    }
  | { type: 'DeleteItem'; sectionId: string; id: string };

/**
 * The state of a list section, as defined and modified by the list reducer.
 */
export type ListSectionState = Omit<ListSection, 'items'> & {
  items: Map<string, ListItem>;
};

/**
 * The list state, as defined and modified by the list reducer.
 */
export type ListState = {
  list: Omit<List, 'sections'> & {
    sections: Map<string, ListSectionState>;
  };
  tagsAvailable: Tag[];
};
