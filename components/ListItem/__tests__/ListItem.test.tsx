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

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroUIProvider } from '@heroui/react';

import api from '@/lib/api';
import ListItemModel from '@/lib/model/listItem';
import User from '@/lib/model/user';
import List from '@/lib/model/list';
import MemberRole from '@/lib/model/memberRole';
import ListMember from '@/lib/model/listMember';
import Assignee from '@/lib/model/assignee';

import ListItem from '../ListItem';

const MOCK_ROLE_CAN_VIEW = new MemberRole(
  'Viewer',
  'No explicit permissions',
  {}
);

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
        item={{ ...item, assignees: [], tags: [] }}
        members={[]}
        sectionId='section-id'
        tags={[]}
        onItemEvent={vi.fn()}
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
  const item = new ListItemModel('Test item', {});

  const { getByText, getByRole } = render(
    <HeroUIProvider disableRipple>
      <ListItem
        addNewTag={vi.fn()}
        hasDueDates={false}
        hasTimeTracking={false}
        item={{ ...item, assignees: [], tags: [] }}
        list={
          new List(
            'List Name',
            'Cyan',
            [],
            [],
            [],
            false,
            false,
            false,
            'list-id'
          )
        }
        members={[]}
        sectionId='section-id'
        tags={[]}
        onItemEvent={vi.fn()}
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
      'user1Id',
      'user one',
      'user1@example.com',
      true,
      new Date(),
      new Date(),
      { color: 'Amber' }
    ),
    new User(
      'user2Id',
      'user two',
      'user2@example.com',
      true,
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
        hasDueDates={false}
        hasTimeTracking={false}
        item={item}
        members={members.map(m => new ListMember(m, MOCK_ROLE_CAN_VIEW))}
        sectionId='section-id'
        tags={[]}
        onItemEvent={vi.fn()}
      />
    </HeroUIProvider>
  );

  expect(getByText('UO')).toBeVisible();
  expect(getByText('UO').parentElement).toHaveClass('bg-amber-500');

  expect(getByText('UT')).toBeVisible();
  expect(getByText('UT').parentElement).toHaveClass('bg-blue-500');
});

it('uses read-only task name text on mobile and keeps inline editing desktop-only', () => {
  const { getByText, getByDisplayValue } = render(
    <HeroUIProvider disableRipple>
      <ListItem
        addNewTag={vi.fn()}
        hasDueDates={false}
        hasTimeTracking={false}
        item={new ListItemModel('Test item', {})}
        members={[]}
        sectionId='section-id'
        tags={[]}
        onItemEvent={vi.fn()}
      />
    </HeroUIProvider>
  );

  expect(getByText('Test item')).toHaveClass('md:hidden');
  expect(getByDisplayValue('Test item')).toBeInTheDocument();
  expect(getByDisplayValue('Test item').closest('span')).toHaveClass('hidden');
  expect(getByDisplayValue('Test item').closest('span')).toHaveClass('md:flex');
});

