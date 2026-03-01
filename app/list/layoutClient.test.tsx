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
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import LayoutClient from '@/app/list/layoutClient';

vi.mock('@/components/Sidebar', () => ({
  default: ({ className = '' }: { className?: string }) => (
    <aside className={className} data-testid='sidebar'>
      Sidebar
    </aside>
  ),
  listReducer: (state: unknown[]) => state,
  ListContext: createContext(() => undefined)
}));

describe('LayoutClient mobile drawer', () => {
  it('opens the drawer when hamburger is clicked on a small window', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500
    });
    window.dispatchEvent(new Event('resize'));

    render(
      <LayoutClient startingLists='[]'>
        <main>Content</main>
      </LayoutClient>
    );

    const hamburger = screen.getByRole('button', {
      name: /open navigation menu/i
    });
    const dialog = screen.getByRole('dialog');
    const drawer = document.getElementById('mobile-sidebar-drawer');

    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    expect(dialog).toHaveAttribute('aria-hidden', 'true');
    expect(drawer).toHaveClass('-translate-x-full');

    fireEvent.click(hamburger);

    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toHaveAttribute('aria-hidden', 'false');
    expect(drawer).toHaveClass('translate-x-0');
  });
});
