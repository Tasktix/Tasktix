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
import { subscribe } from '@/lib/sse/client';

import ListItemGroup from '../ListItemGroup';

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));
vi.mock('@/lib/api');
vi.mock('@/lib/sse/client');
vi.mock(import('@/components/AuthProvider'), async importOriginal => ({
  ...(await importOriginal()),
  useAuth: vi.fn(
    () =>
      ({
        loggedInUser: false,
        setLoggedInUser: vi.fn(),
        oauthConfig: { githubEnabled: false, customEnabled: false }
      }) as const
  )
}));

beforeAll(() => {
  vi.stubEnv('TZ', 'UTC');
});
beforeEach(vi.resetAllMocks);
afterAll(vi.unstubAllEnvs);

const MOCK_ITEM = new ListItem('List item 1', 'list-id', { id: 'item-id' }),
  MOCK_SECTION = new ListSection('List section 1', [MOCK_ITEM]),
  MOCK_LIST = new ListModel(
    'List',
    'Amber',
    [],
    [MOCK_SECTION],
    [],
    true,
    true,
    true,
    { id: 'list-id' }
  );

const MOCK_ITEM_COMPLETE = new ListItem('List item 2', 'list-id', {
    id: 'item-id-2',
    status: 'Completed',
    dateCompleted: new Date()
  }),
  MOCK_SECTION_ITEMS_COMPLETE = new ListSection('List section 2', [
    MOCK_ITEM_COMPLETE
  ]),
  MOCK_LIST_ITEMS_COMPLETE = new ListModel(
    'List 2',
    'Pink',
    [],
    [MOCK_SECTION_ITEMS_COMPLETE],
    [],
    true,
    true,
    true,
    {}
  );

const MOCK_ITEM_3 = new ListItem('List item 3', 'list-id', { id: 'item-id-3' }),
  MOCK_SECTION_3 = new ListSection('List section 3', [MOCK_ITEM_3]),
  MOCK_LIST_OPTIONS_DISABLED = new ListModel(
    'List 3',
    'Emerald',
    [],
    [MOCK_SECTION_3],
    [],
    false,
    false,
    false,
    { id: 'list-id-3' }
  );

describe('Initial display', () => {
  it('Displays alternate text if no lists', () => {
    const { queryByText } = render(
      <ListItemGroup
        alternateText='Nothing to see here!'
        startingLists='[]'
        startingRoles='[]'
      />
    );

    expect(queryByText('Nothing to see here!')).toBeVisible();
  });

  it('Displays alternate text if no incomplete items', () => {
    const { queryByText } = render(
      <ListItemGroup
        alternateText='No incomplete items'
        startingLists={JSON.stringify([MOCK_LIST_ITEMS_COMPLETE])}
        startingRoles='[]'
      />
    );

    expect(queryByText('No incomplete items')).toBeVisible();
  });

  it('Displays all list item data that the list is configured to track', () => {
    const { getByTestId } = render(
      <ListItemGroup
        alternateText='No incomplete items'
        startingLists={JSON.stringify([MOCK_LIST, MOCK_LIST_OPTIONS_DISABLED])}
        startingRoles='[]'
      />
    );

    const item1 = getByTestId(`wrapper-${MOCK_ITEM.name}`);
    const item2 = getByTestId(`wrapper-${MOCK_ITEM_3.name}`);

    expect(within(item1).getByDisplayValue(MOCK_ITEM.name)).toBeVisible();
    expect(within(item2).getByDisplayValue(MOCK_ITEM_3.name)).toBeVisible();

    expect(within(item1).getByText(MOCK_LIST.name)).toBeVisible();
    expect(
      within(item2).getByText(MOCK_LIST_OPTIONS_DISABLED.name)
    ).toBeVisible();

    expect(within(item1).getByText('Due Today')).toBeVisible();
    expect(within(item2).queryByText('Due Today')).not.toBeInTheDocument();

    expect(within(item1).getByText('Expected')).toBeVisible();
    expect(within(item2).queryByText('Expected')).not.toBeInTheDocument();
  });
});

