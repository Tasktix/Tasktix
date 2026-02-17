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

import { DragControls } from 'framer-motion';
import { ActionDispatch } from 'react';

import { NamedColor } from '@/lib/model/color';
import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';
import List from '@/lib/model/list';
import ListMember from '@/lib/model/listMember';
import { ItemAction } from '@/components/List';

import { itemHandlerFactory } from './handlerFactory';

/**
 * Parameters expected for a ListItem component
 */
export interface ListItemParams {
  sectionId: string;
  item: ListItem;
  list?: List;
  members: ListMember[];
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  reorderControls?: DragControls;
  dispatchItemChange: ActionDispatch<[action: ItemAction]>;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}

export type ItemHandlers = ReturnType<typeof itemHandlerFactory>;

/**
 * The interface for functions for controlling the ListItem component's internal timer
 * state
 */
export interface SetItem {
  startedRunning: () => void;
  pausedRunning: () => void;
  resetTime: () => void;
}
