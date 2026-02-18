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
 *
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';

import { render } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';

import ListItemModel from '@/lib/model/listItem';
import Assignee from '@/lib/model/assignee';
import User from '@/lib/model/user';
import ListMember from '@/lib/model/listMember';
import List from '@/lib/model/list';

import ListItem from '../ListItem';

vi.mock(import('framer-motion'), async importOriginal => {
  const originalFramerMotion = await importOriginal();

  return {
    ...originalFramerMotion,
    LazyMotion: ({ children }) => <div>{children}</div>
  };
});

vi.mock('@/lib/api');

beforeAll(() => vi.stubEnv('TZ', 'UTC'));
beforeEach(vi.resetAllMocks);
afterAll(vi.unstubAllEnvs);

it('Shows everything faded and shows the completion date instead of due date when the item is marked completed', () => {
  const item = new ListItemModel('Test item', {
    priority: 'High',
    status: 'Completed',
    expectedMs: 5000 * 60,
    elapsedMs: 2000 * 60,
    dateDue: new Date('2026-01-02'),
    dateCompleted: new Date('2026-01-01')
  });

  const { getAllByLabelText, getByLabelText, getByText, getByRole } = render(
    <HeroUIProvider disableRipple>
      <ListItem
        hasDueDates
        hasTimeTracking
        addNewTag={vi.fn()}
        dispatchItemChange={vi.fn()}
        item={item}
        members={[]}
        sectionId='section-id'
        tagsAvailable={[]}
      />
    </HeroUIProvider>
  );

  expect(getByText('Test item')).toHaveClass('text-foreground/50');
  expect(getByText('Test item')).toHaveClass('line-through');
  expect(getByText('Completed 01/01/2026')).toHaveClass('text-secondary/75');
  expect(getAllByLabelText('Priority', {})[0]).toBeDisabled();
  expect(getByLabelText('Update tags')).toBeDisabled();
  expect(getByRole('button', { name: 'Expected 00:05' })).toBeDisabled();
  expect(getByRole('button', { name: 'Elapsed 00:02' })).toBeDisabled();
  expect(getByText('Resume')).toBeDisabled();
});

it('Displays the associated list when one is provided', () => {
  const { getByText, getByRole } = render(
    <HeroUIProvider disableRipple>
      <ListItem
        addNewTag={vi.fn()}
        dispatchItemChange={vi.fn()}
        hasDueDates={false}
        hasTimeTracking={false}
        item={new ListItemModel('Test item', {})}
        list={
          new List('List Name', 'Cyan', [], [], false, false, false, 'list-id')
        }
        members={[]}
        sectionId='section-id'
        tagsAvailable={[]}
      />
    </HeroUIProvider>
  );

  expect(getByText('List Name')).toBeVisible();
  expect(getByText('List Name').parentElement).toHaveClass('bg-cyan-500/20');
  expect(getByText('List Name').parentElement).toHaveClass('text-cyan-500');
  expect(getByRole('link', { name: 'List Name' })).toHaveAttribute(
    'href',
    '/list/list-id'
  );
});

it('Displays all members assigned to the item', () => {
  const members = [
    new User(
      'user one',
      'user1@example.com',
      'password123',
      new Date(),
      new Date(),
      { color: 'Amber' }
    ),
    new User(
      'user two',
      'user2@example.com',
      'password123',
      new Date(),
      new Date(),
      { color: 'Blue' }
    )
  ];
  const item = new ListItemModel('Test item', {
    assignees: [new Assignee(members[0], ''), new Assignee(members[1], '')]
  });

  const { getByText } = render(
    <HeroUIProvider disableRipple>
      <ListItem
        addNewTag={vi.fn()}
        dispatchItemChange={vi.fn()}
        hasDueDates={false}
        hasTimeTracking={false}
        item={item}
        members={members.map(m => new ListMember(m, true, true, true, true))}
        sectionId='section-id'
        tagsAvailable={[]}
      />
    </HeroUIProvider>
  );

  expect(getByText('UO')).toBeVisible();
  expect(getByText('UO').parentElement).toHaveClass('bg-amber-500');

  expect(getByText('UT')).toBeVisible();
  expect(getByText('UT').parentElement).toHaveClass('bg-blue-500');
});
