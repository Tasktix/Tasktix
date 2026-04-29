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

import { itemHandlerFactory } from '../handlerFactory';

vi.mock(import('framer-motion'), async importOriginal => ({
  ...(await importOriginal()),
  LazyMotion: ({ children }) => <div>{children}</div>
}));

vi.mock('@/lib/api');

vi.mock('../Priority', () => ({
  default: ({
    setPriority
  }: {
    setPriority: (priority: 'Low' | 'Medium' | 'High') => void;
  }) => (
    <button aria-label='set-priority-high' onClick={() => setPriority('High')}>
      Set priority
    </button>
  )
}));

vi.mock('../TimeButton', () => ({
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

vi.mock('../More', () => ({
  default: ({ set }: { set: { resetTime: () => void } }) => (
    <button aria-label='reset-time' onClick={set.resetTime}>
      Reset time
    </button>
  )
}));

vi.mock('../ConfirmedTextInput', () => ({
  default: ({ value }: { value: string }) => <span>{value}</span>
}));

vi.mock('../DateInput', () => ({
  default: () => <span>Date input</span>
}));

vi.mock('../ExpectedInput', () => ({
  default: () => <span>Expected input</span>
}));

vi.mock('../ElapsedInput', () => ({
  default: () => <span>Elapsed input</span>
}));

vi.mock('../Tags', () => ({
  default: () => <span>Tags</span>
}));

vi.mock('../Users', () => ({
  default: () => <span>Users</span>
}));

const ListItem = (await import('../ListItem')).default;

function renderListItem(item: ListItemModel, onItemEvent = vi.fn()) {
  render(
    <HeroUIProvider disableRipple>
      <ListItem
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

beforeAll(() => vi.stubEnv('TZ', 'UTC'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  vi.mocked(api.patch).mockResolvedValue({
    code: 200,
    message: 'Success',
    content: undefined
  });
});

afterAll(() => vi.unstubAllEnvs());

describe('ListItem focused coverage', () => {
  it('covers the priority handler dispatch path directly', async () => {
    const dispatchItemChange = vi.fn();
    const handlers = itemHandlerFactory(
      'item-id',
      'section-id',
      {
        timer: { current: undefined },
        lastTime: { current: new Date('2026-01-01T00:00:00.000Z') },
        setElapsedLive: vi.fn(),
        stopRunning: vi.fn()
      },
      dispatchItemChange
    );

    handlers.setPriority('High');

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/item/item-id', {
        priority: 'High'
      });
      expect(dispatchItemChange).toHaveBeenCalledWith({
        type: 'SetItemPriority',
        id: 'item-id',
        priority: 'High'
      });
    });
  });

  it('covers the priority update success path', async () => {
    const user = userEvent.setup();
    const { onItemEvent } = renderListItem(
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
    const { onItemEvent } = renderListItem(
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
    const { onItemEvent } = renderListItem(
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
    const { onItemEvent } = renderListItem(
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
    const { onItemEvent } = renderListItem(
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

  it('covers the initial running-state timer scheduling effect', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    renderListItem(
      new ListItemModel('Mounted running item', {
        id: 'item-id',
        status: 'In_Progress',
        elapsedMs: 2 * 60 * 1000
      })
    );

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60005);
  });
});
