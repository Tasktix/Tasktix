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

import { render, within, waitFor, screen } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import api from '@/lib/api';
import ListModel from '@/lib/model/list';
import ListSection from '@/lib/model/listSection';
import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';
import { subscribe } from '@/lib/sse/client';
import ListMember from '@/lib/model/listMember';
import User from '@/lib/model/user';
import MemberRole from '@/lib/model/memberRole';

import List from '../List';

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));
vi.mock('@/lib/api');
vi.mock('@/lib/sse/client');

beforeAll(() => {
  vi.stubEnv('TZ', 'UTC');

  // Needed for <Tabs> component
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe;
      unobserve;
      disconnect;

      constructor() {
        this.observe = vi.fn();
        this.unobserve = vi.fn();
        this.disconnect = vi.fn();
      }
    }
  );
});
beforeEach(vi.resetAllMocks);
afterAll(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('List state changes', () => {
  const MOCK_LIST = new ListModel(
    'List name',
    'Amber',
    [],
    [],
    [],
    true,
    true,
    true,
    'list-id'
  );

  test('List name updates when event received', async () => {
    const user = userEvent.setup();

    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({ type: 'SetListName', name: 'New list name' });

      return vi.fn();
    });

    const { getByDisplayValue, getByLabelText, getByText } = render(
      <HeroUIProvider disableRipple>
        <List startingList={JSON.stringify(MOCK_LIST)} startingRoles='[]' />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());

    expect(getByDisplayValue('New list name')).toBeVisible();
  });

  test('List color updates when event received', async () => {
    const user = userEvent.setup();

    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({ type: 'SetListColor', color: 'Blue' });

      return vi.fn();
    });

    const { getByLabelText, getByText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify({ ...MOCK_LIST, color: 'Amber' })}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());

    expect(getByLabelText('Pick color')).toHaveClass('bg-blue-500');
  });

  test('List due date toggle updates when event received', async () => {
    const user = userEvent.setup();

    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({ type: 'SetHasDueDates', hasDueDates: false });

      return vi.fn();
    });

    const { getByLabelText, getByText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify({ ...MOCK_LIST, hasDueDates: true })}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());

    expect(getByLabelText('Track due dates')).not.toBeChecked();
  });

  test('List time tracking toggle updates when event received', async () => {
    const user = userEvent.setup();

    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({ type: 'SetHasTimeTracking', hasTimeTracking: false });

      return vi.fn();
    });

    const { getByLabelText, getByText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify({ ...MOCK_LIST, hasTimeTracking: true })}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());

    expect(getByLabelText('Track completion time')).not.toBeChecked();
  });

  test('List auto-ordering toggle updates when event received', async () => {
    const user = userEvent.setup();

    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({ type: 'SetIsAutoOrdered', isAutoOrdered: false });

      return vi.fn();
    });

    const { getByLabelText, getByText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify({ ...MOCK_LIST, isAutoOrdered: true })}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());

    expect(getByLabelText('Auto-order list items')).not.toBeChecked();
  });
});

describe('List member changes', () => {
  const VIEWER_ROLE = new MemberRole('Viewer', "Can't do anything", {});
  const ADDER_ROLE = new MemberRole('Adder', 'Can add items', {
    canAddItems: true
  });
  const MOCK_USER = new User(
    'user-1',
    'Test user',
    'test@example.com',
    true,
    new Date(),
    new Date(),
    {}
  );
  const MOCK_LIST = new ListModel(
    'List name',
    'Amber',
    [new ListMember(MOCK_USER, VIEWER_ROLE)],
    [],
    [],
    true,
    true,
    true,
    'list-id'
  );

  test('Allows users to be added', async () => {
    const MOCK_NEW_USER = new User(
      'user-2',
      'New user',
      'newuser@example.com',
      true,
      new Date(),
      new Date(),
      {}
    );

    const user = userEvent.setup();

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: JSON.stringify(new ListMember(MOCK_NEW_USER, ADDER_ROLE))
    });

    const { getByLabelText, getByRole, getByText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify({ ...MOCK_LIST, isAutoOrdered: true })}
          startingRoles={JSON.stringify([VIEWER_ROLE, ADDER_ROLE])}
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());
    await user.click(getByText('Members'));
    await waitFor(() => expect(getByText('Test user')).toBeVisible());

    await user.type(getByLabelText('New member email'), 'newuser@example.com');
    await user.click(getByLabelText('New member role'));
    await waitFor(() => expect(getByLabelText('Adder')).toBeVisible());
    await user.click(getByLabelText('Adder'));
    await user.click(getByRole('button', { name: 'Send Invite' }));

    await waitFor(() => expect(getByText('New user')).toBeVisible());
  });

  test('Allows user roles to be changed', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByLabelText, getByText } = render(
      <HeroUIProvider disableRipple>
        <List
          startingList={JSON.stringify({ ...MOCK_LIST, isAutoOrdered: true })}
          startingRoles={JSON.stringify([VIEWER_ROLE, ADDER_ROLE])}
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());
    await user.click(getByText('Members'));
    await waitFor(() => expect(getByText('Test user')).toBeVisible());

    expect(getByLabelText('Test user Role')).toHaveTextContent('Viewer');

    await user.click(getByLabelText('Test user Role'));
    await waitFor(() => expect(getByLabelText('Adder')).toBeVisible());
    await user.click(getByLabelText('Adder'));

    await waitFor(() =>
      expect(getByLabelText('Test user Role')).toHaveTextContent('Adder')
    );
  });
});

