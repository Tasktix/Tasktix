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
import { FilterConfig } from '../types';

const MOCK_FILTER_CONFIG = [
  {
    type: 'option',
    label: 'priority',
    options: [{ name: 'High' }, { name: 'Medium' }, { name: 'Low' }]
  }
] satisfies FilterConfig[];

vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));

beforeEach(vi.resetAllMocks);

// When a filter is changed, the state is changed
it('Triggers update to state when a field is changed', async () => {
  const user = userEvent.setup();
  const stateChange = vi.fn();

  const { getByText, findByLabelText } = render(
    <FilterRow
      filterConfigs={MOCK_FILTER_CONFIG}
      filterInput={{ id: 0, type: 'undefined' }}
      onFilterChange={stateChange}
      onFilterDelete={vi.fn()}
    />
  );

  await user.click(getByText('Field'));
  await user.click(await findByLabelText('priority'));
  // Check that onFilterChange was called
  expect(stateChange).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      label: 'priority',
      type: 'option'
    })
  );
});

it('Triggers callback when the row is deleted', async () => {
  const user = userEvent.setup();
  const onDelete = vi.fn();

  const { getByText, getByLabelText } = render(
    <FilterRow
      filterConfigs={[]}
      filterInput={{ id: 0, type: 'undefined' }}
      onFilterChange={vi.fn()}
      onFilterDelete={onDelete}
    />
  );

  expect(getByText('Field')).toBeVisible();

  await user.click(getByLabelText('Delete filter row'));

  expect(onDelete).toHaveBeenCalledOnce();
});
