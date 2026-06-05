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
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';

import List from '@/lib/model/list';

import Sidebar from '../Sidebar/Sidebar';

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn()
}));

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock
}));

vi.mock('../Sidebar/CreateListModal', () => ({
  default: ({ isOpen }: Readonly<{ isOpen: boolean }>) =>
    isOpen ? <dialog open>Create New List</dialog> : null
}));

describe('Sidebar', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/list/0000000000000001');
  });

  test('renders sorted navigation links and marks the active list', () => {
    const onNavigate = vi.fn();

    render(
      <Sidebar
        lists={[
          new List('Zeta', 'Blue', [], [], [], false, false, false, {
            id: '0000000000000002'
          }),
          new List('Alpha', 'Blue', [], [], [], false, false, false, {
            id: '0000000000000001'
          })
        ]}
        onNavigate={onNavigate}
      />
    );

    expect(screen.getAllByRole('link').map(link => link.textContent)).toEqual([
      'Today',
      'Alpha',
      'Zeta'
    ]);
    expect(
      screen.getByRole('link', { name: 'Alpha' }).closest('span')
    ).toHaveClass('border-primary');
    expect(
      screen.getByRole('link', { name: 'Today' }).closest('span')
    ).toHaveClass('border-transparent');
  });

  test('opens the create list modal from the sidebar action', async () => {
    const user = userEvent.setup();

    render(<Sidebar lists={[]} />);

    await user.click(screen.getByRole('button', { name: 'Create new list' }));

    expect(
      within(await screen.findByRole('dialog')).getByText('Create New List')
    ).toBeVisible();
  });
});