describe('Tag changes', () => {
  const MOCK_LIST = new ListModel(
    'List name',
    'Amber',
    [],
    [],
    [new Tag('Test tag', 'Amber')],
    true,
    true,
    true,
    'list-id'
  );

  test('Allows tag names to be changed', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByDisplayValue, getByLabelText, getByTestId, getByText } =
      render(
        <HeroUIProvider disableRipple>
          <List startingList={JSON.stringify(MOCK_LIST)} startingRoles='[]' />
        </HeroUIProvider>
      );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());
    await user.click(getByText('Tags'));
    await waitFor(() => expect(getByDisplayValue('Test tag')).toBeVisible());

    const tagName = getByDisplayValue('Test tag');

    await user.clear(tagName);
    await user.type(tagName, 'New tag name');
    screen.debug(undefined, Number.MAX_SAFE_INTEGER, { highlight: false });
    await user.click(
      within(getByTestId('confirmed-input-rename tag: Test tag')).getByRole(
        'button'
      )
    );

    await waitFor(() =>
      expect(
        within(
          getByTestId('confirmed-input-rename tag: New tag name')
        ).getByRole('button')
      ).toHaveClass('hidden')
    );
  });

  test('Allows tag colors to be changed', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByDisplayValue, getByLabelText, getByText } = render(
      <HeroUIProvider disableRipple>
        <List startingList={JSON.stringify(MOCK_LIST)} startingRoles='[]' />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());
    await user.click(getByText('Tags'));
    await waitFor(() => expect(getByDisplayValue('Test tag')).toBeVisible());

    const tagColor = getByLabelText('edit color: Test tag');

    await user.click(tagColor);
    await user.click(getByLabelText('Green'));

    await waitFor(() => expect(tagColor).toHaveClass('bg-green-500'));
  });

  test('Allows tags to be deleted', async () => {
    const user = userEvent.setup();

    vi.mocked(api.delete).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const {
      getByDisplayValue,
      getByLabelText,
      getByRole,
      getByText,
      queryByDisplayValue
    } = render(
      <HeroUIProvider disableRipple>
        <List startingList={JSON.stringify(MOCK_LIST)} startingRoles='[]' />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Open list settings'));
    await waitFor(() => expect(getByText('List Settings')).toBeVisible());
    await user.click(getByText('Tags'));
    await waitFor(() => expect(getByDisplayValue('Test tag')).toBeVisible());

    const deleteTag = getByLabelText('delete tag: Test tag');

    await user.click(deleteTag);
    await user.click(getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(queryByDisplayValue('Test tag')).not.toBeInTheDocument()
    );
  });
});

