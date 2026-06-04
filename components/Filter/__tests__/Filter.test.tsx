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

vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));

beforeEach(vi.resetAllMocks);

describe('Propagates events', () => {
  it('Triggers callback when the filters are saved', async () => {
    const user = userEvent.setup();
    const filterSaveCallback = vi.fn();

    const { getByLabelText, getByTestId, getByText } = render(
      <Filter
        currentFilters={{ operator: 'And', filters: [] }}
        filterConfig={[
          { label: 'priority', options: [{ name: 'High' }], type: 'option' }
        ]}
        onFilterSave={filterSaveCallback}
      />
    );

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
});

describe('Displays contents', () => {
  it('Displays the saved filter when one is specified', async () => {
    const user = userEvent.setup();

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

    // Filter text is displayed
    expect(getByTestId('filter-container')).toHaveTextContent('priority');
    expect(getByTestId('filter-container')).toHaveTextContent('=');
    expect(getByTestId('filter-container')).toHaveTextContent('"High"');

    // Filter modal reflects the state
    await user.click(getByLabelText('Open filter modal'));
    expect(getByLabelText('Field')).toHaveTextContent('priority');
    expect(getByLabelText('operator')).toHaveTextContent('equals');
    expect(getByLabelText('Value')).toHaveTextContent('High');
  });

  it('Displays placeholder text when no saved filter is specified', () => {
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

    expect(getByTestId('filter-container')).toHaveTextContent('Filter...');
  });
});

describe('Errors', () => {
  it('Warns the user with toast message when validation fails', async () => {
    const user = userEvent.setup();

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

    // Check that validation fails & explanation is given
    expect(getByTestId('filterModal')).toBeVisible();
    expect(addToast).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ title: 'Filter row cannot be empty' })
    );
  });
});
