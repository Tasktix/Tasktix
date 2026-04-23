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

import { Action } from './types';

/**
 * A state reducer for updating the lists the current user has access to
 *
 * @param lists The current state of lists the user has access to
 * @param action The action for modifying the current state:
 *  - Add: The user should have access to another list
 *  - Remove: The user has lost access to a list
 */
export default function listReducer(lists: List[], action: Action) {
  switch (action.type) {
    case 'add':
      if (!action.name || !action.color)
        throw new Error('Missing required action parameters');

      return [
        ...lists,
        new List(action.name, action.color, [], [], true, true, true, action.id)
      ];

    case 'remove':
      return lists.filter(list => list.id !== action.id);
  }
}
