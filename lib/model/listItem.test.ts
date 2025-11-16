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

jest.mock('../generateId', () => ({
  generateId: jest.fn(() => 'mock-generated-id')
}));

import { generateId } from '../generateId';

import Assignee from './assignee';
import ListItem from './listItem';
import User from './user';
import Tag from './tag';

beforeEach(() => {
  (generateId as jest.Mock).mockClear();
});

describe('ListItem constructor', () => {
  test('Generates an id if none provided', () => {
    const listItem = new ListItem('testListItem', {});

    expect(listItem.id).toBe('mock-generated-id');
    expect(generateId).toHaveBeenCalled();
  });

  test('Uses the provided id', () => {
    const listItem = new ListItem('testListItem', { id: 'provided-id' });

    expect(listItem.id).toBe('provided-id');
    expect(generateId).not.toHaveBeenCalled();
  });

  test('Uses sane defaults for a new item when properties are unspecified', () => {
    const listItem = new ListItem('testListItem', {});

    expect(listItem.status).toBe('Unstarted');
    expect(listItem.priority).toBe('Low');
    expect(listItem.isUnclear).toBe(false);
    expect(listItem.expectedMs).toBe(null);
    expect(listItem.elapsedMs).toBe(0);
    expect(listItem.sectionIndex).toBe(0);
    expect(listItem.dateStarted).toBeNull();
    expect(listItem.dateCompleted).toBeNull();
    expect(listItem.assignees).toHaveLength(0);
    expect(listItem.tags).toHaveLength(0);
    expect(listItem.listId).toBeUndefined();
  });

  test('Assigns all properties correctly', () => {
    const assignees = [
      new Assignee(
        new User(
          'user1',
          'test@example.com',
          'secret',
          new Date(),
          new Date(),
          {}
        ),
        'role-string'
      )
    ];
    const tags = [new Tag('tag1', 'Amber'), new Tag('tag2', 'Cyan')];

    const listItem = new ListItem('testListItem', {
      status: 'Completed',
      priority: 'High',
      isUnclear: true,
      expectedMs: 1000,
      elapsedMs: 500,
      sectionIndex: 1,
      dateCreated: new Date('2021-01-01'),
      dateDue: new Date('2021-01-02'),
      dateStarted: new Date('2021-01-01'),
      dateCompleted: new Date('2021-01-02'),
      assignees,
      tags,
      listId: 'listId',
      id: 'provided-id'
    });

    expect(listItem.name).toBe('testListItem');
    expect(listItem.status).toBe('Completed');
    expect(listItem.priority).toBe('High');
    expect(listItem.isUnclear).toBe(true);
    expect(listItem.expectedMs).toBe(1000);
    expect(listItem.elapsedMs).toBe(500);
    expect(listItem.sectionIndex).toBe(1);
    expect(listItem.dateCreated).toEqual(new Date('2021-01-01'));
    expect(listItem.dateDue).toEqual(new Date('2021-01-02'));
    expect(listItem.dateStarted).toEqual(new Date('2021-01-01'));
    expect(listItem.dateCompleted).toEqual(new Date('2021-01-02'));
    expect(listItem.assignees).toBe(assignees);
    expect(listItem.tags).toBe(tags);
    expect(listItem.listId).toBe('listId');
    expect(listItem.id).toBe('provided-id');
  });
});
