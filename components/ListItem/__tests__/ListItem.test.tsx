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

import { render, within } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import userEvent from '@testing-library/user-event';

import ListItemModel from '@/lib/model/listItem';
import api from '@/lib/api';

import ListItem from '../ListItem';

vi.mock(import('framer-motion'), async importOriginal => {
  const originalFramerMotion = await importOriginal();

  return {
    ...originalFramerMotion,
    LazyMotion: ({ children }) => <div>{children}</div>
  };
});

vi.mock('@/lib/api');

beforeEach(() => {
  vi.resetAllMocks();
});

it('Allows new tags to be created and linked to the item', async () => {
  const item = new ListItemModel('Test item', {});

  vi.mocked(api.post).mockResolvedValue({
    code: 200,
    message: 'Success',
    content: undefined
  });
  const addNewTag = vi.fn(() => Promise.resolve('test-id'));

  const user = userEvent.setup();

  const { getByLabelText } = render(
    <HeroUIProvider disableRipple>
      <ListItem
        addNewTag={addNewTag}
        deleteItem={vi.fn()}
        hasDueDates={false}
        hasTimeTracking={false}
        item={item}
        members={[]}
        resetTime={vi.fn()}
        setCompleted={vi.fn()}
        setPaused={vi.fn()}
        setRunning={vi.fn()}
        tagsAvailable={[]}
        updateDueDate={vi.fn()}
        updateExpectedMs={vi.fn()}
        updatePriority={vi.fn()}
      />
    </HeroUIProvider>
  );

  await user.click(getByLabelText('Update tags'));
  await user.type(getByLabelText('Add tag...'), 'Test tag');
  await user.click(getByLabelText('Pick color'));
  await user.click(getByLabelText('Cyan'));
  await user.click(getByLabelText('Submit'));

  expect(addNewTag).toHaveBeenCalledTimes(1);
  expect(addNewTag).toHaveBeenCalledWith('Test tag', 'Cyan');

  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith(
    `/item/${item.id}/tag/test-id`,
    expect.any(Object)
  );

  expect(
    await within(getByLabelText('Update tags')).findByText('Test tag')
  ).toBeVisible();
});