describe('Item state changes', () => {
  test('List name updates when event received', () => {
    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({
        type: 'SetListName',
        id: MOCK_LIST.id,
        name: 'New list name'
      });

      return vi.fn();
    });

    const { getByText } = render(
      <HeroUIProvider disableRipple>
        <ListItemGroup
          alternateText='All caught up!'
          startingLists={JSON.stringify([MOCK_LIST])}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    expect(getByText('New list name')).toBeVisible();
  });

  test('List color updates when event received', () => {
    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({ type: 'SetListColor', id: MOCK_LIST.id, color: 'Blue' });

      return vi.fn();
    });

    const { getByText } = render(
      <HeroUIProvider disableRipple>
        <ListItemGroup
          alternateText=''
          startingLists={JSON.stringify([{ ...MOCK_LIST, color: 'Amber' }])}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    expect(getByText(MOCK_LIST.name).parentElement).toHaveClass(
      'text-blue-500'
    );
  });

  test("Item due dates' visibility toggles when event received", () => {
    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({
        type: 'SetHasDueDates',
        id: MOCK_LIST.id,
        hasDueDates: true
      });

      return vi.fn();
    });

    const { getByTestId } = render(
      <HeroUIProvider disableRipple>
        <ListItemGroup
          alternateText=''
          startingLists={JSON.stringify([{ ...MOCK_LIST, hasDueDates: false }])}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    const item1 = getByTestId(`wrapper-${MOCK_ITEM.name}`);

    expect(within(item1).getByText('Due Today')).toBeVisible();
  });

  test('Item time tracking visibility toggles when event received', () => {
    vi.mocked(subscribe).mockImplementation((_, onMessage) => {
      onMessage({
        type: 'SetHasTimeTracking',
        id: MOCK_LIST.id,
        hasTimeTracking: false
      });

      return vi.fn();
    });

    const { queryByText } = render(
      <HeroUIProvider disableRipple>
        <ListItemGroup
          alternateText=''
          startingLists={JSON.stringify([
            {
              ...MOCK_LIST,
              hasTimeTracking: true
            }
          ])}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    expect(queryByText('Expected')).not.toBeInTheDocument();
  });
});

describe('Tag changes', () => {
  const MOCK_TAG = new Tag('Test tag', 'Amber');

  test('Allows tags to be added for items in one list only', async () => {
    const user = userEvent.setup();

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

    const {
      getByLabelText,
      getByTestId,
      getByText,
      queryByLabelText,
      queryByText
    } = render(
      <HeroUIProvider disableRipple>
        <ListItemGroup
          alternateText=''
          startingLists={JSON.stringify([
            { ...MOCK_LIST, tags: [MOCK_TAG] },
            MOCK_LIST_OPTIONS_DISABLED
          ])}
          startingRoles='[]'
        />
      </HeroUIProvider>
    );

    const item1 = getByTestId(`wrapper-${MOCK_ITEM.name}`);
    const item2 = getByTestId(`wrapper-${MOCK_ITEM_3.name}`);

    await user.click(within(item1).getByLabelText('Update tags'));
    await waitFor(() => expect(getByText(MOCK_TAG.name)).toBeVisible());

    await user.click(within(item2).getByLabelText('Update tags'));
    await waitFor(() => expect(getByText(MOCK_TAG.name)).not.toBeVisible());

    await user.type(getByLabelText('New tag name'), 'New tag');
    await user.click(getByLabelText('Pick color'));
    await user.click(getByLabelText('Cyan'));

    await user.click(
      // We know the DOM, so we know this element does have a parent form - skipcq: JS-0339
      within(getByLabelText('New tag name').closest('form')!).getByLabelText(
        'Submit'
      )
    );

    expect(api.post).toHaveBeenCalledTimes(2);
    expect(api.post).toHaveBeenCalledWith('/list/list-id-3/tag', {
      name: 'New tag',
      color: 'Cyan'
    });
    expect(api.post).toHaveBeenCalledWith(
      '/item/item-id-3/tag/tag-id',
      expect.any(Object)
    );

    await user.click(within(item2).getByLabelText('Update tags'));
    await waitFor(() => expect(getByText('New tag')).toBeVisible());
    expect(queryByText(MOCK_TAG.name)).not.toBeInTheDocument();
    expect(within(item2).getByLabelText('Update tags')).toHaveTextContent(
      'New tag'
    );

    await user.click(within(item1).getByLabelText('Update tags'));
    await waitFor(() => expect(getByText(MOCK_TAG.name)).toBeVisible());
    expect(queryByLabelText('Add New tag to item')).not.toBeInTheDocument();
  });
});
