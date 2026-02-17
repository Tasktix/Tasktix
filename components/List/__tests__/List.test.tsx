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

import { render, within, waitFor } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import api from '@/lib/api';
import ListModel from '@/lib/model/list';
import ListSection from '@/lib/model/listSection';
import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';

import List from '../List';

vi.mock('@/lib/api');

/**
 * Mocking HeroUI Popover because the popover doesn't properly open in tests (presumably a
 * JSDom error). To ensure the popover is "open" and the contents can be pressed, all
 * contents of the popover are always rendered.
 */
vi.mock(
  import('@heroui/react'),
  async importOriginal =>
    ({
      ...(await importOriginal())
    }) as unknown as typeof import('@heroui/react')
);

beforeEach(vi.resetAllMocks);

describe('ListItem state propagation', () => {
  test('Item names update when changed', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByDisplayValue, getByTestId } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', { id: 'item-id' })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable='[]'
        />
      </HeroUIProvider>
    );

    const nameInput = getByDisplayValue('List item name');

    await user.clear(nameInput);
    await user.type(nameInput, 'A real thing to do');
    await user.click(
      within(getByTestId('confirmed-input-Item name')).getByRole('button')
    );

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledExactlyOnceWith('/item/item-id', {
        name: 'A real thing to do'
      })
    );

    await waitFor(() =>
      expect(
        within(getByTestId('confirmed-input-Item name')).getByRole('button')
      ).toHaveClass('hidden')
    );
  });

  test('Item priority updates when changed', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByRole } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    priority: 'High',
                    id: 'item-id'
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable='[]'
        />
      </HeroUIProvider>
    );

    const itemPriority = getByRole('button', { name: 'High Priority' });

    await user.click(itemPriority);
    await user.click(getByRole('option', { name: 'Medium' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledExactlyOnceWith('/item/item-id', {
        priority: 'Medium'
      })
    );

    expect(itemPriority).toHaveAccessibleName('Medium Priority');
  });

  test('Item marked completed when checkbox clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByRole, getByText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    status: 'In_Progress',
                    id: 'item-id'
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable='[]'
        />
      </HeroUIProvider>
    );

    expect(getByRole('checkbox')).not.toBeChecked();

    await user.click(getByRole('checkbox'));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledExactlyOnceWith(
        '/item/item-id',
        expect.objectContaining({
          status: 'Completed',
          dateStarted: null
        })
      )
    );

    expect(getByRole('checkbox')).toBeChecked();
    expect(getByText('List item name')).toHaveClass('line-through');
  });

  test('Item marked incomplete when checkbox clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByDisplayValue, getByLabelText, getByRole } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    status: 'Completed',
                    dateCompleted: new Date('2026-01-01'),
                    id: 'item-id'
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Expand section'));

    expect(getByRole('checkbox')).toBeChecked();

    await user.click(getByRole('checkbox'));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledExactlyOnceWith(
        '/item/item-id',
        expect.objectContaining({
          status: 'Paused',
          dateCompleted: null
        })
      )
    );

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByDisplayValue('List item name')).not.toHaveClass('line-through');
  });

  test('Expected time changes when new value inputted', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByLabelText, getByRole } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    expectedMs: 1000 * 60,
                    id: 'item-id'
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable='[]'
        />
      </HeroUIProvider>
    );

    const popoverElement = getByRole('button', { name: 'Expected 00:01' });

    await user.click(popoverElement);
    await user.clear(getByLabelText('Expected Time'));
    await user.type(getByLabelText('Expected Time'), '00:05{Enter}');

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledExactlyOnceWith(
        '/item/item-id',
        expect.objectContaining({
          expectedMs: 1000 * 60 * 5
        })
      )
    );

    expect(popoverElement).toHaveAccessibleName('Expected 00:05');
  });

  test('New tags can be created and linked to the item', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      code: 200,
      message: 'Success',
      content: '/item/item-id/tag/tag-id'
    });
    vi.mocked(api.post).mockResolvedValueOnce({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const user = userEvent.setup();

    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    id: 'item-id'
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable='[]'
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('Update tags')).not.toHaveTextContent('Test tag');

    await user.click(getByLabelText('Update tags'));

    await user.type(getByLabelText('Add tag...'), 'Test tag');
    await user.click(getByLabelText('Pick color'));
    await user.click(getByLabelText('Cyan'));
    await user.click(
      // We know the DOM, so we know this element does have a parent form - skipcq: JS-0339
      within(getByLabelText('Add tag...').closest('form')!).getByLabelText(
        'Submit'
      )
    );

    expect(api.post).toHaveBeenCalledTimes(2);
    expect(api.post).toHaveBeenCalledWith('/list/list-id/tag', {
      name: 'Test tag',
      color: 'Cyan'
    });
    expect(api.post).toHaveBeenCalledWith(
      '/item/item-id/tag/tag-id',
      expect.any(Object)
    );

    expect(getByLabelText('Update tags')).toHaveTextContent('Test tag');
    expect(
      within(getByLabelText('Update tags')).getByText('Test tag')
    ).toHaveClass('text-cyan-500');
  });

  test('Existing tags can be linked to the item', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const user = userEvent.setup();

    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    id: 'item-id'
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable={JSON.stringify([
            new Tag('Tag name', 'Emerald', 'tag-id')
          ])}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('Update tags')).not.toHaveTextContent('Tag name');

    await user.click(getByLabelText('Update tags'));
    await user.click(getByLabelText('Add Tag name to item'));

    expect(api.post).toHaveBeenCalledExactlyOnceWith(
      '/item/item-id/tag/tag-id',
      expect.any(Object)
    );

    expect(getByLabelText('Update tags')).toHaveTextContent('Tag name');
    expect(
      within(getByLabelText('Update tags')).getByText('Tag name')
    ).toHaveClass('text-emerald-500');
  });

  test('Linked tags can be unlinked from the item', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const user = userEvent.setup();

    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    id: 'item-id',
                    tags: [new Tag('Tag name', 'Emerald', 'tag-id')]
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable={JSON.stringify([
            new Tag('Tag name', 'Emerald', 'tag-id')
          ])}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('Update tags')).toHaveTextContent('Tag name');

    await user.click(getByLabelText('Update tags'));
    await user.click(getByLabelText('Remove Tag name from item'));

    expect(api.delete).toHaveBeenCalledExactlyOnceWith(
      '/item/item-id/tag/tag-id'
    );
    expect(getByLabelText('Update tags')).not.toHaveTextContent('Tag name');
  });

  test('Item can be deleted', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const user = userEvent.setup();

    const { queryByDisplayValue, getByLabelText, getByRole } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify(
            new ListModel(
              'List name',
              'Amber',
              [],
              [
                new ListSection('List section name', [
                  new ListItem('List item name', {
                    id: 'item-id'
                  })
                ])
              ],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingTagsAvailable='[]'
        />
      </HeroUIProvider>
    );

    expect(queryByDisplayValue('List item name')).toBeInTheDocument();

    await user.click(getByLabelText('More item info'));
    await user.click(getByRole('button', { name: 'Delete' }));

    expect(api.delete).toHaveBeenCalledExactlyOnceWith('/item/item-id');

    expect(queryByDisplayValue('List item name')).not.toBeInTheDocument();
  });
});
