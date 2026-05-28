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
import { addToast } from '@heroui/react';
import { expect, it } from 'vitest';

import Filter from '../Filter';
import { OptionFilterOperator } from '../types';

// Mock Heroui components
vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));

// Reset after each test
beforeEach(() => {
  vi.resetAllMocks();
});

// When the filters are saved, FilterText is updated to match
it('Triggers callback when the filters are saved', async () => {
  // Some setup required
  const user = userEvent.setup();
  const filterSaveCallback = vi.fn();
  // Mock the filter component
  const { getByLabelText, getByTestId, getByText } = render(
    <Filter
      currentFilters={{ operator: 'And', filters: [] }}
      filterConfig={[
        { label: 'priority', options: [{ name: 'High' }], type: 'option' }
      ]}
      onFilterSave={filterSaveCallback}
    />
  );

  // Check that the filter is initially empty
  expect(getByTestId('filter-container')).toHaveTextContent('Filter...');
  // Have the user fill out a row
  await user.click(getByLabelText('Open filter modal'));
  await user.click(getByText('Add Filter Row'));
  await user.click(getByText('Field'));
  await user.click(getByLabelText('priority'));
  await user.click(getByLabelText('operator'));
  await user.click(getByLabelText('equals'));
  await user.click(getByLabelText('Value'));
  await user.click(getByLabelText('High'));
  await user.click(getByText('Save'));

  // Check that the filter now contains content
  expect(filterSaveCallback).toHaveBeenCalledExactlyOnceWith({
    operator: 'And',
    filters: [
      expect.objectContaining({
        label: 'priority',
        operator: '=',
        options: [{ name: 'High' }]
      })
    ]
  });
});

// Displays filter information when provided
it('Displays the saved filter when one is specified', async () => {
  // Some setup required
  const user = userEvent.setup();
  // Mock the filter component
  const { getByTestId, getByLabelText } = render(
    <Filter
      currentFilters={{
        operator: 'And',
        filters: [
          {
            type: 'option',
            id: 1,
            label: 'priority',
            operator: OptionFilterOperator.Equal,
            value: 'High'
          }
        ]
      }}
      filterConfig={[
        { label: 'priority', options: [{ name: 'High' }], type: 'option' }
      ]}
      onFilterSave={vi.fn()}
    />
  );

  // Check that the filter now contains content
  expect(getByTestId('filter-container')).toHaveTextContent('priority');
  // Check that the filter modal reflects the state
  await user.click(getByLabelText('Open filter modal'));
  expect(getByLabelText('Field')).toHaveTextContent('priority');
  expect(getByLabelText('operator')).toHaveTextContent('equals');
  expect(getByLabelText('Value')).toHaveTextContent('High');
});

// Displays Filter... when no filter state is specified
it('Displays placeholder text when no saved filter is specified', () => {
  // Mock the filter component
  const { getByTestId } = render(
    <Filter
      currentFilters={{
        operator: 'And',
        filters: []
      }}
      filterConfig={[]}
      onFilterSave={vi.fn()}
    />
  );

  // Check that the filter contains placeholder
  expect(getByTestId('filter-container')).toHaveTextContent('Filter...');
});

// Triggers a toast if validation fails & doesn't close modal
it('Warns the user with toast message when validation fails', async () => {
  // Some setup required
  const user = userEvent.setup();
  // Mock the filter component
  const { getByTestId, getByLabelText, getByText } = render(
    <Filter
      currentFilters={{ operator: 'And', filters: [] }}
      filterConfig={[]}
      onFilterSave={vi.fn()}
    />
  );

  // Have the user create an incomplete filter
  await user.click(getByLabelText('Open filter modal'));
  await user.click(getByText('Add Filter Row'));
  await user.click(getByText('Save'));
  // Check that the toast message is called and modal is open
  expect(getByTestId('filterModal')).toBeVisible();
  expect(addToast).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ title: 'Filter row cannot be empty' })
  );
});
