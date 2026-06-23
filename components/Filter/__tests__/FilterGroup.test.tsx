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
import userEvent from '@testing-library/user-event';
import { it } from 'vitest';

import FilterGroup from '../FilterGroup';

vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));

beforeEach(vi.resetAllMocks);

describe('Event handlers propagate user actions', () => {
  it('Triggers state change when a row is added', async () => {
    const user = userEvent.setup();
    const filterChangeCallback = vi.fn();

    const { getByText, queryByText } = render(
      <FilterGroup
        filterConfig={[]}
        filters={{ operator: 'And', filters: [] }}
        ids={[1]}
        onDeleteGroup={vi.fn()}
        onFilterChange={filterChangeCallback}
      />
    );

    // Check that the modal is empty
    expect(queryByText('Field')).not.toBeInTheDocument();

    await user.click(getByText('Add Filter Row'));

    expect(filterChangeCallback).toHaveBeenCalledExactlyOnceWith({
      filters: [{ id: 1, type: 'undefined' }],
      operator: 'And'
    });
  });

  it('Triggers state change when a subgroup is added', async () => {
    const user = userEvent.setup();
    const filterChangeCallback = vi.fn();

    const { getByText, queryByText } = render(
      <FilterGroup
        filterConfig={[]}
        filters={{ operator: 'And', filters: [] }}
        ids={[1]}
        onDeleteGroup={vi.fn()}
        onFilterChange={filterChangeCallback}
      />
    );

    expect(queryByText('Field')).not.toBeInTheDocument();

    await user.click(getByText('Add Filter Group'));

    expect(filterChangeCallback).toHaveBeenCalledExactlyOnceWith({
      filters: [{ id: 1, filters: [], operator: 'Or' }],
      operator: 'And'
    });
  });

  it('Triggers state change when a row is added to a subgroup', async () => {
    const user = userEvent.setup();
    const mockFilterChangeHandler = vi.fn();

    const { getAllByText } = render(
      <FilterGroup
        filterConfig={[]}
        filters={{
          operator: 'And',
          filters: [{ id: 1, filters: [], operator: 'Or' }]
        }}
        ids={[1]}
        onDeleteGroup={vi.fn()}
        onFilterChange={mockFilterChangeHandler}
      />
    );

    await user.click(getAllByText('Add Filter Row')[0]);

    expect(mockFilterChangeHandler).toHaveBeenCalledExactlyOnceWith({
      filters: [{ filters: [{ id: 1, type: 'undefined' }], operator: 'Or' }],
      operator: 'And'
    });
  });
});
