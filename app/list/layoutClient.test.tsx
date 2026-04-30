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

import { createContext } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';
import '@testing-library/jest-dom';

import LayoutClient from '@/app/list/layoutClient';

vi.mock('@/components/Sidebar', () => ({
  default: ({
    inDrawer = false,
    onNavigate
  }: {
    inDrawer?: boolean;
    onNavigate?: () => void;
  }) => (
    <aside data-in-drawer={String(inDrawer)} data-testid='sidebar'>
      <button onClick={onNavigate}>Navigate</button>
    </aside>
  ),
  listReducer: (state: unknown[]) => state,
  ListContext: createContext(() => undefined)
}));

describe('LayoutClient mobile drawer', () => {
  it('opens the drawer and closes it when navigation is triggered', async () => {
    render(
      <LayoutClient startingLists='[]'>
        <main>Content</main>
      </LayoutClient>
    );

    const hamburger = screen.getByRole('button', {
      name: /open navigation menu/i
    });

    expect(document.getElementById('mobile-sidebar-drawer')).toBeNull();
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(hamburger);

    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    const dialog = await screen.findByRole('dialog');

    await waitFor(() => {
      expect(dialog).toBeVisible();
      expect(screen.getByText('Navigation')).toBeVisible();
    });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Navigate' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
