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
import ListSection from '@/lib/model/listSection';
import Tag from '@/lib/model/tag';

/**
 * Possible actions and the required data needed for the list reducer.
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
  | { type: 'AddSection'; section: ListSection }
  | { type: 'DeleteSection'; id: string };

/**
 * The list state, as defined and modified by the list reducer.
 */
export type ListState = { list: List; tagsAvailable: Tag[] };
