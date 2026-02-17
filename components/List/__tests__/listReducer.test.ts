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

import listReducer from '../listReducer';
import { ListSectionState } from '../types';

test('Throws an error if an ItemAction is requested for a nonexistent list item', () => {
  const list: Omit<List, 'sections'> & {
    sections: Map<string, ListSectionState>;
  } = {
    id: 'list-id',
    name: 'List name',
    color: 'Amber',
    hasDueDates: true,
    hasTimeTracking: true,
    isAutoOrdered: true,
    members: [],
    sections: new Map([
      [
        'section-id',
        { name: 'Section name', items: new Map(), id: 'section-id' }
      ]
    ])
  };

  expect(() =>
    listReducer(
      {
        list,
        tagsAvailable: []
      },
      {
        type: 'SetItemName',
        sectionId: 'section-id',
        id: 'nonexistent',
        name: 'new name'
      }
    )
  ).toThrow('Unable to find item with ID nonexistent in section section-id');
});
