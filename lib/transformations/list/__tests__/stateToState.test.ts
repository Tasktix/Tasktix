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

import { listReducer, sectionReducer } from '../stateToState';
import { ListState } from '../types';

test('Throws an error if an ItemAction is requested for a nonexistent list item', () => {
  const list: ListState = {
    id: 'list-id',
    name: 'List name',
    color: 'Amber',
    hasDueDates: true,
    hasTimeTracking: true,
    isAutoOrdered: true,
    items: new Map(),
    members: new Map(),
    sections: new Map([
      ['section-id', { name: 'Section name', id: 'section-id' }]
    ]),
    tags: new Map(),
    sectionItems: new Map(),
    itemAssignees: new Map(),
    itemTags: new Map(),
    repoId: null
  };

  expect(() =>
    listReducer(list, {
      type: 'SetItemName',
      id: 'nonexistent',
      name: 'new name'
    })
  ).toThrow('Unable to find item with ID nonexistent');
});

test('Decrements section indices for later items when one is deleted', () => {
  const list: ListState = {
    id: 'list-id',
    name: 'List name',
    color: 'Amber',
    hasDueDates: true,
    hasTimeTracking: true,
    isAutoOrdered: true,
    items: new Map([
      [
        'item-1',
        new ListItem('item 1', 'section-id', 'list-id', {
          sectionIndex: 1,
          id: 'item-1'
        })
      ],
      [
        'item-2',
        new ListItem('item 2', 'section-id', 'list-id', {
          sectionIndex: 2,
          id: 'item-2'
        })
      ]
    ]),
    members: new Map(),
    sections: new Map([
      ['section-id', { name: 'Section name', id: 'section-id' }]
    ]),
    tags: new Map(),
    sectionItems: new Map([['section-id', ['item-1', 'item-2']]]),
    itemAssignees: new Map(),
    itemTags: new Map(),
    repoId: null
  };

  const result = sectionReducer(list, {
    type: 'DeleteItem',
    id: 'item-1',
    sectionId: 'section-id'
  });

  expect(result.items.size).toBe(1);
  expect(result.items.has('item-1')).toBe(false);
  expect(result.items.has('item-2')).toBe(true);
  expect(result.sectionItems.get('section-id')).toEqual(['item-2']);

  expect(result.items.get('item-2')?.sectionIndex).toBe(1);
});
