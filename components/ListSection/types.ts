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

import ListItem from '@/lib/model/listItem';

/**
 * Extends ListItem to include a visual index for use with dragging. This property
 * indicates the item's index within the list, allowing the item to switch places with
 * other items when dragged past them. This is kept separate from the sectionIndex
 * property so that only 1 API call is needed (when the dragging interaction is completed)
 * to update the index of the list item in the database.
 */
export interface Item extends ListItem {
  visualIndex: number;
}

/**
 * Possible actions and the required data needed for the section reducer.
 */
export type SectionAction =
  | { type: 'SetIsCollapsed'; isCollapsed: boolean }
  | { type: 'SetItems'; items: Map<string, Item> }
  | { type: 'AddItem'; item: Item }
  | { type: 'ReorderItem'; oldIndex: number; newIndex: number }
  | {
      type: 'SetItemExpectedMs';
      itemId: string;
      expectedMs: ListItem['expectedMs'];
    }
  | { type: 'SetItemDueDate'; itemId: string; date: ListItem['dateDue'] }
  | { type: 'SetItemPriority'; itemId: string; priority: ListItem['priority'] }
  | {
      type: 'SetItemComplete';
      itemId: string;
      dateCompleted: ListItem['dateCompleted'];
    }
  | { type: 'StartItemTime'; itemId: string }
  | { type: 'PauseItemTime'; itemId: string }
  | {
      type: 'ResetItemTime';
      itemId: string;
      status: Extract<ListItem['status'], 'Unstarted' | 'Completed'>;
    }
  | { type: 'DeleteItem'; itemId: string };

/**
 * The list section state, as defined and modified by the section reducer.
 */
export type State = { items: Map<string, Item>; isCollapsed: boolean };