describe('List section changes', () => {
  const MOCK_LIST = new ListModel(
    'List name',
    'Amber',
    [],
    [new ListSection('Test section', [])],
    [],
    false,
    false,
    false,
    'list-id'
  );

  test('Allows sections to be added', async () => {
    const user = userEvent.setup();

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByLabelText, getByRole, getByDisplayValue } = render(
      <HeroUIProvider disableRipple>
        <List startingList={JSON.stringify(MOCK_LIST)} startingRoles='[]' />
      </HeroUIProvider>
    );

    const sectionNameInput = getByLabelText('New section name');

    await user.type(sectionNameInput, 'New section');
    await user.click(getByRole('button', { name: 'Add Section' }));

    await waitFor(() => expect(sectionNameInput).toHaveValue(''));
    expect(getByDisplayValue('New section')).toBeVisible();
  });

  test('Allows sections to be deleted', async () => {
    const user = userEvent.setup();

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByRole, getByDisplayValue } = render(
      <HeroUIProvider disableRipple>
        <List startingList={JSON.stringify(MOCK_LIST)} startingRoles='[]' />
      </HeroUIProvider>
    );

    const sectionName = getByDisplayValue('Test section');

    await user.click(getByRole('button', { name: 'Show section actions' }));
    await waitFor(() =>
      expect(getByRole('menuitem', { name: 'Delete' })).toBeVisible()
    );
    await user.click(getByRole('menuitem', { name: 'Delete' }));
    await user.click(getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(sectionName).not.toBeInTheDocument());
  });

  test('Allows items to be added to sections', async () => {
    const user = userEvent.setup();

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByRole, getByDisplayValue, getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <List startingList={JSON.stringify(MOCK_LIST)} startingRoles='[]' />
      </HeroUIProvider>
    );

    const itemNameInput = getByLabelText('Name');

    await user.click(getByRole('button', { name: 'Create item' }));
    await waitFor(() => expect(itemNameInput).toBeVisible());
    await user.type(itemNameInput, 'New item');
    await user.click(getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(itemNameInput).toHaveValue(''));
    expect(getByDisplayValue('New item')).toBeVisible();
  });
});

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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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

  test('Item descriptions update when changed', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByDisplayValue, getByLabelText, getByTestId } = render(
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
                    description: 'Initial description',
                    id: 'item-id'
                  })
                ])
              ],
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('More item info'));

    const nameInput = getByDisplayValue('Initial description');

    await user.clear(nameInput);
    await user.type(nameInput, 'A better description');
    await user.click(
      within(getByTestId('confirmed-textarea-Description')).getByRole('button')
    );

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledExactlyOnceWith('/item/item-id', {
        description: 'A better description'
      })
    );

    await waitFor(() =>
      expect(
        within(getByTestId('confirmed-textarea-Description')).getByRole(
          'button'
        )
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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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

  test('Item marked completed when modal checkbox clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getByLabelText, getByRole, getByText } = render(
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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('More item info'));

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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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

  test('Item marked incomplete when modal checkbox clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const { getAllByDisplayValue, getByLabelText, getByRole } = render(
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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Expand section'));
    await user.click(getByLabelText('More item info'));

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
    for (const nameInput of getAllByDisplayValue('List item name'))
      expect(nameInput).not.toHaveClass('line-through');
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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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
              [new Tag('Tag name', 'Emerald', 'tag-id')],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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
              [new Tag('Tag name', 'Emerald', 'tag-id')],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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

  describe('Timers', () => {
    it('Updates the database when "Start" is pressed', async () => {
      vi.setSystemTime('2026-01-01');
      vi.mocked(api.patch).mockResolvedValue({
        code: 200,
        message: 'Success',
        content: undefined
      });

      const user = userEvent.setup();

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
                      status: 'Unstarted',
                      elapsedMs: 0,
                      id: 'item-id'
                    })
                  ])
                ],
                [],
                true,
                true,
                true,
                'list-id'
              )
            )}
            startingRoles='[]'
          />
        </HeroUIProvider>
      );

      const popoverElement = getByRole('button', { name: 'Elapsed 00:00' });
      const statusButton = getByText('Start');

      await user.click(statusButton);

      expect(api.patch).toHaveBeenCalledExactlyOnceWith(
        '/item/item-id',
        expect.objectContaining({
          status: 'In_Progress',
          dateStarted: new Date()
        })
      );

      expect(statusButton).toHaveTextContent('Pause');
      expect(popoverElement).toHaveAccessibleName('Elapsed 00:00');
    });

    it('Updates the database when "Pause" is pressed', async () => {
      vi.setSystemTime('2026-01-01');
      vi.mocked(api.patch).mockResolvedValue({
        code: 200,
        message: 'Success',
        content: undefined
      });

      const user = userEvent.setup();

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
                      elapsedMs: 2000 * 60,
                      id: 'item-id'
                    })
                  ])
                ],
                [],
                true,
                true,
                true,
                'list-id'
              )
            )}
            startingRoles='[]'
          />
        </HeroUIProvider>
      );

      const popoverElement = getByRole('button', { name: 'Elapsed 00:02' });
      const statusButton = getByText('Pause');

      await user.click(statusButton);

      expect(api.patch).toHaveBeenCalledExactlyOnceWith(
        '/item/item-id',
        expect.objectContaining({
          status: 'Paused',
          dateStarted: null,
          elapsedMs: 2000 * 60
        })
      );

      expect(statusButton).toHaveTextContent('Resume');
      expect(popoverElement).toHaveAccessibleName('Elapsed 00:02');
    });

    // Timer increment behavior still needs dedicated coverage once @testing-library/user-event
    // fully supports Vitest fake timers:
    // https://github.com/testing-library/react-testing-library/issues/1197
  });

  test('Elapsed time goes to 00:00 when time is reset', async () => {
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
                    status: 'Paused',
                    elapsedMs: 1000 * 60 * 5,
                    id: 'item-id'
                  })
                ])
              ],
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    const popoverElement = getByRole('button', { name: 'Elapsed 00:05' });

    await user.click(popoverElement);
    await user.click(getByRole('button', { name: 'Reset' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledExactlyOnceWith(
        '/item/item-id',
        expect.objectContaining({
          status: 'Unstarted',
          elapsedMs: 0
        })
      )
    );

    expect(popoverElement).toHaveAccessibleName('Elapsed 00:00');
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
              [],
              true,
              true,
              true,
              'list-id'
            )
          )}
          startingRoles='[]'
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
