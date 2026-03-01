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
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import ListModel from '@/lib/model/list';
import ListItemModel from '@/lib/model/listItem';
import ListSectionModel from '@/lib/model/listSection';

import List from '../List';

const mockListReducer = vi.fn((state: unknown) => state);

vi.mock('../listReducer', async importActual => {
  const actual = await importActual<typeof import('../listReducer')>();

  return {
    ...actual,
    default: (state: unknown, action: unknown) => mockListReducer(state, action)
  };
});

vi.mock('@/components/SearchBar', () => ({
  default: () => <div data-testid='search-bar' />
}));

vi.mock('@/components/ListSettings', () => ({
  default: () => <div data-testid='list-settings' />
}));

vi.mock('@/components/AddListSection', () => ({
  default: () => <div data-testid='add-section' />
}));

vi.mock('@/components/ListSection/ListSection', () => ({
  default: ({
    dispatchItemChange
  }: {
    dispatchItemChange: (action: unknown) => void;
  }) => (
    <div>
      <h2>Mock task</h2>
      <span aria-label='priority-badge'>High</span>
      <input
        aria-label='mark complete'
        type='checkbox'
        onChange={() =>
          dispatchItemChange({
            type: 'SetItemComplete',
            sectionId: 'section-id',
            id: 'item-id',
            dateCompleted: new Date('2026-01-01')
          })
        }
      />
    </div>
  )
}));

describe('List mock task rendering and completion flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a mock task, shows title and priority badge, and fires mark-complete callback when checkbox is clicked', () => {
    const startingList = new ListModel(
      'List name',
      'Amber',
      [],
      [new ListSectionModel('Section', [new ListItemModel('Item', {})])],
      false,
      false,
      false,
      'list-id'
    );

    render(
      <List
        startingList={JSON.stringify(startingList)}
        startingTagsAvailable='[]'
      />
    );

    expect(screen.getByText('Mock task')).toBeInTheDocument();
    expect(screen.getByLabelText('priority-badge')).toHaveTextContent('High');

    fireEvent.click(screen.getByRole('checkbox', { name: 'mark complete' }));

    expect(mockListReducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'SetItemComplete',
        sectionId: 'section-id',
        id: 'item-id'
      })
    );
  });
});
