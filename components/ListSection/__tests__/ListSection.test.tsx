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
import { render, waitFor, within } from '@testing-library/react';

import ListItem from '@/lib/model/listItem';
import api from '@/lib/api';

import ListSection from '../ListSection';

vi.mock('@/lib/api');

test('Newly created items are added to the section', async () => {
  const user = userEvent.setup();

  vi.mocked(api.post).mockResolvedValue({
    code: 200,
    message: 'Success',
    content: undefined
  });

  const { findByLabelText, findByRole, findByDisplayValue, getByLabelText } =
    render(
      <ListSection
        isAutoOrdered
        filters={{}}
        hasDueDates={false}
        hasTimeTracking={false}
        id='test-section'
        listId='test-list'
        members={[]}
        name='Section Name'
        startingItems={[]}
        tagsAvailable={[]}
        onDelete={vi.fn()}
        onTagCreate={() => Promise.resolve('')}
      />
    );

  await user.click(getByLabelText('Create item'));
  await user.type(await findByLabelText('Name'), 'Item 1');
  await user.click(await findByRole('button', { name: /priority/i }));
  await user.click(
    await within(await findByRole('listbox')).findByLabelText('High')
  );
  await user.click(await findByLabelText('Submit'));

  await waitFor(async () =>
    expect(await findByLabelText('Name')).toHaveValue('')
  );
  expect(await findByDisplayValue('Item 1')).toBeVisible();
});

test('Section can be deleted and propagates that event', async () => {
  const user = userEvent.setup();

  const onDelete = vi.fn();

  const { findByLabelText, getByLabelText } = render(
    <ListSection
      hasDueDates
      hasTimeTracking
      isAutoOrdered
      filters={{}}
      id='test-section'
      listId='test-list'
      members={[]}
      name='Section Name'
      startingItems={[]}
      tagsAvailable={[]}
      onDelete={onDelete}
      onTagCreate={() => Promise.resolve('')}
    />
  );

  await user.click(getByLabelText('Show section actions'));
  await user.click(await findByLabelText('Delete section'));

  expect(onDelete).toHaveBeenCalledTimes(1);
});

describe('Section expansion/collapse', () => {
  test('Sections with an incomplete item are expanded by default', () => {
    const { getByLabelText, getByDisplayValue } = render(
      <ListSection
        hasDueDates
        hasTimeTracking
        isAutoOrdered
        filters={{}}
        id='test-section'
        listId='test-list'
        members={[]}
        name='Section Name'
        startingItems={[
          new ListItem('Item 1', {
            id: 'aaaaaaaaaaaaaaaa',
            status: 'Unstarted'
          })
        ]}
        tagsAvailable={[]}
        onDelete={vi.fn()}
        onTagCreate={() => Promise.resolve('')}
      />
    );

    expect(getByLabelText('Collapse section')).toBeVisible();
    expect(getByDisplayValue('Item 1')).toBeVisible();
  });

  test('Sections with all items completed are collapsed by default', () => {
    const { getByLabelText, queryByText } = render(
      <ListSection
        hasDueDates
        hasTimeTracking
        isAutoOrdered
        filters={{}}
        id='test-section'
        listId='test-list'
        members={[]}
        name='Section Name'
        startingItems={[
          new ListItem('Item 1', {
            id: 'aaaaaaaaaaaaaaaa',
            status: 'Completed',
            dateCompleted: new Date()
          })
        ]}
        tagsAvailable={[]}
        onDelete={vi.fn()}
        onTagCreate={() => Promise.resolve('')}
      />
    );

    expect(getByLabelText('Expand section')).toBeVisible();
    expect(queryByText('Item 1')).not.toBeInTheDocument();
  });

  test('Sections with no items are collapsed by default', () => {
    const { getByLabelText, queryByText } = render(
      <ListSection
        hasDueDates
        hasTimeTracking
        isAutoOrdered
        filters={{}}
        id='test-section'
        listId='test-list'
        members={[]}
        name='Section Name'
        startingItems={[]}
        tagsAvailable={[]}
        onDelete={vi.fn()}
        onTagCreate={() => Promise.resolve('')}
      />
    );

    expect(getByLabelText('Expand section')).toBeVisible();
    expect(queryByText('Item 1')).not.toBeInTheDocument();
  });

  test('Collapsed sections expand when the toggle button is pressed', async () => {
    const user = userEvent.setup();

    const { findByLabelText, getByLabelText, getByText } = render(
      <ListSection
        hasDueDates
        hasTimeTracking
        isAutoOrdered
        filters={{}}
        id='test-section'
        listId='test-list'
        members={[]}
        name='Section Name'
        startingItems={[
          new ListItem('Item 1', {
            id: 'aaaaaaaaaaaaaaaa',
            status: 'Completed',
            dateCompleted: new Date()
          })
        ]}
        tagsAvailable={[]}
        onDelete={vi.fn()}
        onTagCreate={() => Promise.resolve('')}
      />
    );

    await user.click(getByLabelText('Expand section'));

    expect(await findByLabelText('Collapse section')).toBeVisible();
    expect(getByText('Item 1')).toBeVisible();
  });

  test('Expanded sections collapse when the toggle button is pressed', async () => {
    const user = userEvent.setup();

    const { findByLabelText, getByLabelText, queryByText } = render(
      <ListSection
        hasDueDates
        hasTimeTracking
        isAutoOrdered
        filters={{}}
        id='test-section'
        listId='test-list'
        members={[]}
        name='Section Name'
        startingItems={[
          new ListItem('Item 1', {
            id: 'aaaaaaaaaaaaaaaa',
            status: 'Unstarted'
          })
        ]}
        tagsAvailable={[]}
        onDelete={vi.fn()}
        onTagCreate={() => Promise.resolve('')}
      />
    );

    await user.click(getByLabelText('Collapse section'));

    expect(await findByLabelText('Expand section')).toBeVisible();
    expect(queryByText('Item 1')).not.toBeInTheDocument();
  });
});
