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

import { InputOption, InputOptionGroup } from '@/components/SearchBar/types';
import List from '@/lib/model/list';
import Tag from '@/lib/model/tag';

/**
 * Builds the list of available filters based on the list's settings (e.g. whether due
 * dates are enabled, so filtering by due dates makes sense).
 *
 * @param list The rich list object (including members, items, etc.), used to check
 *  settings and details
 * @param tagsAvailable All tags associated with the list
 */
export function getFilterOptions(
  list: Omit<List, 'sections'>,
  tagsAvailable: Tag[]
): InputOptionGroup[] {
  const generalOptions: InputOption[] = [
    { type: 'String', label: 'name' },
    {
      type: 'Select',
      label: 'priority',
      selectOptions: [
        { name: 'High', color: 'danger' },
        { name: 'Medium', color: 'warning' },
        { name: 'Low', color: 'success' }
      ]
    },
    { type: 'Select', label: 'tag', selectOptions: tagsAvailable }
  ];

  if (list.members.length > 1)
    generalOptions.push({
      type: 'Select',
      label: 'user',
      selectOptions: list.members.map(member => {
        return { name: member.user.username, color: member.user.color };
      })
    });
  if (list.hasTimeTracking)
    generalOptions.push({
      type: 'Select',
      label: 'status',
      selectOptions: [
        { name: 'Unstarted' },
        { name: 'In_Progress' },
        { name: 'Paused' },
        { name: 'Completed' }
      ]
    });

  const filterOptions: InputOptionGroup[] = [
    { label: 'General', options: generalOptions },
    {
      label: 'Completed',
      options: [
        { type: 'Date', label: 'completedBefore' },
        { type: 'Date', label: 'completedOn' },
        { type: 'Date', label: 'completedAfter' }
      ]
    }
  ];

  if (list.hasDueDates)
    filterOptions.push({
      label: 'Due',
      options: [
        { type: 'Date', label: 'dueBefore' },
        { type: 'Date', label: 'dueOn' },
        { type: 'Date', label: 'dueAfter' }
      ]
    });
  if (list.hasTimeTracking)
    filterOptions.push(
      {
        label: 'Expected Time',
        options: [
          { type: 'Time', label: 'expectedTimeAbove' },
          { type: 'Time', label: 'expectedTimeAt' },
          { type: 'Time', label: 'expectedTimeBelow' }
        ]
      },
      {
        label: 'Elapsed Time',
        options: [
          { type: 'Time', label: 'elapsedTimeAbove' },
          { type: 'Time', label: 'elapsedTimeAt' },
          { type: 'Time', label: 'elapsedTimeBelow' }
        ]
      }
    );

  return filterOptions;
}
