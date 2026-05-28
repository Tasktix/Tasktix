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
import { expect, it } from 'vitest';

import FilterRow from '../FilterRow';

// Mock Heroui components
vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));

// Reset after each test
beforeEach(() => {
  vi.resetAllMocks();
});

// When a filter is changed, the state is changed
it('Triggers update to state when a field is changed', async () => {
  // Some setup required
  const user = userEvent.setup();
  const stateChange = vi.fn();
  // Mock the filter row component
  const { getByText, getByLabelText } = render(
    <FilterRow
      filterConfigs={[]}
      filterInput={{ id: 0, type: 'undefined' }}
      onFilterChange={stateChange}
      onFilterDelete={vi.fn()}
    />
  );

  // Change the first field
  await user.click(getByText('Field'));
  await user.click(getByLabelText('priority'));
  // Check that onFilterChange was called
  expect(stateChange).toHaveBeenCalledExactlyOnceWith({
    operator: 'And',
    filters: [
      expect.objectContaining({
        label: 'priority'
      })
    ]
  });
  // *** Is this good enough? Do we actually call onFilterChange
  // when we change our selection? Or do we only call this when
  // the entire row has been filled out? ***
});

// Callback function is called when the row is deleted
it('Triggers callback when the row is deleted', async () => {
  // Some setup required
  const user = userEvent.setup();
  const onDelete = vi.fn();
  // Mock the filter row component
  const { getByText, getByLabelText } = render(
    <FilterRow
      filterConfigs={[]}
      filterInput={{ id: 0, type: 'undefined' }}
      onFilterChange={vi.fn()}
      onFilterDelete={onDelete}
    />
  );

  // Check that the row exists
  expect(getByText('Field')).toBeVisible();
  // Have the user delete the row
  await user.click(getByLabelText('Delete filter row'));
  // Check that the row was deleted
  expect(onDelete).toHaveBeenCalledExactlyOnceWith();
  expect(getByText('Field')).not.toBeVisible();
});
