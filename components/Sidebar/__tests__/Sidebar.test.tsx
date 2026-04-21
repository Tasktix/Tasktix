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
import { Dispatch } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroUIProvider, addToast } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import Sidebar from '@/components/Sidebar/Sidebar';
import { ListContext } from '@/components/Sidebar/listContext';
import { Action } from '@/components/Sidebar/types';
import api from '@/lib/api';
import { randomNamedColor } from '@/lib/color';
import { addToastForError } from '@/lib/error';
import List from '@/lib/model/list';
import { validateListName } from '@/lib/validate';

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  usePathname: vi.fn(),
  useRouter: vi.fn()
}));

vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));

vi.mock('@/lib/api');
vi.mock('@/lib/color', async importOriginal => ({
  ...(await importOriginal()),
  randomNamedColor: vi.fn()
}));
vi.mock('@/lib/error', async importOriginal => ({
  ...(await importOriginal()),
  addToastForError: vi.fn()
}));
vi.mock('@/lib/validate', async importOriginal => ({
  ...(await importOriginal()),
  validateListName: vi.fn()
}));

function createRouterMock(): AppRouterInstance & {
  push: ReturnType<typeof vi.fn>;
} {
  return {
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn()
  } as unknown as AppRouterInstance & {
    push: ReturnType<typeof vi.fn>;
  };
}

function renderSidebar({
  lists = [],
  pathname = '/list',
  onNavigate = vi.fn(),
  dispatchEvent = vi.fn<Dispatch<Action>>(),
  routerMock = createRouterMock()
}: {
  lists?: List[];
  pathname?: string;
  onNavigate?: () => void;
  dispatchEvent?: Dispatch<Action>;
  routerMock?: AppRouterInstance & { push: ReturnType<typeof vi.fn> };
} = {}) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useRouter).mockReturnValue(routerMock);

  render(
    <HeroUIProvider disableRipple>
      <ListContext.Provider value={dispatchEvent}>
        <Sidebar lists={lists} onNavigate={onNavigate} />
      </ListContext.Provider>
    </HeroUIProvider>
  );

  return { onNavigate, dispatchEvent };
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.mocked(validateListName).mockImplementation(name => [true, name]);
    vi.mocked(randomNamedColor).mockReturnValue('Cyan');
  });

  it('renders list links and marks the active nav item', () => {
    renderSidebar({
      pathname: '/list/a-list-id',
      lists: [
        new List('Zebra', 'Blue', [], [], [], false, false, false, 'z-list-id'),
        new List('Alpha', 'Amber', [], [], [], false, false, false, 'a-list-id')
      ]
    });

    const links = screen.getAllByRole('link');

    expect(links.map(link => link.textContent)).toEqual(
      expect.arrayContaining(['Today', 'Alpha', 'Zebra'])
    );
    expect(
      screen.getByRole('link', { name: 'Alpha' }).closest('span')
    ).toHaveClass('border-primary');
    expect(
      screen.getByRole('link', { name: 'Zebra' }).closest('span')
    ).toHaveClass('border-transparent');
  });

  it('creates a new list and updates navigation state after submit', async () => {
    const user = userEvent.setup();
    const dispatchEvent = vi.fn();
    const routerMock = createRouterMock();

    vi.mocked(api.post).mockResolvedValue({
      code: 201,
      message: 'Created',
      content: '/list/generated-id'
    });

    renderSidebar({ dispatchEvent, routerMock });

    await user.click(screen.getByRole('button'));

    const input = await screen.findByPlaceholderText('List name');

    await user.type(input, 'New List');
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/list', {
        name: 'New List',
        color: 'Cyan'
      });
      expect(routerMock.push).toHaveBeenCalledWith('/list/generated-id');
      expect(dispatchEvent).toHaveBeenCalledWith({
        type: 'add',
        id: 'generated-id',
        name: 'New List',
        color: 'Cyan'
      });
    });
  });

  it('shows a toast instead of navigating when the new list response has no id', async () => {
    const user = userEvent.setup();
    const dispatchEvent = vi.fn();
    const routerMock = createRouterMock();

    vi.mocked(api.post).mockResolvedValue({
      code: 201,
      message: 'Created',
      content: '/list/'
    });

    renderSidebar({ dispatchEvent, routerMock });

    await user.click(screen.getByRole('button'));

    const input = await screen.findByPlaceholderText('List name');

    await user.type(input, 'Broken List');
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title: 'No list ID returned',
        color: 'danger'
      });
    });

    expect(routerMock.push).not.toHaveBeenCalled();
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('forwards list creation errors to the shared toast helper', async () => {
    const user = userEvent.setup();
    const exampleError = new Error('Request failed');

    vi.mocked(api.post).mockRejectedValue(exampleError);

    renderSidebar();

    await user.click(screen.getByRole('button'));

    const input = await screen.findByPlaceholderText('List name');

    await user.type(input, 'Errored List');
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(addToastForError).toHaveBeenCalledWith(exampleError);
    });
  });

  it('removes the temporary new-list form after blur', async () => {
    renderSidebar();

    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByPlaceholderText('List name');

    fireEvent.blur(input);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('List name')
      ).not.toBeInTheDocument();
    });
  });

  it('calls the navigation callback when a nav link is activated', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    renderSidebar({
      onNavigate,
      lists: [
        new List('Alpha', 'Amber', [], [], [], false, false, false, 'a-list-id')
      ]
    });

    await user.click(screen.getByRole('link', { name: 'Alpha' }));

    expect(onNavigate).toHaveBeenCalled();
  });
});
