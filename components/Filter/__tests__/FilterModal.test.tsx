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
import { render, waitFor } from '@testing-library/react';

import { FilterModal } from '../FilterModal';
import { OptionFilterOperator } from '../types';

describe('Modal buttons', () => {
  it('Triggers callback when the filters are saved', async () => {
    const user = userEvent.setup();
    const filterSaveCallback = vi.fn();

    const { getByText } = render(
      <FilterModal
        isOpen
        filterConfig={[
          { label: 'priority', options: [{ name: 'High' }], type: 'option' }
        ]}
        filters={{ operator: 'And', filters: [] }}
        onFilterSave={filterSaveCallback}
        onOpenChange={vi.fn()}
      />
    );

    await user.click(getByText('Add Filter Row'));
    await user.click(getByText('Save'));

    // Check that the filter now contains content
    expect(filterSaveCallback).toHaveBeenCalledExactlyOnceWith({
      operator: 'And',
      filters: [expect.objectContaining({ type: 'undefined' })]
    });
  });

  it('Clears state when filters are reset', async () => {
    const user = userEvent.setup();

    const { getByRole, getByText, queryByRole } = render(
      <FilterModal
        isOpen
        filterConfig={[
          { label: 'priority', options: [{ name: 'High' }], type: 'option' }
        ]}
        filters={{
          operator: 'And',
          filters: [
            {
              id: 1,
              type: 'option',
              label: 'priority',
              operator: OptionFilterOperator.Equal,
              value: 'High'
            }
          ]
        }}
        onFilterSave={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() =>
      expect(getByRole('button', { name: 'priority Field' })).toBeVisible()
    );
    expect(queryByRole('button', { name: 'equals operator' })).toBeVisible();
    expect(queryByRole('button', { name: 'High Value' })).toBeVisible();

    await user.click(getByText('Clear'));

    expect(
      queryByRole('button', { name: 'priority Field' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'equals operator' })
    ).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'High Value' })
    ).not.toBeInTheDocument();
  });
});