describe('time tracking interactions', () => {
  async function renderTimeTrackingListItem(
    item: ListItemModel,
    onItemEvent = vi.fn()
  ) {
    vi.resetModules();
    vi.doMock('../Priority', () => ({
      default: ({
        setPriority
      }: {
        setPriority: (priority: 'Low' | 'Medium' | 'High') => void;
      }) => (
        <button
          aria-label='set-priority-high'
          onClick={() => setPriority('High')}
        >
          Set priority
        </button>
      )
    }));
    vi.doMock('../TimeButton', () => ({
      default: ({
        startRunning,
        pauseRunning
      }: {
        startRunning: () => void;
        pauseRunning: () => void;
      }) => (
        <>
          <button aria-label='start-running' onClick={startRunning}>
            Start running
          </button>
          <button aria-label='pause-running' onClick={pauseRunning}>
            Pause running
          </button>
        </>
      )
    }));
    vi.doMock('../More', () => ({
      default: ({ set }: { set: { resetTime: () => void } }) => (
        <button aria-label='reset-time' onClick={set.resetTime}>
          Reset time
        </button>
      )
    }));
    vi.doMock('../ConfirmedTextInput', () => ({
      default: ({ value }: { value: string }) => <span>{value}</span>
    }));
    vi.doMock('../DateInput', () => ({
      default: () => <span>Date input</span>
    }));
    vi.doMock('../ExpectedInput', () => ({
      default: () => <span>Expected input</span>
    }));
    vi.doMock('../ElapsedInput', () => ({
      default: () => <span>Elapsed input</span>
    }));
    vi.doMock('../Tags', () => ({
      default: () => <span>Tags</span>
    }));
    vi.doMock('../Users', () => ({
      default: () => <span>Users</span>
    }));

    const { default: TimeTrackingListItem } = await import('../ListItem');

    render(
      <HeroUIProvider disableRipple>
        <TimeTrackingListItem
          hasTimeTracking
          addNewTag={vi.fn()}
          hasDueDates={false}
          item={{ ...item, assignees: [], tags: [] }}
          members={[]}
          sectionId='section-id'
          tags={[]}
          onItemEvent={onItemEvent}
        />
      </HeroUIProvider>
    );

    return { onItemEvent };
  }

  beforeEach(() => {
    vi.useRealTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
  });

  afterEach(() => {
    vi.doUnmock('../Priority');
    vi.doUnmock('../TimeButton');
    vi.doUnmock('../More');
    vi.doUnmock('../ConfirmedTextInput');
    vi.doUnmock('../DateInput');
    vi.doUnmock('../ExpectedInput');
    vi.doUnmock('../ElapsedInput');
    vi.doUnmock('../Tags');
    vi.doUnmock('../Users');
  });

  it('covers the priority update success path', async () => {
    const user = userEvent.setup();
    const { onItemEvent } = await renderTimeTrackingListItem(
      new ListItemModel('Priority item', { id: 'item-id' })
    );

    await user.click(screen.getByRole('button', { name: 'set-priority-high' }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/item/item-id', {
        priority: 'High'
      });
      expect(onItemEvent).toHaveBeenCalledWith({
        type: 'SetItemPriority',
        id: 'item-id',
        priority: 'High'
      });
    });
  });

  it('covers the start timer success path', async () => {
    const user = userEvent.setup();
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const { onItemEvent } = await renderTimeTrackingListItem(
      new ListItemModel('Start item', {
        id: 'item-id',
        status: 'Unstarted',
        elapsedMs: 0
      })
    );

    await user.click(screen.getByRole('button', { name: 'start-running' }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/item/item-id', {
        dateStarted: new Date('2026-01-01T00:00:00.000Z'),
        status: 'In_Progress'
      });
      expect(onItemEvent).toHaveBeenCalledWith({
        type: 'StartItemTime',
        id: 'item-id'
      });
      expect(setTimeoutSpy).toHaveBeenCalled();
    });
  });

  it('clears an existing timer before starting again', async () => {
    const user = userEvent.setup();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const { onItemEvent } = await renderTimeTrackingListItem(
      new ListItemModel('Restart item', {
        id: 'item-id',
        status: 'In_Progress',
        elapsedMs: 2 * 60 * 1000
      })
    );

    await user.click(screen.getByRole('button', { name: 'start-running' }));

    await waitFor(() => {
      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(onItemEvent).toHaveBeenCalledWith({
        type: 'StartItemTime',
        id: 'item-id'
      });
    });
  });

  it('covers the pause timer success path for a running item', async () => {
    const user = userEvent.setup();
    const { onItemEvent } = await renderTimeTrackingListItem(
      new ListItemModel('Pause item', {
        id: 'item-id',
        status: 'In_Progress',
        elapsedMs: 2 * 60 * 1000
      })
    );

    await user.click(screen.getByRole('button', { name: 'pause-running' }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/item/item-id', {
        dateStarted: null,
        elapsedMs: 2 * 60 * 1000,
        status: 'Paused'
      });
      expect(onItemEvent).toHaveBeenCalledWith({
        type: 'PauseItemTime',
        id: 'item-id'
      });
    });
  });

  it('covers the reset timer success path', async () => {
    const user = userEvent.setup();
    const { onItemEvent } = await renderTimeTrackingListItem(
      new ListItemModel('Reset item', {
        id: 'item-id',
        status: 'Paused',
        elapsedMs: 2 * 60 * 1000
      })
    );

    await user.click(screen.getByRole('button', { name: 'reset-time' }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/item/item-id', {
        dateStarted: null,
        status: 'Unstarted',
        elapsedMs: 0
      });
      expect(onItemEvent).toHaveBeenCalledWith({
        type: 'ResetItemTime',
        id: 'item-id'
      });
    });
  });

  it('covers the initial running-state timer scheduling effect', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    await renderTimeTrackingListItem(
      new ListItemModel('Mounted running item', {
        id: 'item-id',
        status: 'In_Progress',
        elapsedMs: 2 * 60 * 1000
      })
    );

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60005);
  });
});
