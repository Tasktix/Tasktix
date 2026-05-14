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

import MemberRole from '@/lib/model/memberRole';
import User from '@/lib/model/user';
import ListMember from '@/lib/model/listMember';
import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';
import ListSection from '@/lib/model/listSection';
import List from '@/lib/model/list';
import Assignee from '@/lib/model/assignee';

import { stateToItems, stateToMembers } from '../fromState';
import {
  generateItemsState,
  generateMembersState,
  generateTagsState
} from '../toState';
import { ListMemberState } from '../types';

const user1 = new User(
  'user-1-id-1234',
  'user1',
  'user1@example.com',
  true,
  new Date('2024-01-01T00:00:00Z'),
  new Date('2024-01-01T00:00:00Z'),
  { color: 'Violet' }
);
const user2 = new User(
  'user-2-id-1234',
  'user2',
  'user2@example.com',
  true,
  new Date('2024-01-01T00:00:00Z'),
  new Date('2024-01-01T00:00:00Z'),
  { color: 'Violet' }
);

const role1 = new MemberRole('Viewer', 'Only views', { id: 'role-1-id-1234' });
const role2 = new MemberRole('Admin', 'Everything', { id: 'role-2-id-1234' });

const member1 = new ListMember(user1, role1);
const member2 = new ListMember(user2, role2);

const tag1 = new Tag('Tag One', 'Violet', 'tag-1-id-1234');
const tag2 = new Tag('Tag Two', 'Orange', 'tag-2-id-1234');

const item1 = new ListItem('item', {
  id: 'item-1-id-1234',
  sectionId: 'section-1-id-1234',
  dateCreated: new Date('2024-01-02T00:00:00Z'),
  dateDue: new Date('2025-01-01T00:00:00Z')
});
const item2 = new ListItem('item', {
  id: 'item-2-id-1234',
  sectionId: 'section-1-id-1234',
  dateCreated: new Date('2024-01-03T00:00:00Z'),
  dateDue: null,
  dateStarted: new Date('2024-01-04T00:00:00Z'),
  dateCompleted: new Date('2024-01-05T00:00:00Z')
});

const section1 = new ListSection(
  'section',
  [item1, item2],
  'section-1-id-1234'
);

const list = new List(
  'Test list',
  'Blue',
  [member1, member2],
  [section1],
  [tag1, tag2],
  false,
  true,
  false,
  'list-1-id-1234'
);

describe('stateToMembers', () => {
  test('returns ListMember objects and filters out members with missing roles', () => {
    const membersState = new Map<string, ListMemberState>([
      [user1.id, { user: user1, role: role1.id }],
      [user2.id, { user: user2, role: 'missing-role' }]
    ]);
    const roles = new Map<string, MemberRole>([[role1.id, role1]]);

    const result = stateToMembers(membersState, roles);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ user: user1, role: role1 });
    expect(result[0].role).toBeInstanceOf(MemberRole);
  });
});

describe('stateToItems', () => {
  test('returns empty array when items list is undefined', () => {
    const items = generateItemsState(list);
    const members = generateMembersState(list);
    const tags = generateTagsState(list);

    const result = stateToItems(
      undefined,
      new Map(),
      new Map(),
      items,
      members,
      tags
    );

    expect(result).toEqual([]);
  });

  test('filters missing items, missing members, and missing tags', () => {
    const items = generateItemsState(list);
    const members = generateMembersState(list);
    const tags = generateTagsState(list);

    const missingUserId = 'missing-user-id';
    const missingTagId = 'missing-tag-id';

    const itemAssignees = new Map<string, [string, string][]>([
      [
        item1.id,
        [
          [user1.id, role1.id],
          [missingUserId, role1.id]
        ]
      ]
    ]);

    const itemTags = new Map<string, string[]>([
      [item1.id, [tag1.id, missingTagId]]
    ]);

    const result = stateToItems(
      [item1.id, item2.id, 'missing-item-id'],
      itemAssignees,
      itemTags,
      items,
      members,
      tags
    );

    expect(result).toHaveLength(2);

    const result1 = result.find(r => r.id === item1.id);
    const result2 = result.find(r => r.id === item2.id);

    expect(result1).toBeDefined();
    expect(result1?.assignees).toHaveLength(1);
    expect(result1?.assignees[0]).toBeInstanceOf(Assignee);
    expect((result1?.assignees[0] as Assignee).user).toBe(user1);
    expect(result1?.tags).toEqual([tag1]);

    expect(result2).toBeDefined();
    expect(result2?.assignees).toEqual([]);
    expect(result2?.tags).toEqual([]);
  });
});
