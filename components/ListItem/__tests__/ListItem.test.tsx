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

import { render, within } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import userEvent from '@testing-library/user-event';

import ListItemModel from '@/lib/model/listItem';
import api from '@/lib/api';
import Assignee from '@/lib/model/assignee';
import User from '@/lib/model/user';
import ListMember from '@/lib/model/listMember';
import List from '@/lib/model/list';
import Tag from '@/lib/model/tag';

import ListItem from '../ListItem';

vi.mock(import('framer-motion'), async importOriginal => {
  const originalFramerMotion = await importOriginal();

  return {
    ...originalFramerMotion,
    LazyMotion: ({ children }) => <div>{children}</div>
  };
});

/**
 * Mocking HeroUI Popover because the popover doesn't properly open in tests (presumably a
 * JSDom error). To ensure the popover is "open" and the contents can be pressed, all
 * contents of the popover are always rendered.
 */
vi.mock(
  import('@heroui/react'),
  async importOriginal =>
    ({
      ...(await importOriginal()),
      Popover: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      ),
      PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      ),
      PopoverContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      )
    }) as unknown as typeof import('@heroui/react')
);

vi.mock('@/lib/api');

beforeAll(() => vi.stubEnv('TZ', 'UTC'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

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
        addNewTag={vi.fn()}
        dispatchItemChange={vi.fn()}
        hasDueDates={true}
        hasTimeTracking={true}
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

it('Allows new tags to be created and linked to the item', async () => {
  const item = new ListItemModel('Test item', {});

  vi.mocked(api.post).mockResolvedValue({
    code: 200,
    message: 'Success',
    content: undefined
  });
  const addNewTag = vi.fn(() => Promise.resolve('test-id'));
  const dispatchItemChange = vi.fn();

  const user = userEvent.setup();

  const { getByLabelText } = render(
    <HeroUIProvider disableRipple>
      <ListItem
        addNewTag={addNewTag}
        dispatchItemChange={dispatchItemChange}
        hasDueDates={false}
        hasTimeTracking={false}
        item={item}
        members={[]}
        sectionId='section-id'
        tagsAvailable={[]}
      />
    </HeroUIProvider>
  );

  await user.click(getByLabelText('Update tags'));
  await user.type(getByLabelText('Add tag...'), 'Test tag');
  await user.click(getByLabelText('Pick color'));
  await user.click(getByLabelText('Cyan'));
  await user.click(getByLabelText('Submit'));

  expect(addNewTag).toHaveBeenCalledTimes(1);
  expect(addNewTag).toHaveBeenCalledWith('Test tag', 'Cyan');

  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith(
    `/item/${item.id}/tag/test-id`,
    expect.any(Object)
  );

  expect(dispatchItemChange).toHaveBeenCalledTimes(1);
  expect(dispatchItemChange).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'LinkNewTagToItem',
      sectionId: 'section-id',
      itemId: item.id,
      tag: expect.objectContaining({ name: 'Test tag', color: 'Cyan' }) as Tag
    })
  );
});

describe('Timers', () => {
  it('Updates the database when "Start" is pressed', async () => {
    const item = new ListItemModel('Test item', {
      status: 'Unstarted',
      elapsedMs: 0
    });

    vi.setSystemTime('2026-01-01');
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const dispatchItemChange = vi.fn();

    const user = userEvent.setup();

    const { getByText } = render(
      <HeroUIProvider disableRipple>
        <ListItem
          addNewTag={vi.fn()}
          dispatchItemChange={dispatchItemChange}
          hasDueDates={false}
          hasTimeTracking={true}
          item={item}
          members={[]}
          sectionId='section-id'
          tagsAvailable={[]}
        />
      </HeroUIProvider>
    );

    await user.click(getByText('Start'));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(
      `/item/${item.id}`,
      expect.objectContaining({
        status: 'In_Progress',
        dateStarted: new Date()
      })
    );

    expect(dispatchItemChange).toHaveBeenCalledTimes(1);
    expect(dispatchItemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'StartItemTime',
        sectionId: 'section-id',
        id: item.id
      })
    );

    expect(
      within(getByText('Elapsed').parentElement!).getByText('00:00')
    ).toBeVisible();
  });

  it('Updates the database when "Pause" is pressed', async () => {
    const item = new ListItemModel('Test item', {
      status: 'In_Progress',
      elapsedMs: 2000 * 60
    });

    vi.setSystemTime('2026-01-01');
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const dispatchItemChange = vi.fn();

    const user = userEvent.setup();

    const { getByText } = render(
      <HeroUIProvider disableRipple>
        <ListItem
          addNewTag={vi.fn()}
          dispatchItemChange={dispatchItemChange}
          hasDueDates={false}
          hasTimeTracking={true}
          item={item}
          members={[]}
          sectionId='section-id'
          tagsAvailable={[]}
        />
      </HeroUIProvider>
    );

    await user.click(getByText('Pause'));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(
      `/item/${item.id}`,
      expect.objectContaining({
        status: 'Paused',
        dateStarted: null,
        elapsedMs: 2000 * 60
      })
    );

    expect(dispatchItemChange).toHaveBeenCalledTimes(1);
    expect(dispatchItemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PauseItemTime',
        sectionId: 'section-id',
        id: item.id
      })
    );

    expect(
      within(getByText('Elapsed').parentElement!).getByText('00:02')
    ).toBeVisible();
  });

  it('Updates the database when the timer is reset', async () => {
    const item = new ListItemModel('Test item', {
      status: 'Paused',
      elapsedMs: 2000 * 60
    });

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const dispatchItemChange = vi.fn();

    const user = userEvent.setup();

    const { findByText, getByRole } = render(
      <HeroUIProvider disableRipple>
        <ListItem
          addNewTag={vi.fn()}
          dispatchItemChange={dispatchItemChange}
          hasDueDates={false}
          hasTimeTracking={true}
          item={item}
          members={[]}
          sectionId='section-id'
          tagsAvailable={[]}
        />
      </HeroUIProvider>
    );

    await user.click(getByRole('button', { name: 'Elapsed 00:02' }));
    await user.click(await findByText('Reset'));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(
      `/item/${item.id}`,
      expect.objectContaining({
        status: 'Unstarted',
        dateStarted: null,
        elapsedMs: 0
      })
    );

    expect(dispatchItemChange).toHaveBeenCalledTimes(1);
    expect(dispatchItemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ResetItemTime',
        sectionId: 'section-id',
        id: item.id,
        status: 'Unstarted'
      })
    );
  });

  it("Leaves the item marked complete when the timer is reset after it's completed", async () => {
    const item = new ListItemModel('Test item', {
      status: 'Completed',
      elapsedMs: 2000 * 60,
      dateCompleted: new Date()
    });

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const dispatchItemChange = vi.fn();

    const user = userEvent.setup();

    const { findByText, getByRole } = render(
      <HeroUIProvider disableRipple>
        <ListItem
          addNewTag={vi.fn()}
          dispatchItemChange={dispatchItemChange}
          hasDueDates={false}
          hasTimeTracking={true}
          item={item}
          members={[]}
          sectionId='section-id'
          tagsAvailable={[]}
        />
      </HeroUIProvider>
    );

    await user.click(getByRole('button', { name: 'Elapsed 00:02' }));
    await user.click(await findByText('Reset'));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(
      `/item/${item.id}`,
      expect.objectContaining({
        status: 'Completed'
      })
    );

    expect(dispatchItemChange).toHaveBeenCalledTimes(1);
    expect(dispatchItemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ResetItemTime',
        status: 'Completed'
      })
    );
  });
});
