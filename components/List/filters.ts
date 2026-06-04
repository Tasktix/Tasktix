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

import { FilterConfig } from '@/components/Filter';
import { ListState } from '@/lib/transformations/list/types';

/**
 * Builds the list of available filters based on the list's settings (e.g. whether due
 * dates are enabled, so filtering by due dates makes sense).
 *
 * @param list The rich list object (including members, items, etc.), used to check
 *  settings and details
 */
export function getFilterConfig(list: ListState): FilterConfig[] {
  const generalOptions: FilterConfig[] = [
    { type: 'text', label: 'name' },
    {
      type: 'option',
      label: 'priority',
      options: [
        { name: 'High', color: 'danger' },
        { name: 'Medium', color: 'warning' },
        { name: 'Low', color: 'success' }
      ]
    },
    {
      type: 'multi-option',
      label: 'tag',
      options: list.tags.values().toArray()
    }
  ];

  const memberOptions: FilterConfig[] =
    list.members.size > 1
      ? [
          {
            type: 'multi-option',
            label: 'user',
            options: list.members
              .values()
              .map(member => {
                return {
                  name: member.user.username ?? member.user.name,
                  color: member.user.color
                };
              })
              .toArray()
          }
        ]
      : [];

  const statusOptions: FilterConfig[] = [
    {
      type: 'option',
      label: 'status',
      options: list.hasTimeTracking
        ? [
            { name: 'Unstarted' },
            { name: 'In_Progress' },
            { name: 'Paused' },
            { name: 'Completed' }
          ]
        : [{ name: 'Unstarted' }, { name: 'Completed' }]
    }
  ];

  const completionOptions: FilterConfig[] = [
    { type: 'date', label: 'completed' }
  ];

  const dueOptions: FilterConfig[] = list.hasDueDates
    ? [{ type: 'date', label: 'dueDate' }]
    : [];

  const timeOptions: FilterConfig[] = list.hasTimeTracking
    ? [
        { type: 'time', label: 'expectedTime' },
        { type: 'time', label: 'elapsedTime' }
      ]
    : [];

  return generalOptions.concat(
    memberOptions,
    statusOptions,
    completionOptions,
    dueOptions,
    timeOptions
  );
}
