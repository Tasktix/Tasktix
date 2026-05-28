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
import { getAllByLabelText, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it } from 'vitest';

import FilterGroup from '../FilterGroup';

// Mock Heroui components
vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));

// Reset after each test
beforeEach(() => {
  vi.resetAllMocks();
});

// When a row is added, onFilterChange is called
it('Triggers state change when a row is added', async () => {
  // Some setup required
  const user = userEvent.setup();
  const filterChangeCallback = vi.fn();
  // Mock the filter component
  const { getByText } = render(
    <FilterGroup
      filterConfig={[]}
      filters={{ operator: 'And', filters: [] }}
      ids={[1]}
      onDeleteGroup={vi.fn()}
      onFilterChange={filterChangeCallback}
    />
  );

  // Check that the modal is empty
  expect(getByText('Field')).not.toBeVisible();
  // Have the user add a row
  await user.click(getByText('Add Filter Row'));
  // Check that the filter row was made
  expect(getByText('Field')).toBeVisible();
  expect(filterChangeCallback).toHaveBeenCalledExactlyOnceWith();
  // *** Pretty sure that I need to add something here ***
});

// When a group is added, onFilterChange is called
it('Triggers state change when a row is added', async () => {
  // Some setup required
  const user = userEvent.setup();
  const filterChangeCallback = vi.fn();
  // Mock the filter component
  const { getByText, getAllByText } = render(
    <FilterGroup
      filterConfig={[]}
      filters={{ operator: 'And', filters: [] }}
      ids={[1]}
      onDeleteGroup={vi.fn()}
      onFilterChange={filterChangeCallback}
    />
  );

  // Check that the modal is empty
  expect(getByText('Field')).not.toBeVisible();
  // Have the user add a group
  await user.click(getByText('Add Filter Group'));
  // Check that the filter group was made
  expect(getAllByText('Add Filter Group')).toHaveLength(2);
  expect(filterChangeCallback).toHaveBeenCalledExactlyOnceWith();
  // *** Pretty sure that I need to add something here ***
});

// When a subgroup is added, the operator alternates
it('Triggers state change when a row is added', async () => {
  // Some setup required
  const user = userEvent.setup();
  // Mock the filter component
  const { getByText, getAllByText, getAllByLabelText } = render(
    <FilterGroup
      filterConfig={[]}
      filters={{ operator: 'And', filters: [] }}
      ids={[1]}
      onDeleteGroup={vi.fn()}
      onFilterChange={vi.fn()}
    />
  );

  // Have the user add a subgroup with row
  await user.click(getByText('Add Filter Group'));
  await user.click(getAllByText('Add Filter Row')[1]);
  // Check that there are two unique operators visible
  expect(getAllByLabelText('Group operator')[0]).toHaveTextContent('And');
  expect(getAllByLabelText('Group operator')[1]).toHaveTextContent('Or');
});
